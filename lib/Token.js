!function() {

    var   Class         = require('ee-class')
        , log           = require('ee-log');



    module.exports = new Class({

        init: function(tokenData) {
            this.data = tokenData;
        }



        /**
         * returns the token itself
         */
        , gettoken: function() {

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

        }
    });
}();
