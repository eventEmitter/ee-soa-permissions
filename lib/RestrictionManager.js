(function() {
    'use strict';

    const Class                 = require('ee-class');
    const log                   = require('ee-log');
    const Cachd                 = require('cachd');
    const asyncMethod           = require('async-method');
    const RestrictionSet        = require('./RestrictionSet');
    const Restriction           = require('./Restriction');

    var ORM;




    module.exports = new Class({



        /**
         * the class constructor
         */
        init: function(options) {

            // we have to access the database
            this.db = options.db;
            ORM = this.db.getORM();



            // cache the restrictions
            this.restrictionCache = new Cachd({
                  ttl           : options.restrictionExpiration*1000
                , maxLength     : options.restirctionCacheLength
            });

            // cache the sets
            this.restrictionSetCache = new Cachd({
                  ttl           : options.restrictionSetExpiration*1000
                , maxLength     : options.restirctionSetCacheLength
            });



            // callback cache, we should not load duplicate  items
            this.setLoaderQueue = {};
            this.loaderQueue = {};
        }





        /**
         * returns the restrictions for a given set of roles
         *
         * @param {Role[]} roles array of roles. The roles msut expose the
         *                       restriction ids
         *
         * @returns {RestrictionSet} a restricionset that can be passed to the
         *                           related orm
         */
        , get: asyncMethod(function(roles, callback) {
            var   roleHash
                , restrictionIds
                , restrictionSet;


            // get the has of the roles, so we can check the set cache
            roleHash = roles.sort(function(a, b) {return a.di - b.id;}).map(function(r){return r.id+'';}).join('-');


            // dont load the same stuff concurrently
            if (this.setLoaderQueue[roleHash]) this.setLoaderQueue[roleHash].push(callback);
            else {
                this.setLoaderQueue[roleHash] = [callback];


                // check the cache
                if (this.restrictionSetCache.has(roleHash)) this._executeSetCallbacks(roleHash, null, this.restrictionSetCache.get(roleHash));
                else {
                    // laod the restriction set from the restriction
                    // cache or the db

                    restrictionIds = [];
                    restrictionSet = new RestrictionSet();

                    // collect loaded restirctions, laod the others
                    roles.forEach(function(role) {
                        role.getRestrictionIds().forEach(function(id) {
                            if (this.restrictionCache.has(id)) restrictionSet.add(this.restrictionCache.get(id));
                            else restrictionIds.push(id);
                        }.bind(this));
                    }.bind(this));



                    if (!restrictionIds.length) {

                        // ok, everything is loaded
                        this.restrictionSetCache.set(roleHash, restrictionSet);

                        // return
                        this._executeSetCallbacks(roleHash, null, restrictionSet);
                    }
                    else {
                        // laod the remaining restrictions from the db
                        this.loadRestrictions(restrictionIds, restrictionSet).then(function() {

                            // ok, everything is loaded
                            this.restrictionSetCache.set(roleHash, restrictionSet);

                            // return
                            this._executeSetCallbacks(roleHash, null, restrictionSet);
                        }.bind(this)).catch(function(err) {
                            this._executeSetCallbacks(roleHash, err);
                        }.bind(this));
                    }
                }
            }
        })




        /**
         * call all callbacks in the set loader queue
         */
        , _executeSetCallbacks: function(hash, err, result) {

            this.setLoaderQueue[hash].forEach(function(cb) {
                cb(err, result);
            }.bind(this));

            delete this.setLoaderQueue[hash];
        }




        /*
         * load restrictions from the db
         *
         */
         , loadRestrictions: function(restrictionIds, restrictionSet) {

             // load restrictions for all ids
             return Promise.all(restrictionIds.map(function(id) {
                 return new Promise(function(resolve, reject) {
                     if (this.loaderQueue[id]) this.loaderQueue[id].push({resolve: resolve, reject: reject});
                     else {
                          this.loaderQueue[id] = [{resolve: resolve, reject: reject}];

                          this.db.rowRestriction(['id', 'nullable', 'global', 'column', 'value'], {id: id})
                          .fetchRowRestrictionEntity('identifier')
                          .fetchRowRestrictionComperator('identifier')
                          .fetchRowRestrictionValueType('identifier')
                          .findOne()
                          .then(function(rowRestriction) {
                              var restriction = new Restriction(rowRestriction);

                              // cache results
                              this.restrictionCache.set(id, restriction);

                              // add to restriction set
                              restrictionSet.add(restriction);

                              // tell everyone that we're done
                              this.loaderQueue[id].forEach(function(item) {
                                  item.resolve(restriction);
                              }.bind(this));

                              // remove queue
                              delete this.loaderQueue[id];
                          }.bind(this)).catch(function(err) {
                              this.loaderQueue[id].forEach(function(item) {
                                  item.reject(err);
                              }.bind(this));
                          }.bind(this));
                     }
                 }.bind(this));
             }.bind(this)));
         }
    });
})();
