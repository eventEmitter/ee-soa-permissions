(function() {
    'use strict';

    const Class                 = require('ee-class');
    const log                   = require('ee-log');




    module.exports = new Class({


        /**
         * class constructor, initializes the restriction
         */
        init: function() {

            // storage for all restrictions
            this.restrictions = [];

            // global restrictions
            this.globalRestrictions = [];

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
                     return restriction.hasEntitiy(entityName);
                 }.bind(this));
            }

            // return the cached item
            return this.cache[entityName];
        }



        /**
         * returns all global restrictions
         *
         * @returns {Restriction[]} array containing restrictions
         */
        , getGlobal: function() {
            return this.globalRestrictions;
        }




        /**
         * add a new restriction
         *
         * @param {Restriction}
         */
        , add: function(restriction) {

            // store
            if (restriction.global) this.globalRestrictions.push(restriction);
            else this.restrictions.push(restriction);

            // remove when deleted or updated
            restriction.once('delete', function() {
                var index = restriction.global ? this.globalRestrictions.indexOf(restriction) : this.restrictions.indexOf(restriction);

                if (index >= 0) {
                    // remove from set
                    if (restriction.global) this.globalRestrictions.splice(index, 1);
                    else this.restrictions.splice(index, 1);

                    // invalidate the cache
                    this.cache = {};
                }                
                else throw new Error('Cannot remove restriction, it was already removed!');
            }.bind(this));
        }
    });
})();
