!function() {

	var   Class 		= require('ee-class')
        , log           = require('ee-log')
        , type          = require('ee-types')
        , TTLCache      = require('cachd')
        , Promise       = (Promise || require('es6-promise').Promise)
        , asyncMethod   = require('async-method')
        , Permission    = require('./Permission')
        , RoleManager   = require('./RoleManager')
        , Token         = require('./Token')
        , PermissionSet = require('./PermissionSet')
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

        // cache sizes
        , tokenCacheLength: 10000
        , permissionCacheLength: 10000
        , permissionSetCacheLength: 10000



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

            // cahce sizes
            if (options.tokenCacheLength) this.tokenCacheLength = options.tokenCacheLength;
            if (options.permissionCacheLength) this.permissionCacheLength = options.permissionCacheLength;
            if (options.permissionSetCacheLength) this.permissionSetCacheLength = options.permissionSetCacheLength;

            // need this to build filters
            ORM = this.db.getORM();

            // initialize caches
            this._setUpCaches();

            // self refresing cache for roles
            this.roleManager = new RoleManager(options);
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
                  ttl           : this.tokenExpiration
                , maxLength     : this.tokenCacheLength
                , minFreeMemory : 500
            });

            // cache permissions with a simple lru cache
            // let them expire after a certain amount of time
            this.permissionCache = new TTLCache({
                  ttl           : this.permissionExpiration
                , maxLength     : this.permissionCacheLength
                , minFreeMemory : 500
            });

            // cache permisson sets with a simple lru cache
            // let them expire after a certain amount of time
            this.permissionSetCache = new TTLCache({
                  ttl           : this.permissionSetExpiration
                , maxLength     : this.permissionSetCacheLength
                , minFreeMemory : 500
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
                    var set = new PermissionSet(permissions);

                    // add to lru cache
                    this.permissionSetCache.set(hash, set);

                    // return
                    callback(null, set);
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

                // yay, check if the roles are loaded
                return Promise.all(tokenInstance.getRoles().map(function(roleName) {
                    return this.roleManager.getRole(roleName);
                }.bind(this))).then(function(roles) {
                    var permission = new Permission(tokenInstance, roles);

                    // cache
                    this.permissionCache.set(token, permission);

                    // return
                    callback(null, permission);
                }.bind(this));
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
            });

            // get the user
            query.getUser('id')
                .fetchUserProfile('*')
                .fetchUserLoginEmail('email')
                .fetchTenant('id')
                .getUserGroup('id')
                .getRole('identifier');


            // get the service
            query.getService('id', 'identifier')
                .getRole('identifier');


            // get the stuff
            query.findOne().then(function(accessToken) {
                if (!accessToken) callback(new Error('Token «'+token+'» not found!'));
                else {
                    var tokenInstance = new Token(accessToken);

                    // cache it
                    this.tokenCache.set(token, tokenInstance);

                    callback(null, tokenInstance);
                }
            }.bind(this)).catch(callback);
        })
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
