!function() {

    var   Class         = require('ee-class')
        , log           = require('ee-log');


    /*
     *
     * abstract permission entity which can be used by the user 
     * fro checking permissions
     */

    module.exports = new Class({



        init: function(token, role) {
            
        }



        /**
         * checks wheter an action is allowed
         */
        , isActionAllowed: function(entityName, actionName) {

        }



        /**
         * a permission may be attached to an user
         */
        , hasUser: function() {

        }


        /**
         * a permission may be attached to a service
         */
        , hasService: function(serviceName) {

        }



        /**
         * checck if the permissions has a role
         */
        , hasRole: function(roleName) {

        }



        /**
         * checks if the permission has a specifi capcability
         */
        , hasCapability: function(capcabilityName) {

        }



        /**
         * returns all roles the permission has
         */
        , getRoles: function() {

        }


        /**
         * permissions get cached, sometimes the roles must be updated
         */
        , setRoles: function() {

        }







        /**
         * returns a row restrictions object which can be fed
         * into the related orm
         */
        , getRowRestrictions: function() {

        }
    });
}();
