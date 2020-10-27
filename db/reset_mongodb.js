"use strict";

const mongo = require("mongodb").MongoClient;
const dsn = 'mongodb://localhost:27017';
const colName = 'stocks';

const fs = require("fs");
const path = require("path");
const docs = JSON.parse(fs.readFileSync(
    path.resolve(__dirname, "stocks.json"),
    "utf8"
));

resetCollection(dsn, colName, docs)
    .catch(err => console.log(err));

resetCollection2(dsn)
    .catch(err => console.log(err));

async function resetCollection(dsn, colName, doc) {
    const client  = await mongo.connect(dsn);
    const db = await client.db();
    const col = await db.collection(colName);

    await col.deleteMany();
    await col.insertMany(doc);

    await client.close();
}

async function resetCollection2(dsn) {
    const client  = await mongo.connect(dsn);
    const db = await client.db();
    const col = await db.collection("userStocks");

    await col.deleteMany();

    await client.close();
}
