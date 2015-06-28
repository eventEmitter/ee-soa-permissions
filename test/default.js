	

	var   Class 		= require('ee-class')
		, log 			= require('ee-log')
		, assert 		= require('assert')
		, type 			= require('ee-types')
		, fs 			= require('fs')
		, Config 		= require('test-config')
		, ORM 			= require('related');



	var datify = function(input) {
		if (type.array(input)) {
			input.forEach(datify);
		}
		else if (type.object(input)) {
			Object.keys(input).forEach(function(key) {
				if (/date/i.test(key) && type.string(input[key])) {
					input[key] = new Date(input[key]);
				}
			})
		}

		return input;
	}



	var expect = function(val, cb){
		if (type.string(val)) val = datify(JSON.parse(val));

		return function(err, result) { //log(JSON.stringify(result));
			try {
				if (result && result.toJSON) result = result.toJSON();
				assert.deepEqual(result, val);
			} catch (err) {
				log.warn('comparison failed: ');
				log(JSON.stringify(val), JSON.stringify(result));
				log(val, result);
				return cb(err);
			}
			cb();
		}
	};



	var   databaseName = 'ee_soa_permissions'
		, config
		, sqlStatments
		, key
		, orm
		, db;



	config = new Config('config-test.js', {db:[{
		  schema 		: 'ee_soa_permissions'
		, database 		: 'test'
		, type 			: 'postgres'
		, hosts: [{
			  host 		: 'localhost'
			, username 	: 'postgres'
			, password 	: ''
			, port 		: 5432
			, mode 		: 'readwrite'
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
			new ORM(config).load(function(err, ormObject) {
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
	});