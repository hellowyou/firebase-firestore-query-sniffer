# Firebase Firestore Query Sniffer

> Keeps track of method calls from a firestore query instance

## Table of contents

1. [Install](#install)
2. [Usage](#usage)
3. [Contributing](#contributing)
4. [License](#license)

## Install

```bash
$ npm install  firebase-firestore-query-sniffer firebase
```

## Usage

Call `createQuerySniffer` with a firestore [CollectionReference](https://firebase.google.com/docs/reference/js/firebase.firestore.CollectionReference) as parameter:

```js
import { createQuerySniffer } from 'firebase-firestore-query-sniffer'
import firebase from 'firebase/app'
import 'firebase/firestore'

// initialize firebase
const app = firebase.initializeApp({...})
const db = app.firestore()

const query = createQuerySniffer(db.collection('collection'))
	.where('field', '==', 'value')

query.queryTrace
//=> [{ method: 'where', args: [ 'field', '==', 'value' ] }]
```

Accepts [Query](https://firebase.google.com/docs/reference/js/firebase.firestore.Query) as parameter:

```js
const query = createQuerySniffer(db.collectionGroup('collection'))
```

Every chainable method call returns a cloned copy of itself, just like what firestore query does:

```js
// ...
const query = createQuerySniffer(db.collection('collection'))
const query2 = query.where('field', '==', 'value')

query.queryTrace //=> []
query2.queryTrace //=> [{ method: 'where', args: [ 'field', '==', 'value' ] }]
```

Method calls before it was transformed are not included traced:

```js
const query = createQuerySniffer(
  db.collection('collection').where('field', '==', 'value')
)

query.queryTrace //=> []
```

## Contributing

TODO: Add content

## License

This project is licensed under the ISC License - see the LICENSE.md file for details
