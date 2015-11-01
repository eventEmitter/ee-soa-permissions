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

            // global restrictions
            this.globalRestrictions = [];

            // cahce restrictions for specific entites and actions
            this.cache = {};
            this.globalCache = {};
        }






        /**
         * returns the restrictions for a given entity
         *
         * @param {string} entityName the name if the entity to get
         *                            restrictions for
         * @param {string} actionName the name of the action to get
         *                            restrictions for
         *
         * @returns {Restriction[]} array containing restrictions
         */
        , get: function(entityName, actionName) {
            let cacheId = entityName+'|'+actionName;

            // maybe we have to fill the cache
            if (!this.cache[cacheId]) this.cache[cacheId] = this.restrictions.filter(restriction => restriction.hasEntitiyAndAction(entityName, actionName));

            // return the cached item
            return this.cache[cacheId];
        }







        /**
         * returns all global restrictions
         *
         * @param {string} actionName the name of the action to get
         *                            restrictions for
         *
         * @returns {Restriction[]} array containing restrictions
         */
        , getGlobal: function(actionName) {

            // maybe we have to fill the cache
            if (!this.globalCache[actionName]) this.globalCache[actionName] = this.globalRestrictions.filter(restriction => restriction.hasAction(actionName));

            // return the cached item
            return this.globalCache[actionName];
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
            restriction.once('delete', () => {
                let index = restriction.global ? this.globalRestrictions.indexOf(restriction) : this.restrictions.indexOf(restriction);

                if (index >= 0) {
                    // remove from set
                    if (restriction.global) this.globalRestrictions.splice(index, 1);
                    else this.restrictions.splice(index, 1);

                    // invalidate the cache
                    this.cache = {};
                }                
                else throw new Error('Cannot remove restriction, it was already removed!');
            });
        }
    });
}();
