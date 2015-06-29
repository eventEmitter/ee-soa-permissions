!function() {

    var   Class         = require('ee-class')
        , log           = require('ee-log');



    module.exports = new Class({

        init: function(tokenData) {
            this.data = tokenData;

            // role storage
            this.roles = {};

            // create a map of all roles by the user
            if (this.data && this.data.user && this.data.user.userGroup && this.data.user.userGroup.length) {
                this.data.user.userGroup.forEach(function(group) {
                    if (group.role && group.role.length) {
                        group.role.forEach(function(role) {
                            if (!this.roles[role.identifier]) this.roles[role.identifier] = true;
                        }.bind(this));
                    }
                }.bind(this));
            }

            // add the roles of the services to the map
            if (this.data && this.data.service && this.data.service.role) {
                this.data.service.role.forEach(function(role) {
                    if (!this.roles[role.identifier]) this.roles[role.identifier] = true;
                }.bind(this));
            }
        }



        /**
         * returns the token itself
         */
        , getToken: function() {

        }


        /**
         * returns true if the token bleongs to an user
         */
        , isUserToken: function() {

        }



        /**
         * returns true if the token is owned by a service
         */
        , isServiceToken: function() {

        }



        /**
         * checks if the user or service 
         * has an attached tenant
         */
        , hasTenant: function() {

        }



        /**
         * returns the roles this token has
         */
        , getRoles: function() {
            return Object.keys(this.roles);
        }
    });
}();
