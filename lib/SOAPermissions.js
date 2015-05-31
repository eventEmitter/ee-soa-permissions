!function() {

	var   Class 		= require('ee-class')
        , log           = require('ee-log')
        , type          = require('ee-types')
        , RoleManager   = require('./RoleManager')
        , TTLCache      = require('cachd')
        , Permission    = require('./Permission')
        , asyncMethod   = require('async-method')
        , Promise       = (Promise || require('es6-promise').Promise)
        , ORM
        ;



	module.exports = new Class({

		init: function(options) {
            this.db = options.db;

            // cahce timings
            this.tokenExpiration = options.tokenExpiration || 3600;

            // eed this to build filters
            ORM = this.db.getORM();

            // cache tokens with a simple lru cache
            // let them expire after a certain amount of time
            this.tokenCache = new TTLCache({
                  ttl       : this.tokenExpiration
                , maxLength : 10000
            });


            // self refresing cache for roles
            this.roleManager = new RoleManager(options);
		}





        /**
         * returns a permission object for a given token
         */
        , getPermission: asyncMethod(function(tokens, callback) {
            var hash;

            // we need an array
            if (!type.array(tokens)) tokens = [tokens];

            // array needs to be sorted to be able to create a hash
            hash = array.sort().join('|');

            // get tokens hash
            if (this.permissionSetCache.has(hash)) callback(null, this.permissionSetCache.get(hash));
            else {
                // we're returning a permissionSetm the user may have requested 
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
         * load a permission
         */
        , loadPermission: asyncMethod(function(token, callback) {

            // get token data (user, tenant, service and their roles)
            this.loadToken(token).then(function(tokenInstance) {

                // yay, check if the roles are loaded
                return Promise.all(tokenInstance.getRoles().map(function(roleName) {
                    return this.roleManager.get(roleName);
                }.bind(this)));
            }.bind(this)).then(function(roles) {
                var permission = new Permission(tokenInstance, roles);

                // cache
                this.permissionCache.set(token, permission);

                // return
                callback(null, permission);
            }.bind(this)).catch(callback);
        })





        /**
         * loads role data from the db
         */
        , loadRole: asyncMethod(function(roleName) {
            var query;

            query = this.db.role('identifier', {
                identifier: roleName
            });

            // get capabilities
            query.getCapability('identifier');

            // get permissions
            query.getPermission('id')
                .fetchPermissionAction('identifier')
                .getPermissionObject('identifier')
                .getPermissionObjectType('identifier');

            // row restrictions
            query.getRole_rowRestriction('inverted')
                .getRoleRestriction(['column', 'value'])
                .fetchRowRestrictionEntity('identifier')
                .fetchRowRestrictionOperator('identifier')
                .fetchRowRestrictionValueType('identifier');

            // get from db
            query.findOne().then(function(role) {
                if (!role) callback(new Error('Role «'+roleName+'» not found!'));
                else {
                    var roleInstance = new Role(role);

                    // cache the shit
                    this.roleCache.set(roleName, role);

                    callback(null, roleInstance);
                }
            }.bind(this)).catch(callback);

        })




        /**
         * gets the app / service / user in exchange for 
         * an accessToken
         */
        , loadToken:asyncMethod function(token, callback) {
            var query;

            query = this.db.accessToken('token', {
                  token: token
                , expires: ORM.gt(now())
            });

            // get the user
            query.getUser('id').fetchTenant('id').getRole('identifier');
            

            // get the service
            query.getService('id').fetchTenant('id').getRole('identifier');


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
