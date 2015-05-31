!function() {

    var   Class         = require('ee-class')
        , EventEmitter  = require('ee-event-emitter')
        , log           = require('ee-log');






    module.exports = new Class({
        inherits: EventEmitter


        , name: ''

        
        , init: function(roleData) {
            this.update(roleData);
        }




        /**
         * store role related data so it can easy be queried
         */
        , update: function(roleData) {
            this.name = roleData.identifier;
        }




        /**
         * removes the role from all caches
         */
        , delete: function() {
            this.emit('delete', this);
        }      
    });
}();
