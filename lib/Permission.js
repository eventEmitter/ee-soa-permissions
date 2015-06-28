!function() {

    var   Class         = require('ee-class')
        , log           = require('ee-log');


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


        // the token for this permission
        token: null


        /**
         * Permission constructor. Instantiatedd by the factory!
         * 
         * @param {String} token Accesstoken for this permission instance
         * @param {Array} roles Roles belonging to the token
         */
        , init: function(token, roles) {
            
            // set up the role storage
            this.roles = {};

            // the token for this permission
            this.token = token;

            // store roles
            this.setRoles(roles);
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

        }







        /**
         * Checks if the token has a user attached to it
         *
         * @returns {bool} True if the token and thus the permission
         *                 has an user
         */
        , hasUser: function() {
            return this.token? this.token.isUserToken() : false;
        }






        /**
         * Checks if the token has a service attached to it
         *
         * @returns {bool} True if the token and thus the permission
         *                 has a service
         */
        , hasService: function() {
            return this.token ? this.token,isServicetoken() : false;
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

            if (!type.array(roles)) throw new Error('Expected an array of roles, got «'+type(roles)+'»!')

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







        /**
         * returns a row restrictions object which can be fed
         * into the related orm
         */
        , getRowRestrictions: function() {

        }
    });
}();
