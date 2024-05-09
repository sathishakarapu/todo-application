const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    status:{
        type:String,
        default:"pending"
    },
    timeTaken:{
        type:Number,
        default:0
    },
    action:{
        type:String,
        default:"start"
    },
    user:{
        type:String,
        required:true,
    }
},{timestamps:true});

const todoModel = mongoose.model("Todolist", todoSchema);

module.exports = todoModel;