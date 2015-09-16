
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
module.exports = function( dbPath, opts ) {
	var options = opts || {},
		databasePath = dbPath || '.',
		writeAsync = !!options.writeAsync;

	return {
		get: function( key, callback ) {
			if ( ! isValidFilename( key ) ) {
				return callback( new Error( 'Invalid Key' ) );
			}

			fs.readFile( path.join( databasePath, key + '.json' ), function( err, buffer ) {
				if ( err ) {
					return callback( err )
				}

				callback( null, JSON.parse( buffer.toString() ) );
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

			if ( writeAsync ) {
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
			} else {
				try {
					mkdirp.sync( databasePath );
					fs.writeFileSync( filePath, data );
				} catch( err ) {
					return callback( err );
				}
				callback();
			}
		},

		remove: function( key, callback ) {
			var filePath;

			if ( ! isValidFilename( key ) ) {
				return callback( new Error( 'Invalid Key' ) );
			}

			filePath = path.join( databasePath, key + '.json' );

			if ( writeAsync ) {
				fs.unlink( filePath, function( err ) {
					if ( err ) {
						return callback( err );
					}
					callback();
				} );
			} else {
				try {
					fs.unlinkSync( filePath );
				} catch( err ) {
					return callback( err );
				}
				callback();
			}
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
		}
	};
};
