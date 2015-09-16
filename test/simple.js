
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

describe( 'Common usage', function() {
	var jsonStore;

	before( function() {
		jsonStore = JSONStore( STORE_PATH );
	} );

	after( function( done ) {
		rimraf( STORE_PATH, done );
	} );

	it( 'should allow valid filenames', function() {
		var callback = sinon.spy();
		jsonStore.set( 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', { hello: 'world' }, callback );
		jsonStore.set( 'abc def', { hello: 'world' }, callback );
		jsonStore.set( 'abc[def]', { hello: 'world' }, callback );
		jsonStore.set( 'abc(def)', { hello: 'world' }, callback );
		jsonStore.set( 'abc-def', { hello: 'world' }, callback );
		jsonStore.set( 'abc_def', { hello: 'world' }, callback );
		jsonStore.set( 'abc.def', { hello: 'world' }, callback );
		jsonStore.set( 'abc,def', { hello: 'world' }, callback );
		expect( callback ).to.have.callCount( 8 );
		expect( callback ).to.always.have.been.calledWith();
	} );

	it( 'should not allow invalid filenames', function() {
		var callback = sinon.spy();
		jsonStore.set( 'slash/not/allowed', { hello: 'world' }, callback );
		jsonStore.set( 'backslash\\not\\allowed', { hello: 'world' }, callback );
		jsonStore.set( 'specials\rnot\nallowed', { hello: 'world' }, callback );
		jsonStore.set( 'not-alphanumeric-é-not-allowed', { hello: 'world' }, callback );
		jsonStore.set( 'double-quote-"-not-allowed', { hello: 'world' }, callback );
		jsonStore.set( 'single-quote-\'-not-allowed', { hello: 'world' }, callback );
		expect( callback ).to.have.callCount( 6 );
		expect( callback ).to.always.have.been.calledWith( new Error('Invalid Key') );
	} );

	it( 'should fail when trying to retrieve a nonexistent object', function( done ) {
		jsonStore.get( 'nonexistent_object', function( err ) {
			expect( err ).to.exist.and.be.instanceof( Error ).and.have.property( 'code', 'ENOENT' );
			done();
		} );
	} );

	it( 'should save a valid JSON object to disk', function( done ) {
		var myObject = {
			hello: 'world',
			foo: [ 'bar', 'baz' ]
		};
		jsonStore.set( 'my_object', myObject, function( err ) {
			expect( err ).to.not.exist;
			expect( fs.existsSync( path.join( STORE_PATH, 'my_object.json' ) ) ).to.be.true;
			expect( readJSON( path.join( STORE_PATH, 'my_object.json' ) ) ).to.deep.equal( myObject );
			delete myObject.hello;
			jsonStore.set( 'my_object', myObject, function( err ) {
				expect( err ).to.not.exist;
				expect( readJSON( path.join( STORE_PATH, 'my_object.json' ) ) ).to.deep.equal( myObject );
				done();
			} );
		} );
	} );

	it( 'should save and retrieve a valid JSON object from the disk', function( done ) {
		var myObject = {
			hello: 'world',
			foo: [ 'bar', 'baz' ]
		};
		jsonStore.set( 'my_object_to_retrieve', myObject, function( err ) {
			expect( err ).to.not.exist;
			jsonStore.get( 'my_object_to_retrieve', function( err, myObjectFromStore ) {
				expect( err ).to.not.exist;
				expect( myObjectFromStore ).to.deep.equal( myObject );
				done();
			} );
		} );
	} );


	it( 'should be able to list all JSON objects inside the store', function( done ) {
		jsonStore.keys( function( err, keys ) {
			expect( err ).to.not.exist;
			expect( keys ).to.be.an.array;
			done();
		} );
	} );

	it( 'should save and delete a valid JSON object from the disk', function( done ) {
		var myObject = {
			hello: 'world',
			foo: [ 'bar', 'baz' ]
		};
		jsonStore.set( 'my_object', myObject, function( err ) {
			expect( err ).to.not.exist;
			jsonStore.remove( 'my_object', function( err ) {
				expect( err ).to.not.exist;
				expect( fs.existsSync( path.join( STORE_PATH, 'my_object.json' ) ) ).to.be.false;
				done();
			} );
		} );
	} );

} );
