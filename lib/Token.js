(function() {
    'use strict';

    const Class                 = require('ee-class');
    const log                   = require('ee-log');
    const EventEmitter          = require('ee-event-emitter');



    /**
     * This class represents an access token and the user
     * or service attached to it.
     *
     * @module ee-soa-permission
     * @class Token
     */

    module.exports = new Class({
        inherits: EventEmitter



        /**
         * the classes constructor
         *
         * @param {tokenModel} the model representing the token
         */
        , init: function(tokenData) {
            this.data = tokenData.toJSON();

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

            // add the roles of the apps to the map
            if (this.data && this.data.app && this.data.app.role) {
                this.data.app.role.forEach(function(role) {
                    if (!this.roles[role.identifier]) this.roles[role.identifier] = true;
                }.bind(this));
            }
        }



        /**
         * emits the delete signal to all caches
         */
        , delete: function() {
            this.emit('delete');
        }



        /**
         * returns the token itself
         *
         * @param {sting} the hex encoded token
         */
        , getToken: function() {
            return this.data.token;
        }




        /**
         * checks if this token belongs to a user
         *
         * @returns {boolean} true if this token belongs to an user
         */
        , isUserToken: function() {
            return !!this.data.user;
        }




        /**
         * checks if this token belongs to a app
         *
         * @returns {boolean} true if this token belongs to an app
         */
        , isAppToken: function() {
            return !!this.data.app;
        }




        /**
         * checks if this token belongs to a service
         *
         * @returns {boolean} true if this token belongs to a service
         */
        , isServiceToken: function() {
            return !!this.data.service;
        }




        /**
         * returns the user for the token if its attached
         * to a user
         *
         * @returns {object|null} the user or null
         */
        , getUser: function() {
            return this.isUserToken() ? this.data.user : null;
        }




        /**
         * returns the app for the token if its attached
         * to a app
         *
         * @returns {object|null} the app or null
         */
        , getApp: function() {
            return this.isAppToken() ? this.data.app : null;
        }




        /**
         * returns the service for the token if its attached
         * to a service
         *
         * @returns {object|null} the service or null
         */
        , getService: function() {
            return this.isServiceToken() ? this.data.service : null;
        }




        /**
         * returns the tenant for the token if its attached
         * to a service
         *
         * @returns {object|null} the tenant or null
         */
        , getTenant: function() {
            return this.data.user && this.data.user.tenant ? this.data.user.tenant : (this.data.service && this.data.service.tenant ? this.data.service.tenant : (this.data.app && this.data.app.tenant ? this.data.app.tenant : null));
        }




        /**
         * checks if the user or service has an attached tenant
         *
         * @returns {boolean} true if a tenant was found
         */
        , hasTenant: function() {
            return (this.data.user && this.data.user.tenant) || (this.data.service && this.data.service.tenant) || (this.data.app && this.data.app.tenant);
        }




        /**
         * returns the roles this token has
         *
         * @returns {string[]} an array containing zero or more rolenames
         */
        , getRoles: function() {
            return Object.keys(this.roles);
        }
    });
})();
