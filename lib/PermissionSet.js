(function() {
    'use strict';

    const Class         = require('ee-class');
    const type          = require('ee-types');
    const log           = require('ee-log');
    const EventEmitter  = require('ee-event-emitter');
    const argv          = require('ee-argv');


    /**
     * The Permissions Set Class exposes an interface to query the permissions for
     * multiple AccessTokens. The class is exposed to the the user.
     *
     * @module ee-soa-permission
     * @class PermissionSet
     */




    module.exports = new Class({
        inherits: EventEmitter


        /**
         * Permission Set constructor. Instantiatedd by the factory!
         *
         * @param {Array} permissions Permissions array
         */
        , init: function(permissions, cacheKey, rateLimitManager) {

            // store the ratelimit manager
            Object.defineProperty(this, 'rateLimitManager', {value: rateLimitManager, enumerable: false});

            // set up the role storage
            Object.defineProperty(this, 'permissions', {value: permissions, enumerable: false});

            // storage for roles
            Object.defineProperty(this, 'roles', {value: [], enumerable: false});


            // the key used for caching this
            Object.defineProperty(this, 'cacheKey', {value: cacheKey, enumerable: false});

            // remove permissions that have been deleted from the db
            permissions.forEach(function(permission) {

                // we need to collect all roles
                var roles = permission.getRoles();

                Object.keys(roles).forEach(function(roleName) {
                    this.roles.push(roles[roleName]);
                }.bind(this));

                // remove again
                permission.once('delete', function() {
                    var index = permissions.indexOf(permission);

                    // delete
                    if (index) permissions.splice(index, 1);

                    // remove expired permission sets
                    if (permissions.length === 0) this.emit('delete');

                    // remove roles from role list
                    Object.keys(roles).forEach(function(roleName) {
                        var index = this.roles.indexOf(roles[roleName]);

                        if (index >= 0) this.roles.splice(index, 1);
                    }.bind(this));
                }.bind(this));
            }.bind(this));
        }





        



        , payRateLimit: function(cost) {
            return Promise.all(this.permissions.map((permission) => {
                if (permission.hasApp()) return this.rateLimitManager.pay(permission.getToken(), cost);
                else return Promise.resolve();
            })).then((results) => {
                return Promise.resolve(results.reduce((input, info) => {
                    if (type.object(info)) {
                        if (!input) return info;
                        else {
                            // check which limit has left less
                            if (info.left < input.left) return info;
                            else return input;
                        }
                    } else return input;
                }, null));
            });
        }








        , getRateLimitInfo: function() {
            return Promise.all(this.permissions.map((permission) => {
                if (permission.hasApp()) return this.rateLimitManager.getLimit(permission.getToken());
                else return Promise.resolve();
            })).then((results) => {
                return Promise.resolve(results.reduce((input, info) => {
                    if (type.object(info)) {
                        if (!input) return info;
                        else {
                            // check which limit has left less
                            if (info.left < input.left) return info;
                            else return input;
                        }
                    } else return input;
                }, null));
            });
        }








        /**
         * checks wheter an action on a specific object is allowed
         *
         * @param {string} objectName The name of the object to check the permission for
         * @param {string} actionName The name of the action to check the permission for
         *
         * @param {bool} True if the token is allowed to execute the given action
         *                  for the given object
         */
        , isActionAllowed: function(objectName, actionName) {
            if (argv.has('no-permissions')) return true;
            else {
                return this.permissions.some(function(permission) {
                    return permission.isActionAllowed(objectName, actionName);
                });
            }
        }







        /**
         * Checks if the token has a user attached to it
         *
         * @returns {bool} True if the token and thus the permission
         *                 has an user
         */
        , hasUser: function() {
            return this.permissions.some(function(permission) {
                return permission.hasUser();
            });
        }








        /**
         * Checks if the token has an app attached to it
         *
         * @returns {bool} True if the token and thus the permission
         *                 has an app
         */
        , hasApp: function() {
            return this.permissions.some(function(permission) {
                return permission.hasApp();
            });
        }







        /**
         * Checks if the token has a tenant attached to it
         *
         * @returns {bool} True if the token and thus the permission
         *                 has an tenant
         */
        , hasTenant: function() {
            return this.permissions.some(function(permission) {
                return permission.hasTenant();
            });
        }






        /**
         * Checks if the token has a service attached to it
         *
         * @returns {bool} True if the token and thus the permission
         *                 has a service
         */
        , hasService: function() {
            return this.permissions.some(function(permission) {
                return permission.hasService();
            });
        }






        /**
         * returns the user for the permisson set if there are any
         *
         * @returns {object[]} an array containing zero or more users
         */
        , getUsers: function() {
            var users = [];

            this.permissions.forEach(function(permission) {
                if (permission.hasUser()) users.push(permission.getUser());
            });

            return users;
        }





        /**
         * returns the user for the permisson set if there are any
         *
         * @returns {object[]} an array containing zero or more users
         */
        , getApps: function() {
            var apps = [];

            this.permissions.forEach(function(permission) {
                if (permission.hasApp()) apps.push(permission.getApp());
            });

            return apps;
        }






        /**
         * returns all tenants attached to all tokens
         *
         * @returns {object[]} an array containing zero or more tenants
         */
        , getTenant: function() {
            var tenants = [];

            this.permissions.forEach(function(permission) {
                if (permission.hasTenant()) {
                    tenants.push(permission.getTenant());
                }
            });

            return tenants;
        }









        /**
         * returns the tenant of all usertokens
         *
         * @returns {object[]} an array containing zero or more tenants
         */
        , getUserTenant: function() {
            var tenants = [];

            this.permissions.forEach(function(permission) {
                if (permission.hasTenant() && permission.hasUser()) {
                    tenants.push(permission.getTenant());
                }
            });

            return tenants;
        }







        /**
         * returns the tenant of the first found user token
         *
         * @returns {object|null} an object representing the tenant 
         */
        , getFirstUserTenant: function() {
            let tentants = this.getUserTenant();
            return tentants.length ? tentants[0] : null;
        }






        /**
         * returns the first user found
         *
         * @returns {object|null} the user or null
         */
        , getFirstUser: function() {
            return this.hasUser() ? this.getUsers()[0] : null;
        }







        /**
         * returns the first app found
         *
         * @returns {object|null} the app or null
         */
        , getFirstApp: function() {
            return this.hasApp() ? this.getApps()[0] : null;
        }





        /**
         * returns the first tenant found
         *
         * @returns {object|null} the tenant or null
         */
        , getFirstTenant: function() {
            return this.hasTenant() ? this.getTenant()[0] : null;
        }





        /**
         * returns the service for the permisson if there are any
         *
         * @returns {object[]} an array containing zero or more services
         */
        , getServices: function() {
            var services = [];

            this.permissions.forEach(function(permission) {
                if (permission.hasService()) services.push(permission.getService());
            });

            return services;
        }







        /**
         * returns all permissions for a given object
         *
         * @param {string} objectName the name of the object to get the permissions for
         * @param {object} [permissions={}] optional object to store the permissions on
         *
         * @returns {object} an object containing all permissions
         *                   as key value pairts
         */
        , getObjectPermissions: function(objectName, permissions) {
            if (!type.string(objectName)) throw new Error('The getObjectPermissions method expects a string as objectName, got «'+type(objectName)+'»!');

            // each permission writes its own permission to this object
            permissions = permissions || {};

            // ask each permission to set its permissions
            this.permissions.forEach(function(permission) {
                permission.collectObjectPermissions(objectName, permissions);
            });

            // return the definition
            return permissions;
        }





        /**
         * returns all capabilities
         *
         * @param {object} [permissions={}] optional object to store the capabilities on
         *
         * @returns {object} an object containing all capabilities
         *                   as key value pairts
         */
        , getCapabilities: function(capabilities) {

            // each permission writes its own capabilities to this object
            capabilities = capabilities || {};

            // ask each permission to set its capabilities
            this.permissions.forEach(function(permission) {
                permission.collectCapabilities(capabilities);
            });

            // return the definition
            return capabilities;
        }






        /**
         * store the row restirctions on the permissions set
         *
         * @param {restrictionSet} restrictionSet
         */
        , setRestrictionSet: function(restrictionSet) {
            Object.defineProperty(this, 'restrictionSet', {value: restrictionSet, enumerable: false});
        }





        /**
         * returns the row restrictions for a specific entity. All restrictions
         * of all roles are merged and returned.
         *
         * @returns {object[]} object containing filter definitions
         */
        , getRowRestrictions: function() {
            return this.restrictionSet;
        }




        /**
         * Checks if the token has a specific role attached to it
         *
         * @param {string} roleName The name of the role
         *
         * @returns {bool} True if the token and thus the permission
         *                 has a specific role
         */
        , hasRole: function(roleName) {
            return this.permissions.some(function(permission) {
                return permission.hasRole(roleName);
            });
        }






        /**
         * Checks if the token has a specific capability attached to it
         *
         * @param {string} capcabilityName The name of the capability
         *
         * @returns {bool} True if the token and thus the permission
         *                 has a specific capability
         */
        , hasCapability: function(capcabilityName) {
            return this.permissions.some(function(permission) {
                return permission.hasCapability(capcabilityName);
            });
        }




        /**
         * returns all data for all the tokens
         */
        , getInfo: function() {
            var info = {permissions: {}, capabilities: {}};

            // get roles
            info.roles = this.getRoles();

            // collect all permissions and capabilities
            this.permissions.forEach(function(permission) {
                permission.collectPermissionInfo(info.permissions);
                permission.collectCapabilities(info.capabilities);
            });

            // we got everything
            return info;
        }




        /**
         * Returns all the roles attached to the token and thus this permission
         *
         * @returns {array} roles Roles
         */
        , getRoles: function() {
            return this.roles;
        }




        /**
         * returns the identities that are used by this permission as string
         * 
         * @returns {string} identity
         */
        , getIdentity: function() {
            const identities = [];

            this.getServices().forEach((service) => {
                identities.push({
                      type: 'service'
                    , tenant: service.tenant ? service.tenant.name : null
                    , roles: service.role ? service.role.map(r => r.identifier) : []
                    , identifier: service.identifier
                });
            });


            this.getApps().forEach((app) => {
                identities.push({
                      type: 'app'
                    , tenant: app.company.tenant ? app.company.tenant.name : null
                    , roles: app.role ? app.role.map(r => r.identifier) : []
                    , identifier: `${app.identifier}; company:${app.company.identifier}`
                });
            });


            this.getUsers().forEach((user) => {
                const roles = [];

                user.userGroup.forEach((group) => {
                    if (group.role) group.role.forEach(role => roles.push(role.identifier));
                });

                identities.push({
                      type: 'user'
                    , tenant: user.tenant ? user.tenant.name : null
                    , roles: roles
                    , identifier: `${user.userLoginEmail.email}; userGroups:${user.userGroup.map(g => g.identifier).join('/')}`
                });
            });


            return identities.map((identity) => {
                return `[${identity.type}:${identity.identifier}; tenant:${identity.tenant || 'none'}; roles:${identity.roles.join('/')}]`;
            }).join('');
        }
    });
})();
