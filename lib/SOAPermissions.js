!function() {

	var   Class 		        = require('ee-class')
        , log                   = require('ee-log')
        , type                  = require('ee-types')
        , TTLCache              = require('cachd')
        , asyncMethod           = require('async-method')
        , Permission            = require('./Permission')
        , RoleManager           = require('./RoleManager')
        , Token                 = require('./Token')
        , PermissionSet         = require('./PermissionSet')
		, RestrictionManager 	= require('./RestrictionManager')
        , ORM
        ;




    /**
     * The main class of the module. It manages caches and managers in order
     * to provide super fast permissions data.
     *
     * @module ee-soa-permission
     * @class SOAPermissions
     */



	module.exports = new Class({

        // cahce timeouts
          tokenExpiration: 3600
        , permissionExpiration: 600
        , permissionSetExpiration: 600
        , restrictionExpiration: 600
        , restrictionSetExpiration: 600

        // cache sizes
        , tokenCacheLength: 10000
        , permissionCacheLength: 10000
        , permissionSetCacheLength: 10000
        , restrictionCacheLength: 200
        , restrictionSetCacheLength: 1000


		// last updated tiemstamp fo the token table
		, tokenLastUpdated: new Date()
		, tokenHighestExpires: new Date()

		// interval in ms of the token validty check
		, tokenCheckInterval: 60000







        /**
         * Constructor method
         *
         * @param {object} options Options object
         * @param {object} options.db Related ORM db instance, used to load permissions
         * @param {number} [options.tokenExpiration=3600] The time in seconds the tokens
         *                 should be cached
         * @param {number} [options.tokenCacheLength=10000] How many tokens to store in
         *                 the cache
         * @param {number} [options.permissionExpiration=3600] The time in seconds the
         *                 permissions should be cached
         * @param {number} [options.permissionCacheLength=10000] How many permissions to
         *                 store in the cache
         * @param {number} [options.permissionSetExpiration=3600] The time in seconds the
         *                 permissions sets should be cached
         * @param {number} [options.permissionSetCacheLength=10000] How many permission
         *                 sets to store in the cache
         */
		, init: function(options) {
            this.db = options.db;

            // cache timings
            if (options.tokenExpiration) this.tokenExpiration = options.tokenExpiration;
            if (options.permissionExpiration) this.permissionExpiration = options.permissionExpiration;
            if (options.permissionSetExpiration) this.permissionSetExpiration = options.permissionSetExpiration;
            if (options.restrictionExpiration) this.restrictionExpiration = options.restrictionExpiration;
            if (options.restrictionSetExpiration) this.restrictionSetExpiration = options.restrictionSetExpiration;

            // cahce sizes
            if (options.tokenCacheLength) this.tokenCacheLength = options.tokenCacheLength;
            if (options.permissionCacheLength) this.permissionCacheLength = options.permissionCacheLength;
            if (options.permissionSetCacheLength) this.permissionSetCacheLength = options.permissionSetCacheLength;
            if (options.restrictionCacheLength) this.restrictionCacheLength = options.restrictionCacheLength;
            if (options.restrictionSetCacheLength) this.restrictionSetCacheLength = options.restrictionSetCacheLength;

            // need this to build filters
            ORM = this.db.getORM();

            // initialize caches
            this._setUpCaches();


			// set up the restirctions manager
			this.restrictions = new RestrictionManager(this);


            // self refresing cache for roles
            this.roleManager = new RoleManager(options);

			// start the token checker somewhat delayed
			setTimeout(this.checkTokenValidity.bind(this), 5000);
		}



        /**
         * set up the different caches
         *
         * @private
         */
        , _setUpCaches: function() {

            // cache tokens with a simple lru cache
            // let them expire after a certain amount of time
            this.tokenCache = new TTLCache({
                  ttl           : this.tokenExpiration*1000
                , maxLength     : this.tokenCacheLength
            });

            // cache permissions with a simple lru cache
            // let them expire after a certain amount of time
            this.permissionCache = new TTLCache({
                  ttl           : this.permissionExpiration*1000
                , maxLength     : this.permissionCacheLength
            });

            // cache permisson sets with a simple lru cache
            // let them expire after a certain amount of time
            this.permissionSetCache = new TTLCache({
                  ttl           : this.permissionSetExpiration*1000
                , maxLength     : this.permissionSetCacheLength
            });
        }





        /**
         * Gets the permissions set for one or more accesTokens
         *
         * @param {string[]} tokens Array containing access tokens
         *
         * @callback {getPermissionCallback} If a callback is provided
         *      it returns  with an error and / or a permission object.
         *      if the callback is omitted a promise is returned instead
         */
        , getPermission: asyncMethod(function(tokens, callback) {
            var hash;

            // we need an array. yup, i'm lazy as fuck!
            if (!type.array(tokens)) tokens = [tokens];

            // tokens may be objects, get strings
            tokens = tokens.map(function(token) {
                return type.object(token) ? token.toString() : token;
            });

            // array needs to be sorted to be able to create a hash
            // we're caching all permmisson sets for some time
            hash = tokens.sort().join('|');

            // get tokens hash
            if (this.permissionSetCache.has(hash)) callback(null, this.permissionSetCache.get(hash));
            else {
                // we're returning a permissionSet the user may have requested
                // permissions for multiple tokens. load missing permissions from the db
                Promise.all(tokens.map(function(token) {
                    if (this.permissionCache.has(token)) return Promise.resolve(this.permissionCache.get(token));
                    else return this.loadPermission(token);
                }.bind(this))).then(function(permissions) {
					var set;

					// filter entries which returned no permissions
					permissions = permissions.filter(function(permission) {
						return !!permission;
					});

					// create the permissions set
                    set = new PermissionSet(permissions, hash);


					// load the row restirctions
					return this.restrictions.get(set.getRoles()).then(function(restrictionSet) {

						// add to the permissions set
						set.setRestrictionSet(restrictionSet);


						// remove the set from the cache if its not of any use
						// anymore
						set.once('delete', function() {
							if (this.permissionSetCache.has(hash)) this.permissionSetCache.remove(hash);
						}.bind(this));

	                    // add to lru cache
	                    this.permissionSetCache.set(hash, set);

	                    // return
	                    callback(null, set);
					}.bind(this));
                }.bind(this)).catch(callback);
            }
        })







        /**
         * Loads a permission for one token
         *
         * @private
         *
         * @param {string} token Access token
         * @callback {loadPermissionCallback} If a callback is provided
         *      it returns  with an error and / or a permission object.
         *      if the callback is omitted a promise is returned instead
         */
        , loadPermission: asyncMethod(function(token, callback) {

            // get token data (user, tenant, service and their roles)
            this.loadToken(token).then(function(tokenInstance) {

				if (!tokenInstance) callback();
				else {

	                // yay, check if the roles are loaded
	                return Promise.all(tokenInstance.getRoles().map(function(roleName) {
	                    return this.roleManager.getRole(roleName);
	                }.bind(this))).then(function(roles) {
	                    var permission = new Permission(tokenInstance, roles);

	                    // cache
	                    this.permissionCache.set(token, permission);

						// remove the permissions from cache if they are not valid anymore
						permission.once('delete', function() {
							if (this.permissionCache.has(token)) this.permissionCache.remove(token);
						}.bind(this));


	                    // return
	                    callback(null, permission);
	                }.bind(this));
				}
            }.bind(this)).catch(callback);
        })






        /**
         * Loads the app / service / user in exchange for
         * an accessToken
         *
         * @private
         *
         * @param {string} token Access token
         * @callback {loadPermissionCallback} If a callback is provided
         *      it returns  with an error and / or a permission object.
         *      if the callback is omitted a promise is returned instead
         */
        , loadToken: asyncMethod(function(token, callback) {
            var query;

            query = this.db.accessToken('token', {
                  token: token
                , expires: ORM.or(ORM.gt(new Date()), null)
				, deleted: null
            });

            // get the user
			if (this.db.tenant) {
	            query.getUser('*')
	                .fetchUserProfile('*')
	                .fetchUserLoginEmail('email')
	                .fetchTenant('name')
	                .getUserGroup('id')
	                .getRole('identifier');
			}
			else {
				query.getUser('*')
	                .fetchUserProfile('*')
	                .fetchUserLoginEmail('email')
	                .getUserGroup('id')
	                .getRole('identifier');
			}


            // get the service
			if (this.db.tenant) {
	            query.getService(['id', 'identifier'])
					.fetchTenant('name')
	                .getRole('identifier');
			}
			else {
				query.getService(['id', 'identifier'])
	                .getRole('identifier');
			}


            // get the stuff
            query.findOne().then(function(accessToken) {
                if (!accessToken) callback();
                else {
                    var tokenInstance = new Token(accessToken);

					// remove expired tokens
					tokenInstance.once('delete', function() {
						if (this.tokenCache.has(token)) this.tokenCache.remove(token);
					}.bind(this));


                    // cache it
                    this.tokenCache.set(token, tokenInstance);

                    callback(null, tokenInstance);
                }
            }.bind(this)).catch(callback);
        })





		/**
		 * checks periodically if some of the tokens have expired
		 *
		 * @private
		 */
		, checkTokenValidity: function() {

			// check for the expired ones
			this.db.accessToken('token', {
				expires: ORM.and(ORM.gt(this.tokenHighestExpires), ORM.lt(new Date()), ORM.notNull())
			}).order('expires').limit(100).find().then(function(expiredTokens) {
				expiredTokens.forEach(function(token) {
					if (this.tokenCache.has(token.token)) this.tokenCache.get(token.token).delete();

					// save newest timestamp
					this.tokenHighestExpires = token.expires;
				}.bind(this));

				return Promise.resolve();
			}.bind(this)).then(function() {

				// check for delted tokens
				return this.db.accessToken('token', {
					deleted: ORM.and(ORM.notNull(), ORM.gt(this.tokenLastUpdated))
				}).includeSoftDeleted().order('expires').limit(100).find().then(function(expiredTokens) {
					expiredTokens.forEach(function(token) {
						if (this.tokenCache.has(token.token)) this.tokenCache.get(token.token).delete();

						// save newest timestamp
						this.tokenLastUpdated = token.deleted;
					}.bind(this));

					return Promise.resolve();
				}.bind(this))
			}.bind(this)).then(function() {
				setTimeout(this.checkTokenValidity.bind(this), this.tokenCheckInterval);
			}.bind(this)).catch(function(err) {
				log('Failed to check for deleted tokens', err);

				setTimeout(this.checkTokenValidity.bind(this), this.tokenCheckInterval);
			}.bind(this));
		}
	});
}();




/**
 * Callback for the getPermission method.
 *
 * @callback getPermissionCallback
 * @param {Error=} err Error object if an error occured
 * @param {PermissionSet=} permission A permissionSet object
 */



/**
 * Callback for the loadPermission method.
 *
 * @callback loadPermissionCallback
 * @param {Error=} err Error object if an error occured
 * @param {Permission=} permission A permissions object
 */
