!function() {
    'use strict';

    var   Class         = require('ee-class')
        , log           = require('ee-log');




    module.exports = new Class({


        /**
         * class constructor, initializes the restriction
         */
        init: function() {

            // storage for all restrictions
            this.restrictions = [];

            // cahce restrictions for specific entites
            this.cache = {};
        }




        /**
         * returns the restrictions for a given entity
         *
         * @param {string} entityName the name if the entity toi get
         *                            restrictions for
         * @returns {Restriction[]} array containing restrictions
         */
        , get: function(entityName) {

            // maybe we have to fill the cache
            if (!this.cache[entityName])  {
                 this.cache[entityName] = this.restrictions.filter(function(restriction) {
                     return !restriction.hasEntitiy(entityName);
                 }.bind(this));
            }

            // return the cached item
            return this.cache[entityName];
        }




        /**
         * add a new global restriction
         *
         * @param {Restriction}
         */
        , add: function(restriction) {

            // store
            this.restriction.push(restriction);

            // remove when deleted or updated
            restriction.once('delete', function() {
                var index = this.restrictions.indexOf(restriction);

                if (index >= 0) this.restrictions.splice(index, 1);
                else throw new Error('Cannot remove restrixction, it was already removed!');
            }.bind(this));
        }
    });
}();
