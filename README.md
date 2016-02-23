# immutable-records
[![npm version](https://badge.fury.io/js/immutable-records.svg)](https://badge.fury.io/js/immutable-records)
A simple implementation of immutable records for JavaScript.

The goal of this implementation is to have great performance dealing with
records with a small, fixed set of attributes. [See here](https://medium.com/outsystems-engineering/javascript-and-immutability-how-fast-is-fast-enough-27790cda4e9e#.4xf0eiq4m) for a performance comparision with Facebook's [immutable-js](https://facebook.github.io/immutable-js/).

This is the JavaScript version of the [TypeScript](https://github.com/OutSystems/immutable-records) version for use with npm.

### Install (via NPM)

```shell
$ npm install immutable-records
```

### Usage
```javascript
var Record = require('immutable-records').Record;

var ABRecord = Record({a:1, b:2});
var myRecord = new ABRecord({b:3});

myRecord.get('b'); // 3

myRecord = myRecord.set('a', 4); // Returns a new Record
myRecord.get('a'); // 4

myRecord.toJS(); // Returns a vanilla JS Object { a: 4, b: 3 }
```
