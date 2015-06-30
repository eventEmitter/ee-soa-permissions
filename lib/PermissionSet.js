!function() {

    var   Class         = require('ee-class')
        , log           = require('ee-log');


    /**
     * The Permissions Set Class exposes an interface to query the permissions for
     * multiple AccessTokens. The class is exposed to the the user.
     *
     * @module ee-soa-permission
     * @class PermissionSet
     */




    module.exports = new Class({



        /**
         * Permission Set constructor. Instantiatedd by the factory!
         *
         * @param {Array} permissions Permissions array
         */
        init: function(permissions) {

            // set up the role storage
            this.permissions = permissions;
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
            return this.permissions.some(function(permission) {
                return permission.isActionAllowed(objectName, actionName);
            });
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
         * returns the first user found
         *
         * @returns {object|null} the user or null
         */
        , getFirstUser: function() {
            return this.hasUser() ? this.getUsers()[0] : null;
        }





        /**
         * returns the service for the permisson if there are any
         *
         *@returns {object[]} an array containing zero or more services
         */
        , getServices: function() {
            var services = [];

            this.permissions.forEach(function(permission) {
                if (permission.hasService()) services.push(permission.getService());
            });

            return services;
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
         * returns a row restrictions object which can be fed
         * into the related orm
         */
        , getRowRestrictions: function() {

        }
    });
}();
