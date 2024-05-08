const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:[true, "Email is Required"],
        unique:true
    },
    password:{
        type:String,
        required:[true, "Password is Required"]
    }
});

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;