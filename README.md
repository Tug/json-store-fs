# JSON Store FS

Datastore of JSON objects persisted on the File System

## Installation

via [npm (node package manager)](http://github.com/isaacs/npm)

    $ npm install json-store-fs

or install via git by cloning the repository and including json-store-fs in your project.

## Usage

Create a store in a directory
```
var myStore = require( 'json-store-fs' )( './data' );
```

You can now use your store for basic CRUD operations:

- Store.set
```
myStore.set( storeKey, storeData, function( err ) {} );
```

- Store.get
```
myStore.get( storeKey, function( err, storeData ) {} );
```

- Store.remove
```
myStore.remove( storeKey, function( err ) {} );
```

- Store.keys
```
myStore.keys( callback, function( storeKeys ) {} );
```


A synchronous version of each operation is available as well:

- Store.sync.set
```
myStore.sync.set( storeKey, storeData ); // throws error
```

- Store.sync.get
```
var storeData =  myStore.sync.get( storeKey ); // throws error
```

- Store.sync.remove
```
myStore.sync.remove( storeKey ); // throws error
```

- Store.sync.keys
```
var keys = myStore.sync.keys(); // throws error
```


## Run tests
```
mocha test
```
