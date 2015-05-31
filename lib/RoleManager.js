!function() {

    var   Class         = require('ee-class')
        , log           = require('ee-log');




    module.exports = new Class({


        // how ofeten to  check if a role was modified
        roleRefreshInterval: 60000

        // last updated timestamps (db)
        , roleLastUpdated: new Date(1983, 09, 02, 07, 30, 00)
        , capabilityLastUpdated: new Date(1983, 09, 02, 07, 30, 00)
        , permissionLastUpdated: new Date(1983, 09, 02, 07, 30, 00)
        , rowRestrictionLastUpdated: new Date(1983, 09, 02, 07, 30, 00)


        // lets do this :)
        , init: function(options) {
            this.db = options.db;

            // refresh interval  
            if (options.roleRefreshInterval) this.roleRefreshInterval = options.roleRefreshInterval;

            // role cache
            this.cache = {};


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
                query.getRoleRestriction(['column', 'value', 'inverted'])
                    .fetchRowRestrictionEntity('identifier')
                    .fetchRowRestrictionOperator('identifier')
                    .fetchRowRestrictionValueType('identifier');

                // get from db
                query.findOne().then(function(role) {
                    var err;

                    if (!role) err = new Error('Role «'+roleName+'» not found!');
                    else {

                        // add or update cache
                        if (this.cache[roleName]) this.cache[roleName].update(role);
                        else this.cache[roleName] = new Role(role);
                    }


                    // call each callback
                    this.loaderCache[roleName].forEach(function(cb) {
                        // return the raw db data, the instance is in the cache
                        cb(err, this.cache.[roleName]);
                    });
                }.bind(this)).catch(callback);
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

                    // check whic of the roles are laoded, reload them
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
                    if (role.deleted) {
                        this.cache[role].delete();
                        delete this.cache[role];
                    }
                    else {
                        if (role.updated > this.roleLastUpdated) this.roleLastUpdated = role.updated;
                        rolesToReload[role.identifier] = true;
                    }
                });
            }.bind(this)).catch(done);


            // get update capabilities
            this.db.capability(['updated', 'identifier'], {
                updated: ORM.gt(this.roleLastUpdated)
            }).getRole('identifier').find().then(function(capabilities) {
                capabilities.forEach(function(capability) {
                    if (capability.updated > this.capabilityLastUpdated) this.capabilityLastUpdated = capability.updated;

                    capability.role.forEach(function(role) {
                        rolesToReload[role.identifier] = true;
                    });
                }.bind(this));
            }.bind(this)).catch(done);


            // get updated permissions
            this.db.permission(['updated', 'identifier'], {
                updated: ORM.gt(this.roleLastUpdated)
            }).getRole('identifier').find().then(function(permissions) {
                permissions.forEach(function(permission) {
                    if (permission.updated > this.permissionLastUpdated) this.permissionLastUpdated = permission.updated;

                    permission.role.forEach(function(role) {
                        rolesToReload[role.identifier] = true;
                    });
                }.bind(this));
            }.bind(this)).catch(done);


            // get updated row restrictions
            this.db.rowRestriction(['updated', 'identifier'], {
                updated: ORM.gt(this.roleLastUpdated)
            }).getRole('identifier').find().then(function(rowRestrictions) {
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
