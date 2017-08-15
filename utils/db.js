const mongoose = require("mongoose");
const config = require("./config");

mongoose.Promise = global.Promise;
mongoose.connect(config.db, {
    useMongoClient: true
});

const db_connection = mongoose.connection;

db_connection.once("open", () => {
    console.log("Connection to db is established.");
});

db_connection.on("error", (err) => {
    console.log(`Errow while connecting to db instance: ${err}`);
});

// define neo collection schema
const NeoSchema = new mongoose.Schema({
    date: Date,
    neoReferenceId: String,
    name: String,
    speed: Number,
    isHazardous: Boolean
});

// define neo model
const Neo = mongoose.model("Neo", NeoSchema);

function removeCollection() {
    return Neo.remove({}).exec();
}

function insertData(data) {
    return Neo.insertMany(data);
}

module.exports = {
    models: {
        Neo: Neo
    },
    removeCollection: removeCollection,
    insertData: insertData
};