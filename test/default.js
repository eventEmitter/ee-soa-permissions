(function() {
    'use strict';



    var   Class             = require('ee-class')
        , log               = require('ee-log')
        , assert            = require('assert')
        , fs                = require('fs')
        , Config            = require('test-config')
        , ORM               = require('related')
        , Timestamps        = require('related-timestamps')
        , SOAPermissions    = require('../');





    var   databaseName = 'ee_soa_permissions'
        , config
        , sqlStatments
        , token
        , orm
        , permissions
        , db;



    config = new Config('config-test.js', {db:[{
          type      : 'postgres'
        , database  : 'test'
        , schema    : 'ee_soa_permissions'
        , hosts: [{
              host              : 'localhost'
            , username          : 'postgres'
            , password          : ''
            , port              : 5432
            , pools             : ['write', 'read']
            , maxConnections    : 20
        }]
    }]}).db.filter(function(config) {return config.schema === databaseName});




    // sql for test db
    sqlStatments = fs.readFileSync(__dirname+'/postgres.sql').toString().split(';').map(function(input){
        return input.trim().replace(/\n/gi, ' ').replace(/\s{2,}/g, ' ');
    }).filter(function(item){
        return item.length;
    });





    // connecting & rebvuilding the test database
    describe('[Setting up the db]', function(){

        it('waiting', function(done) {
            this.timeout(5000);
            setTimeout(done, 4500);
        });



        it('should be able to connect to the database', function(done) {
            this.timeout(5000);
            new ORM(config).use(new Timestamps()).load(function(err, ormObject) {
                if (err) done(err);
                else {
                    orm = ormObject;
                    done();
                }
            });
        });



        it('should be able to drop & create the testing schema ('+sqlStatments.length+' raw SQL queries)', function(done) {
            this.timeout(5000);

            let db = orm[databaseName];

            let exec = function(query) {
                db.executeQuery(`set search_path to ${databaseName}; ${query}`).then(() => {
                    if (sqlStatments.length) exec(sqlStatments.shift());
                    else done();
                }).catch(done);
            };


            exec(sqlStatments.shift());
        });




        it ('should be able to reload the models', function(done) {
            orm.reload(function(err){
                if (err) done(err);
                else {
                    db = orm[databaseName];
                    done();
                }
            });
        });



        it ('inserting test data I', function(done) {
            new db.tenant({
                name: 'a'
            }).save().then(function(tenant) {
                return new db.user({
                      tenant: tenant
                    , userGroup: new db.userGroup({
                          identifier: 'emotions-users'
                        , tenant: tenant
                    })
                }).save();
            }).then(function(user) {
                token = new Buffer(32).toString('hex');

                return new db.accessToken({
                      user: user
                    , token: token
                    , expires: new Date(2020, 1, 1)
                }).save();
            }).then(function(token) {
                done();
            }).catch(done);

        });


        it ('inserting test data II', function(done) {
            new db.permissionObject({
                  permissionObjectType: db.permissionObjectType({identifier: 'controller'})
                , identifier: 'user'
            }).save().then(function(object) {

                return Promise.all(['read', 'create', 'update'].map(function(identifier) {
                    return new db.permission({
                          permissionObject: object
                        , permissionAction: db.permissionAction({identifier: identifier})
                    }).save();
                }));
            }).then(function(permissions) {
                return new db.role({
                      identifier: 'emotions-user'
                    , permission: db.permission({id: ORM.in(permissions.map(function(p) {return p.id;}))})
                    , userGroup: db.userGroup({identifier: 'emotions-users'})
                    , rowRestriction: [db.rowRestriction().limit(1)]
                }).save();
            }).then(function(role) {
                done();
            }).catch(done);
        });




        it ('inserting test data III', function(done) {

            new db.accessToken({
                  token: 'xx'
                , id_user: 1
            }).save().then(function(aToken) {
                return new db.user({
                      tenant: db.tenant({name: 'a'})
                    , accessToken: [aToken]
                }).save();
            }).then(function(user) {
                return new db.userGroup({
                      identifier: 'cap'
                    , user: [user]
                    , tenant: db.tenant({name: 'a'})
                }).save();
            }).then(function(group) {
                return new db.role({
                      identifier: 'cap'
                    , userGroup: [group]
                }).save();
            }).then(function(role) {
                return new db.capability({
                      identifier: 'canDoSomething'
                    , role: [role]
                }).save();
            }).then(function() {
                done();
            }).catch(done);
        });








        it ('inserting test data IV', function(done) {
            let appTenant;

            new db.tenant({
                name: 'api'
            }).save().then((tenant) => {
                appTenant = tenant;

                return new db.user({
                    tenant: tenant
                }).save();
            }).then((user) => {
                return new db.company({
                      tenant: appTenant
                    , identifier: 'joinbox'
                    , name: 'Joinbox Ltd.'
                    , company_user: [new db.company_user({
                          user: user
                        , companyUserRole: new db.companyUserRole({
                            identifier: 'admin'
                        })
                    })]
                }).save();
            }).then((company) => {
                return new db.app({
                      tenant: appTenant
                    , company: company
                    , identifier: 'api-client'
                    , name: 'api tester'
                    , contactEmail: 'anna@joinbox.com'
                    , rateLimit: new db.rateLimit({
                          interval: 60
                        , credits: 5000
                    })
                }).save();
            }).then((app) => {
                return new db.accessToken({
                      token: 'appToken'
                    , app: app
                }).save().then(() => {
                    return new db.role({
                          app: [app]
                        , identifier: 'app-role'
                    }).save();
                });
            }).then((role) => {
                return new db.capability({
                      identifier: 'appIsAllowedTo'
                    , role: [role]
                }).save();
            }).then(() => done()).catch(done);
        });
    });





    describe('[The SOA permissions module]', function(){
        it('should not crash when instantiated', function() {
            permissions = new SOAPermissions({
                db: db
            });
        });


        it('should load a permission from the db', function(done) {
            permissions.getPermission(token).then(function(permission) {
                assert(permission);
                done();
            }).catch(done);
        });


        it('should return the correct permissions', function(done) {
            permissions.getPermission(token).then(function(permission) {
                assert(permission.isActionAllowed('user', 'read'));
                assert(permission.isActionAllowed('user', 'delete') === false);
                done();
            }).catch(done);
        });


        it('should return object permissions correctly', function(done) {
            permissions.getPermission(token).then(function(permission) {
                assert.deepEqual(permission.getObjectPermissions('user'), {"read":{"allowed":true,"roles":["emotions-user"]},"update":{"allowed":true,"roles":["emotions-user"]},"create":{"allowed":true,"roles":["emotions-user"]}});
                done();
            }).catch(done);
        });



        it('should return capabilities correctly', function(done) {
            permissions.getPermission('xx').then(function(permission) {
                assert.deepEqual(permission.getCapabilities(), { canDoSomething: { roles: [ 'cap' ] } });
                done();
            }).catch(done);
        });


        it('should return the cached permission in less than 3 ms', function(done) {
            var start = Date.now();

            permissions.getPermission(token).then(function(permission) {
                assert((Date.now()-start) < 3);
                done();
            }).catch(done);
        });


        it('should return if there is a user on the permission set', function(done) {
            permissions.getPermission(token).then(function(permission) {
                assert(permission.hasUser());
                done();
            }).catch(done);
        });


        it('should return if there is a service on the permission set', function(done) {
            permissions.getPermission(token).then(function(permission) {
                assert(!permission.hasService());
                done();
            }).catch(done);
        });


        it('should return the user if requested', function(done) {
            permissions.getPermission(token).then(function(permission) {
                assert(!!permission.getFirstUser());
                done();
            }).catch(done);
        });


        it('should return the tenant if reuqested', function(done) {
            permissions.getPermission(token).then(function(permission) {
                assert(permission.hasTenant());
                assert(permission.getFirstTenant());
                done();
            }).catch(done);
        });


        it('should not fail if the token was not found', function(done) {
            permissions.getPermission('a').then(function(permission) {
                assert(permission);
                done();
            }).catch(done);
        });


        it('should return the correct restrictions for a token', function(done) {
            permissions.getPermission(token).then(function(permission) {
                assert.deepEqual(permission.getRowRestrictions().get('persons'), [{"value":"tenant.id","column":"id_tenant","fullPath":"id_tenant","comperator":"=","type":"variable","entities":{"persons":true}}]);

                done();
            }).catch(done);
        });


        it('should return the correct permissions for an invalid token', function(done) {
            permissions.getPermission('a').then(function(permission) {
                assert(permission.isActionAllowed('user', 'read') === false);
                assert(permission.isActionAllowed('user', 'delete') === false);
                done();
            }).catch(done);
        });


        it('should check capabilities correctly', function(done) {
            permissions.getPermission('xx').then(function(permission) {
                assert(permission.hasCapability('non-existent') === false);
                assert(permission.hasCapability('canDoSomething') === true);
                done();
            }).catch(done);
        });


        it('should return the correct permissions info', function(done) {
            permissions.getPermission(['xx', token]).then(function(permission) {
                assert.deepEqual(permission.getInfo(), {"permissions":{"user":{"create":{"allowed":true,"roles":["emotions-user"]},"update":{"allowed":true,"roles":["emotions-user"]},"read":{"allowed":true,"roles":["emotions-user"]}}},"capabilities":{"canDoSomething":{"roles":["cap"]}},"roles":[{"name":"emotions-user","permissions":{"user":{"create":true,"update":true,"read":true}},"capabilities":{},"restrictionIds":[1]},{"name":"cap","permissions":{},"capabilities":{"canDoSomething":true},"restrictionIds":[]}]});
                done();
            }).catch(done);
        });


        it('should remove expired tokens from the cache', function(done) {
            this.timeout(10000);

            // delete token from db, check if the cache is busted
            db.accessToken({token: 'xx'}).delete().then(function() {
                setTimeout(function() {
                    permissions.getPermission('xx').then(function(permission) {
                        assert(permission.hasCapability('canDoSomething') === false);
                        done();
                    }).catch(done);
                }, 6000);
            }.bind(this)).catch(done);
        });


        it('should return the correct permissions info for an app token', function(done) {
            permissions.getPermission('appToken').then(function(permission) {
                assert.deepEqual(permission.getInfo(), {"permissions":{},"capabilities":{"appIsAllowedTo":{"roles":["app-role"]}},"roles":[{"name":"app-role","permissions":{},"capabilities":{"appIsAllowedTo":true},"restrictionIds":[]}]});
                done();
            }).catch(done);
        });




        it('should return the correct rate limit for an app token', function(done) {
            permissions.getPermission('appToken').then(function(permission) {
                return permission.getRateLimitInfo().then((info) => {
                    assert.deepEqual(info, {"left":5000,"interval":60,"capacity":5000});

                    return permission.payRateLimit(2500).then((newInfo) => {
                        assert(newInfo.left >= 2500);
                        done();
                    });                    
                });
            }).catch(done);
        });
    });
})();
