!function() {

    var   Class         = require('ee-class')
        , TTLCache      = require('cachd')
        , log           = require('ee-log')
        , asyncMethod   = require('async-method')
        , Role          = require('./Role')
        , ORM;


    /**
     * roles are cached very long, because they are accessed
     * very often. the role manager checks periodically if there
     * where any roles updated or deleted.
     */


    module.exports = new Class({


        // how ofeten to check if a role was modified
        roleRefreshInterval: 60000

        // last updated timestamps (db)
        , roleLastUpdated: new Date(1983, 09, 02, 07, 30, 00)
        , capabilityLastUpdated: new Date(1983, 09, 02, 07, 30, 00)
        , permissionLastUpdated: new Date(1983, 09, 02, 07, 30, 00)
        , rowRestrictionLastUpdated: new Date(1983, 09, 02, 07, 30, 00)


        // 10h
        , ttl: 36000
        , cacheLength: 1000


        // lets do this :)
        , init: function(options) {
            this.db = options.db;

            // get the orm object
             if (!ORM) ORM = this.db.getORM();

            // refresh interval
            if (options.roleRefreshInterval) this.roleRefreshInterval = options.roleRefreshInterval;

            // role cache
            this.cache = new TTLCache({
                  ttl           : this.ttl
                , maxLength     : this.cacheLength
                , minFreeMemory : 500
            });


            // cache callbacks when loading rles
            this.loaderCache = {};


            // set check interval
            setInterval(this.check.bind(this), this.roleRefreshInterval);
        }

        



        /**
         * loads role data from the db, caches it, returns it
         */
        , getRole: asyncMethod(function(roleName, callback) {
            var query;

            if (this.cache.has(roleName)) callback(null, this.cache.get(roleName));
            else {

                // make sure to load one an the same role only once in parallel
                if (this.loaderCache[roleName]) this.loaderCache[roleName].push(callback);
                else {
                    this.loaderCache[roleName] = [callback];

                    query = this.db.role('identifier', {
                        identifier: roleName
                    });

                    // get capabilities
                    query.getCapability('identifier');

                    // get permissions
                    query.getPermission('id')
                        .fetchPermissionAction('identifier')
                        .getPermissionObject('identifier')
                        .getPermissionObjectType('identifier');

                    // row restrictions
                    query.getRowRestriction(['column', 'value'])
                        .fetchRowRestrictionEntity('identifier')
                        .fetchRowRestrictionOperator('identifier')
                        .fetchRowRestrictionValueType('identifier');

                    // get from db
                    query.findOne().then(function(role) {
                        var err;

                        if (!role) err = new Error('Role «'+roleName+'» not found!');
                        else {

                            // add or update cache
                            if (this.cache.has(roleName)) this.cache.get(roleName).update(role);
                            else this.cache.set(roleName, new Role(role));
                        }


                        // call each callback
                        this.loaderCache[roleName].forEach(function(cb) {
                            // return the raw db data, the instance is in the cache
                            cb(err, this.cache.get(roleName));
                        }.bind(this));

                        // delete callback cache
                        delete this.loaderCache[roleName];
                    }.bind(this)).catch(callback);
                }
            }
        })






       /**
        * checks for update on the role entitiess
        */
        , check: function() {
            var   rolesToReload = {}
                , completed = 0
                , awaiting = 4
                , done;


            done = function(err) {
                if (err) log(err);
                if (++completed === awaiting) {
                    var loadedRoles = this.cache.getHashMap();

                    // check which of the roles are laoded, reload them
                    Object.keys(rolesToReload).filter(function(roleName) {
                        return !!loadedRoles[roleName];
                    }).forEach(this.getRole.bind(this));
                }
            }.bind(this);


            // get updated roles
            this.db.role(['updated', 'identifier'], {
                updated: ORM.gt(this.roleLastUpdated)
            }).includeSoftDeleted().find().then(function(roles) {
                roles.forEach(function(role) {
                    if (role.updated > this.roleLastUpdated) this.roleLastUpdated = role.updated;

                    if (role.deleted) {
                        if (this.cache.has(role.identifier)) {
                            // emits the deleted event so its getting rewmoved everywhere
                            this.cache.get(role.identifier).delete();
                            this.cache.delete(role.identifier);
                        }
                    }
                    else {
                        rolesToReload[role.identifier] = true;
                    }
                });
            }.bind(this)).catch(done);


            // get update capabilities
            this.db.capability(['updated', 'identifier'], {
                updated: ORM.gt(this.capabilityLastUpdated)
            }).includeSoftDeleted().getRole('identifier').find().then(function(capabilities) {
                capabilities.forEach(function(capability) {
                    if (capability.updated > this.capabilityLastUpdated) this.capabilityLastUpdated = capability.updated;

                    capability.role.forEach(function(role) {
                        rolesToReload[role.identifier] = true;
                    });
                }.bind(this));
            }.bind(this)).catch(done);


            // get updated permissions
            this.db.permission(['updated', 'identifier'], {
                updated: ORM.gt(this.permissionLastUpdated)
            }).includeSoftDeleted().getRole('identifier').find().then(function(permissions) {
                permissions.forEach(function(permission) {
                    if (permission.updated > this.permissionLastUpdated) this.permissionLastUpdated = permission.updated;

                    permission.role.forEach(function(role) {
                        rolesToReload[role.identifier] = true;
                    });
                }.bind(this));
            }.bind(this)).catch(done);


            // get updated row restrictions
            this.db.rowRestriction(['updated', 'identifier'], {
                updated: ORM.gt(this.rowRestrictionLastUpdated)
            }).includeSoftDeleted().getRole('identifier').find().then(function(rowRestrictions) {
                rowRestrictions.forEach(function(rowRestriction) {
                    if (rowRestriction.updated > this.rowRestrictionLastUpdated) this.rowRestrictionLastUpdated = rowRestriction.updated;

                    rowRestriction.role.forEach(function(role) {
                        rolesToReload[role.identifier] = true;
                    });
                }.bind(this));
            }.bind(this)).catch(done);
        }
    });
}();
