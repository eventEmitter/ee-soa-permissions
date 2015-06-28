!function() {

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
         * store role related data so it can easy be queried
         */
        , update: function(roleData) {
            // build hahmaps from the relational data

            // rebuild caches
            this.permissions = {};
            this.capabilities = {};


            // these are a little more compley
            this.rowRestrictions = {
                  entities: {}
                , generic: {}
            };


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


            // prepare row restrictions
            
        }




        /**
         * removes the role from all caches
         */
        , delete: function() {
            this.emit('delete', this);
        }      
    });
}();
