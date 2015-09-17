
var fs = require( 'fs' ),
	path = require( 'path' ),
	mkdirp = require( 'mkdirp' ),
	glob = require( 'glob' );

function isValidFilename( value ) {
	return typeof value === 'string' && /^[A-Za-z0-9_ \-\.,\(\)\[\]]+$/.test( value );
}

/*
 * A database of JSON objects stored on disk.
 * Each JSON object is stored in a different file in the same folder given by `dbPath`
 */
module.exports = function( dbPath ) {
	var databasePath = dbPath || '.';

	return {
		get: function( key, callback ) {
			if ( ! isValidFilename( key ) ) {
				return callback( new Error( 'Invalid Key' ) );
			}

			fs.readFile( path.join( databasePath, key + '.json' ), 'utf8', function( err, fileContent ) {
				if ( err ) {
					return callback( err )
				}

				callback( null, JSON.parse( fileContent ) );
			} );
		},

		set: function( key, data, callback ) {
			var filePath;

			if ( ! isValidFilename( key ) ) {
				return callback( new Error( 'Invalid Key' ) );
			}

			if ( typeof data !== 'object' ) {
				return callback( new Error( 'Invalid data' ) );
			}

			filePath = path.join( databasePath, key + '.json' );
			data = JSON.stringify( data, null, 4 ); // pretty JSON

			mkdirp( databasePath, function( errMakeDir ) {
				if ( errMakeDir ) {
					return callback( errMakeDir );
				}

				fs.writeFile( filePath, data, function( errWrite ) {
					if ( errWrite ) {
						return callback( errWrite );
					}
					callback();
				} );
			} );
		},

		remove: function( key, callback ) {
			var filePath;

			if ( ! isValidFilename( key ) ) {
				return callback( new Error( 'Invalid Key' ) );
			}

			filePath = path.join( databasePath, key + '.json' );

			fs.unlink( filePath, function( err ) {
				if ( err ) {
					return callback( err );
				}
				callback();
			} );
		},

		keys: function( callback ) {
			glob( path.join( databasePath, '/*.json' ), { nodir: true }, function( err, files ) {
				if ( err ) {
					return callback( err );
				}

				files = ( files || [] ).map( function( file ) {
					return path.basename( file, '.json' );
				} );

				callback( err, files );
			} );
		},

		sync: {
			get: function( key ) {
				if ( ! isValidFilename( key ) ) {
					throw new Error( 'Invalid Key' );
				}

				return JSON.parse( fs.readFileSync( path.join( databasePath, key + '.json' ), 'utf8' ) );
			},

			set: function( key, data ) {
				var filePath;

				if ( ! isValidFilename( key ) ) {
					throw new Error( 'Invalid Key' );
				}

				if ( typeof data !== 'object' ) {
					throw new Error( 'Invalid data' );
				}

				filePath = path.join( databasePath, key + '.json' );
				data = JSON.stringify( data, null, 4 ); // pretty JSON

				mkdirp.sync( databasePath );
				fs.writeFileSync( filePath, data );
			},

			remove: function( key ) {
				var filePath;

				if ( ! isValidFilename( key ) ) {
					throw new Error( 'Invalid Key' );
				}

				filePath = path.join( databasePath, key + '.json' );
				fs.unlinkSync( filePath );
			},

			keys: function() {
				var files = glob.sync( path.join( databasePath, '/*.json' ), { nodir: true } );
				return ( files || [] ).map( function( file ) {
					return path.basename( file, '.json' );
				} );
			}
		}
	};
};
