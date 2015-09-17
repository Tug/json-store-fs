
var fs = require( 'fs' ),
	path = require( 'path' ),
	rimraf = require( 'rimraf' ),
	chai = require( 'chai' ),
	expect = chai.expect,
	sinon = require( 'sinon' ),
	JSONStore = require( '..' ),
	STORE_PATH = path.join( __dirname, 'temp' );

chai.use( require( 'sinon-chai' ) );

function readJSON( file ) {
	return JSON.parse( fs.readFileSync( file, 'utf8' ) );
}


describe( 'Synchronous usage', function() {
	var jsonStore,
		testCreate = function( name ) {
			return function() {
				jsonStore.sync.set( name, { hello: 'world' } );
			};
		},
		testRead = function( name ) {
			return function() {
				return jsonStore.sync.get( name );
			};
		};

	before( function() {
		jsonStore = JSONStore( STORE_PATH );
	} );

	after( function( done ) {
		rimraf( STORE_PATH, done );
	} );

	it( 'should allow valid filenames', function() {
		expect( testCreate( 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' ) ).to.not.throw( Error );
		expect( testCreate( 'abc def' ) ).to.not.throw( Error );
		expect( testCreate( 'abc[def]' ) ).to.not.throw( Error );
		expect( testCreate( 'abc(def)' ) ).to.not.throw( Error );
		expect( testCreate( 'abc-def' ) ).to.not.throw( Error );
		expect( testCreate( 'abc_def' ) ).to.not.throw( Error );
		expect( testCreate( 'abc.def' ) ).to.not.throw( Error );
		expect( testCreate( 'abc,def' ) ).to.not.throw( Error );
	} );

	it( 'should not allow invalid filenames', function() {
		expect( testCreate( 'slash/not/allowed' ) ).to.throw( /Invalid Key/ );
		expect( testCreate( 'backslash\\not\\allowed' ) ).to.throw( /Invalid Key/ );
		expect( testCreate( 'specials\rnot\nallowed' ) ).to.throw( /Invalid Key/ );
		expect( testCreate( 'not-alphanumeric-é-not-allowed' ) ).to.throw( /Invalid Key/ );
		expect( testCreate( 'double-quote-"-not-allowed' ) ).to.throw( /Invalid Key/ );
		expect( testCreate( 'single-quote-\'-not-allowed' ) ).to.throw( /Invalid Key/ );
	} );

	it( 'should fail when trying to retrieve a nonexistent object', function() {
		expect( testRead( 'nonexistent_object' ) ).to.throw( /ENOENT/ );
	} );

	it( 'should save a valid JSON object to disk', function( done ) {
		var myObject = {
			hello: 'world',
			foo: [ 'bar', 'baz' ]
		};
		expect( function() {
			jsonStore.sync.set( 'my_object', myObject );
		} ).to.not.throw( Error );
		expect( fs.existsSync( path.join( STORE_PATH, 'my_object.json' ) ) ).to.be.true;
		expect( readJSON( path.join( STORE_PATH, 'my_object.json' ) ) ).to.deep.equal( myObject );
		delete myObject.hello;
		expect( function() {
			jsonStore.sync.set( 'my_object', myObject );
		} ).to.not.throw( Error );
		expect( readJSON( path.join( STORE_PATH, 'my_object.json' ) ) ).to.deep.equal( myObject );
		done();
	} );

	it( 'should save and retrieve a valid JSON object from the disk', function() {
		var myObjectFromStore = null,
			myObject = {
				hello: 'world',
				foo: [ 'bar', 'baz' ]
			};
		expect( function() {
			jsonStore.sync.set( 'my_object_to_retrieve', myObject );
		} ).to.not.throw( Error );
		expect( function() {
			myObjectFromStore = jsonStore.sync.get( 'my_object_to_retrieve' );
		} ).to.not.throw( Error );
		expect( myObjectFromStore ).to.deep.equal( myObject );
	} );


	it( 'should be able to list all JSON objects inside the store', function() {
		expect( function() {
			var keys = jsonStore.sync.keys();
			expect( keys ).to.be.an.array;
		} ).to.not.throw( Error );
	} );

	it( 'should save and delete a valid JSON object from the disk', function() {
		var myObject = {
			hello: 'world',
			foo: [ 'bar', 'baz' ]
		};
		expect( function() {
			jsonStore.sync.set( 'my_object', myObject );
			jsonStore.sync.remove( 'my_object' );
		} ).to.not.throw( Error );
		expect( fs.existsSync( path.join( STORE_PATH, 'my_object.json' ) ) ).to.be.false;
	} );

} );
