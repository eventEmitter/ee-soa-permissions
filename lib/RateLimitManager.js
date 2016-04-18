(function() {
    'use strict';


    const log = require('ee-log');
    const Cachd = require('cachd');
    const LeakyBucket = require('leaky-bucket');






    module.exports = class RateLimiter {




        constructor(options) {

            this.db = options.db;


            // map containing all items currently
            // being loaded from the db
            this.loading = new Map();


            // cache the limits
            this.cache = new Cachd({
                  ttl: 600000
                , maxLength: 2000
                , removalStrategy: 'leastUsed'
            });


            // we need a blacklist too because we shouldnt
            // load tokens that do not have any limits
            this.blacklist = new Cachd({
                  ttl: 600000
                , maxLength:    2000
                , removalStrategy: 'leastUsed'
            });
        }







        limitReached(token) {
            if (this.blacklist.has(token)) return Promise.resolve(null);
            else {
                return this.getBucket(token).then((limit) =>  {
                    if (limit) return Promise.resolve(limit.left > 0);
                    return Promise.resolve(null);
                });
            }            
        }







        getLimit(token) {
            if (this.blacklist.has(token)) return Promise.resolve(null);
            else {
                return this.getBucket(token).then((bucket) =>  {
                    if (bucket) return Promise.resolve(bucket.getInfo());
                    return Promise.resolve(null);
                });
            }            
        }







        pay(token, cost) {
            if (!this.blacklist.has(token)) {
                return this.getBucket(token).then((bucket) =>  {
                    if (bucket) {
                        bucket.pay(cost);

                        return Promise.resolve(bucket.getInfo());
                    }
                    return Promise.resolve(null);
                });
            } else return Promise.resolve(null);
        }









        getBucket(token) {
            if (this.cache.has(token)) return Promise.resolve(this.cache.get(token));
            else {

                if (this.loading.has(token)) {
                    return new Promise((resolve, reject) => {
                        this.loading.get(token).push({
                              resolve: resolve
                            , reject: reject
                        });
                    });
                }
                else {
                    this.loading.set(token, []);

                    // get the config from the db
                    return this.db.rateLimit('*').getApp().getAccessToken({
                        token: token
                    }).findOne().then((rateLimit) => {
                        if (rateLimit) {
                            let bucket = new LeakyBucket(rateLimit.credits, rateLimit.interval, 0);

                            this.cache.set(token, bucket);

                            // return to others
                            this.loading.get(token).forEach((item) => item.resolve(bucket));
                            this.loading.delete(token);

                            // return to caller
                            return Promise.resolve(bucket);
                        }
                        else {
                            this.blacklist.set(token, true);

                            // return to others
                            this.loading.get(token).forEach((item) => item.resolve());
                            this.loading.delete(token);

                            return Promise.resolve();
                        }
                    }).catch((err) => {
                         this.loading.get(token).forEach((item) => item.reject(err));
                         this.loading.delete(token);

                        return Promise.reject(err);
                    });
                }
            }
        }
    };
})();