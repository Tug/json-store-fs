
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

describe( 'Asynchronous writes', function() {
	var jsonStore;

	before( function() {
		jsonStore = JSONStore( STORE_PATH, { writeAsync: false } );
	} );

	after( function( done ) {
		rimraf( STORE_PATH, done );
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
