

    var   Class             = require('ee-class')
        , log               = require('ee-log')
        , assert            = require('assert')
        , type              = require('ee-types')
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
          schema        : 'ee_soa_permissions'
        , database      : 'test'
        , type          : 'postgres'
        , hosts: [{
              host      : 'localhost'
            , username  : 'postgres'
            , password  : ''
            , port      : 5432
            , mode      : 'readwrite'
            , maxConnections: 20
        }]
    }]}).db.filter(function(config) {return config.schema === databaseName});




    // sql for test db
    sqlStatments = fs.readFileSync(__dirname+'/postgres.sql').toString().split(';').map(function(input){
        return input.trim().replace(/\n/gi, ' ').replace(/\s{2,}/g, ' ')
    }).filter(function(item){
        return item.length;
    });





    // connecting & rebvuilding the test database
    describe('[Setting up the db]', function(){
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
            orm.getDatabase(databaseName).getConnection(function(err, connection){
                if (err) done(err);
                else {
                    var exec = function(query) {
                        connection.queryRaw(query, function(err) {
                            if (err) log(err, query);
                            else if (sqlStatments.length) exec(sqlStatments.shift());
                            else done();
                        })
                    };

                    exec(sqlStatments.shift());
                }
            });
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
                }).save();
            }).then(function(role) {
                done();
            }).catch(done);
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


        it('should not fail if the token was not found', function(done) {
            permissions.getPermission('a').then(function(permission) {
                assert(permission);
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
    });
