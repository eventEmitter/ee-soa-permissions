!function() {

    var   Class         = require('ee-class')
        , log           = require('ee-log');



    module.exports = new Class({

        init: function(restrictions) {
            this.restrictions = restrictions;



            // prepare generic rules
            this.generic = new RowRestriction();



            // cache for computed restirctions
            this.entities = {};


            // prepare restrictions as far as possible
            this.prepare();
        }



        /**
         * pre compute restrictions, if we're getting 
         * specific restrictions for an entity then we 
         * can add it to the cache for later use
         */
        , prepare: function() {
            this.restrictions.forEach(function(restriction) {
                if (restriction.rowRestrictionEntity.length) {
                    // apply for each entity
                    restriction.rowRestrictionEntity.forEach(function(entity) {
                        if(!this.entities[entity.entity]) this.entities[entity.entity] = new RowRestriction(entity.entity);
                        this.entities[entity.entity].add(restriction);
                    }.bind(this));
                }
                else {
                    // generic restriction
                    this.generic.add(restriction);
                }
            }.bind(this));


            // finally we're going to apply all global
            // restrictions to all local restrictions
            Object.keys(this.entities).forEach(this.generic.applyTo.bind(this.generic));
        }





        /**
         * returns the restruictions for a given entity
         */
        , getRestrictions: function(entity) {
            var restriction;

            if (this.cache[entity]) return this.cache[entity];
            else {
                // create a custom restriction for the entity
                restriction = new RowRestriction(entity);

                // add to cache
                this.cache[entity] = restriction;

                // first
                // we need to compute the restcrictions
                if (this.invertedGeneric.hasRestrictions()) {
                    // build a new custom restriction for this entity
                    


                    return restriction;
                }
                else if (this.generic.hasRestrictions()) {
                    // we have a set of restrictions that must 
                    // be applied to all entities, check if there 
                    // are inverted restrictions for this entity

                }
            }
        }
    });
}();
