!function() {

    var   Class         = require('ee-class')
        , log           = require('ee-log');



    module.exports = new Class({

        init: function(restrictions) {
            this.restrictions = restrictions;

            // first we prepare what we know
            // cache data for specific enitites
            this.entities = {};

            // prepare inverting rules, they remove row restrictions
            this.ivertedEntities = {};

            // prepare generic rules
            this.generic = {};

            // and inverted generic, they remove row restrictions
            this.invertedGeneric = {};



            // cache for computed restirctions
            this.cache = {};
            

            // prepare restrictions as far as possible
            this.prepare();
        }



        /**
         * pre compute restrictions
         */
        , prepare: function() {
            this.restrictions.forEach(function(restriction) {
                if (restriction.rowRestrictionEntity.length) {
                    // apply for each entity
                    restriction.rowRestrictionEntity.forEach(function(entity) {
                        if (restriction.inverted) {
                            this.ivertedEntities[entity.entity] = new RowRestriction(restriction);
                        }
                        else {
                            this.entities[entity.entity] = new RowRestriction(restriction);
                        }
                    }.bind(this));
                }
                else {
                    // generic restriction
                    if (restriction.inverted) {
                        this.invertedGeneric[entity.entity] = new RowRestriction(restriction);
                    }
                    else {
                        this.generic[entity.entity] = new RowRestriction(restriction);
                    }
                }
            }.bind(this));
        }



        /**
         * returns the restruictions for a given entity
         */
        , getRestrictions: function(entity) {
            if (this.cache[entity]) return this.cache[entity];
            else {
                // we need to compute the restcrictions

            }
        }
    });
}();
