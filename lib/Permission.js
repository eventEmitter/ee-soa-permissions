!function() {
    'use strict';

    var   Class         = require('ee-class')
        , log           = require('ee-log')
        , EventEmitter  = require('ee-event-emitter')
        , type          = require('ee-types');


    /**
     * The Permissions Class exposes an interface to query the permissions for one
     * AccessToken. The class is exposed to the the user via the PermissionSet
     * class which proxies almost all methods so the user is able to get the permissions
     * of multiple Permission Class instances. This class cannot be instantiated by the
     * user!
     *
     * @module ee-soa-permission
     * @class Permission
     */




    module.exports = new Class({
        inherits: EventEmitter


        // the token for this permission
        , token: null


        /**
         * Permission constructor. Instantiatedd by the factory!
         *
         * @param {String} token Accesstoken for this permission instance
         * @param {Array} roles Roles belonging to the token
         */
        , init: function(token, roles) {

            // tokens may
            token.once('delete', function() {
                this.token = null;
                this.roles = {};

                // tell the permissions set that this permission has expired
                this.emit('delete');
            }.bind(this));

            // set up the role storage
            this.roles = {};

            // the token for this permission
            this.token = token;

            // store roles
            this.setRoles(roles);
        }






        /**
         * returns the token itself
         *
         * @param {sting} the hex encoded token
         */
        , getToken: function() {
            return this.token ? this.token.getToken() : null;
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
            return Object.keys(this.roles).some(function(roleName) {
                return this.roles[roleName].isActionAllowed(objectName, actionName);
            }.bind(this));
        }







        /**
         * Checks if the token has a user attached to it
         *
         * @returns {bool} True if the token and thus the permission
         *                 has an user
         */
        , hasUser: function() {
            return this.token ? this.token.isUserToken() : false;
        }






        /**
         * Checks if the token has a service attached to it
         *
         * @returns {bool} True if the token and thus the permission
         *                 has a service
         */
        , hasService: function() {
            return this.token ? this.token.isServiceToken() : false;
        }






        /**
         * returns the user for the permisson if exists
         *
         * @returns {object|null} the user or null
         */
        , getUser: function() {
            return this.token ? this.token.getUser() : null;
        }




        /**
         * returns the service for the permisson if it exists
         *
         * @returns {object|null} the service or null
         */
        , getService: function() {
            return this.token ? this.token.getService() : null;
        }







        /**
         * collects all permissions for a given object
         *
         * @param {string} objectName the name of the object to get the permissions for
         * @param {object} permissions object to store the permissions on
         */
        , collectObjectPermissions: function(objectName, permissions) {

            // check all roles
            Object.keys(this.roles).some(function(roleName) {
                this.roles[roleName].collectObjectPermissions(objectName, permissions);
            }.bind(this));
        }





        /**
         * collects all capabilities
         *
         * @param {object} capabilities object to store the capabilities on
         */
        , collectCapabilities: function(capabilities) {

            // check all roles
            Object.keys(this.roles).some(function(roleName) {
                this.roles[roleName].collectCapabilities(capabilities);
            }.bind(this));
        }






        /**
         * returns the row restrictions for a specific entity. All restrictions
         * of all roles are merged and returned.
         *
         * @param {string} entityName the name of the entity to get the
         *                            restrictions for
         * @param {object} restrictions object to save the restrictions in
         */
        , getRowRestrictions: function(entityName, restrictions) {

            // collect the restrictions from all roles
            Object.keys(this.roles).some(function(roleName) {
                this.roles[roleName].getRowRestrictions(entityName, restrictions);
            }.bind(this));
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
            return !!this.roles[roleName];
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
            return Object.keys(this.roles).some(function(roleName) {
                return this.roles[roleName].hasCapability(capcabilityName);
            }.bind(this));
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
         * Set roles on the permission, should not be used by the user
         * because it can have severe side effects. Is used only for
         * caching mechanisms
         *
         * @private
         *
         * @param {array} roles Array containing roles
         *
         * @listens Role:delete
         * @throws {TypeError} the roles parameter has the wring type
         */
        , setRoles: function(roles) {

            if (!type.array(roles)) throw new Error('Expected an array of roles, got «'+type(roles)+'»!');

            // listen for the delete event,
            // remove the role if it was fired
            roles.forEach(function(role) {
                this.roles[role.name] = role;

                // listen only once
                role.once('delete', function(role) {
                    delete this.roles[role.name];
                }.bind(this));
            }.bind(this));
        }
    });
}();
