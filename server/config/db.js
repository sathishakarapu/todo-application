const mongoose = require("mongoose");

const uri = "mongodb+srv://sathish:Swathi%40123@cluster0.fygopsn.mongodb.net/todolist";

const connectDB = async () => {
    return mongoose.connect(uri)
    .then(() => {
        console.log("Connected to mongoDB");
    })
    .catch((error) => {
        console.log(error)
    });
}

module.exports = connectDB;