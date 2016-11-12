'use strict';

var assert = require("assert");
var MongoClient = require("mongodb").MongoClient;

var db;

function connectDB(mongo_url,callback){
    process.stdout.write("Connecting to database... ");
    MongoClient.connect(mongo_url, function(err, database){
        db = database;
        assert.equal(err, null, "Mongo failed to start");
        console.log("db done.");
        callback();
    });
}

function newCollection(name, callback){
    db.createCollection(name, function(err, collection){
        assert.equal(err, null, "The database encountered an error while making a new collection");
        callback();
    })
}

function create(collection, doc, callback){
    db.collection(collection).insertMany(doc, function(err, result){
        assert.equal(err, null, "The database encountered an error while creating.");
        if(callback != undefined) callback(result);
    });
}

function read(collection, where, callback){
    db.collection(collection).find(where).toArray(function(err, docs){
        assert.equal(err, null, "The database encountered an error while reading.");
        callback(docs);
    });
}

function updateMany(collection, where, doc, callback){
    db.collection(collection).updateMany(where, doc, function(err, result){
        assert.equal(err, null, "The database encountered an error while updating.");
        callback(result);
    });
}

function updateOne(collection, where, doc, callback){
    db.collection(collection).updateOne(where, doc, function(err, result){
        assert.equal(err, null, "The database encountered an error while updating.");
        callback(result);
    });
}

// This becomes db.delete, we cant call it remove here though because remove is a
// javascript keyword.
function removeOne(collection, where, callback){
    db.collection(collection).deleteOne(where, function(err, result){
        assert.equal(err, null, "The database encountered an error while deleting.");
        callback(result);
    });
}

function removeMany(collection, where, callback){
    db.collection(collection).deleteMany(where, function(err, result){
        assert.equal(err, null, "The database encountered an error while deleting.");
        callback(result);
    });
}

exports.newCollection = newCollection;
exports.connectDB = connectDB;
exports.create = create;
exports.read   = read;
exports.updateOne = updateOne;
exports.updateMany = updateMany;
exports.removeOne = removeOne;
exports.removeMany = removeMany;