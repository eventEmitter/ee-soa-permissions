(function() {
    'use strict';

    const Class         = require('ee-class');
    const type          = require('ee-types');
    const log           = require('ee-log');



    /**
     * This represents a single accesstokne. this can be used
     * by the user to be able to manipulate acecsstokens while
     * they are distributed to several components
     *
     * @module ee-soa-permission
     * @class AcccessToken
     */

    module.exports = new Class({



        /**
         * the classes constructor
         *
         * @param {string} token the accesstoken string
         */
        init: function(token) {
            this.set(token);
        }



        /**
         * set a new token
         *
         * @param {string} token the accesstoken string
         */
        , set: function(token) {
            if (!type.string(token)) throw new Error('The token must be of type string!');
            this.token = token;
        }



        /**
         * returns the token itself
         *
         * @returns {sting} the token
         */
        , get: function() {
            return this.token;
        }




        /**
         * returns the token itself
         *
         * @returns {sting} the token
         */
        , toString: function() {
            return this.token;
        }
    });
})();
