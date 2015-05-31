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


            // set check interval
            setInterval(this.check.bind(this), this.roleRefreshInterval);
        }





        /**
         * loads role data from the db
         */
        , getRole: asyncMethod(function(roleName) {
            var query;

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
            query.getRole_rowRestriction('inverted')
                .getRoleRestriction(['column', 'value'])
                .fetchRowRestrictionEntity('identifier')
                .fetchRowRestrictionOperator('identifier')
                .fetchRowRestrictionValueType('identifier');

            // get from db
            query.findOne().then(function(role) {
                if (!role) callback(new Error('Role «'+roleName+'» not found!'));
                else {
                    var roleInstance = new Role(role);

                    // cache the shit
                    this.roleCache.set(roleName, role);

                    callback(null, roleInstance);
                }
            }.bind(this)).catch(callback);

        })



        

        /**
         * reloads a role into an existing role object
         */
        , reloadRole: function(roleName) {

        }

        


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
                    }).forEach(this.reloadRole.bind(this));
                }
            }.bind(this);


            // get updated roles
            this.db.role(['updated', 'identifier'], {
                updated: ORM.gt(this.roleLastUpdated)
            }).includeSoftDeleted().find().then(function(roles) {
                roles.forEach(function(role) {
                    if (role.updated > this.roleLastUpdated) this.roleLastUpdated = role.updated;
                    rolesToReload[role.identifier] = true;
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
