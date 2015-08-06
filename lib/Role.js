!function() {
    'use strict';

    var   Class         = require('ee-class')
        , EventEmitter  = require('ee-event-emitter')
        , log           = require('ee-log');






    module.exports = new Class({
        inherits: EventEmitter


        , name: ''



        , init: function(roleData) {
            this.name = roleData.identifier;

            // set new data
            this.update(roleData);
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
            return this.permissions[objectName] && this.permissions[objectName][actionName];
        }






        /**
         * collects all permissions for a given object
         *
         * @param {string} objectName the name of the object to get the permissions for
         * @param {object} permissions object to store the permissions on
         */
        , collectObjectPermissions: function(objectName, permissions) {

            // check if wee got any permissions
            if (this.permissions[objectName]) {
                Object.keys(this.permissions[objectName]).forEach(function(actionName) {
                    if (!permissions[actionName]) permissions[actionName] = {allowed: true, roles: []};
                    if (permissions[actionName].roles.indexOf(this.name) === -1) permissions[actionName].roles.push(this.name);
                }.bind(this));
            }
        }





        /**
         * collects all permissions
         *
         * @param {object} permissions object to store the permissions on
         */
        , collectPermissionInfo: function(permissions) {

            // check if wee got any permissions
            Object.keys(this.permissions).forEach(function(objectName) {
                if (!permissions[objectName]) permissions[objectName] = {};

                Object.keys(this.permissions[objectName]).forEach(function(actionName) {
                    if (!permissions[objectName][actionName]) permissions[objectName][actionName] = {allowed: true, roles: []};
                    if (permissions[objectName][actionName].roles.indexOf(this.name) === -1) permissions[objectName][actionName].roles.push(this.name);
                }.bind(this));
            }.bind(this));
        }






        /**
         * collects all capabilities
         *
         * @param {object} capabilities object to store the capabilities on
         */
        , collectCapabilities: function(capabilities) {

            // check if wee got any capabilities
            Object.keys(this.capabilities).forEach(function(capabilityName) {
                if (!capabilities[capabilityName]) capabilities[capabilityName] = {roles: []};
                if (capabilities[capabilityName].roles.indexOf(this.name) === -1) capabilities[capabilityName].roles.push(this.name);
            }.bind(this));
        }







        /**
         * checks if this role has a specific capability
         *
         * @param {string} capcabilityName capability name
         *
         * @returns {bool} true if the role has a capability
         */
        , hasCapability: function(capcabilityName) {
            return !!this.capabilities[capcabilityName];
        }





        /**
         * returns all ids of all restrictions linked to this role
         *
         * @returns {integer[]} restriction ids
         */
        , getRestrictionIds: function() {
            return this.restrictionIds;
        }






        /**
         * store role related data so it can easy be queried
         */
        , update: function(roleData) {
            // build hahmaps from the relational data

            // rebuild caches
            this.permissions = {};
            this.capabilities = {};


            // prepare permissions
            roleData.permission.forEach(function(permission) {
                var   objectIdentifier = permission.permissionObject.identifier
                    , actionIdentifier = permission.permissionAction.identifier;

                if (!this.permissions[objectIdentifier]) this.permissions[objectIdentifier] = {};
                if (!this.permissions[objectIdentifier][actionIdentifier]) this.permissions[objectIdentifier][actionIdentifier] = true;
            }.bind(this));


            // prepare capabilities
            roleData.capability.forEach(function(capability) {
                if (!this.capabilities[capability.identifier]) this.capabilities[capability.identifier] = true;
            }.bind(this));


            // collect restricction ids
            this.restrictionIds = roleData.rowRestriction.map(function(restriction) {
                return restriction.id;
            });
        }




        /**
         * removes the role from all caches
         */
        , delete: function() {
            this.emit('delete', this);
        }
    });
}();
