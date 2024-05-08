const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    status:{
        type:String,
        enum:["pending","completed"],default:"pending"
    },
    timeTaken:{
        type:Number,
        default:0
    },
    action:{
        type:String,
        enum:["start","stop","pause","resume"],default:"start"
    },
    isRunning:{
        type:Boolean,
        default:false
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    }
},{timestamps:true});

const todoModel = mongoose.model("Todolist", todoSchema);

module.exports = todoModel;

todoSchema.pre("save", async function(next) {
    if(this.isModified("action") && this.action === "start") {
        const runningActivity = await thsi.constructor.findOne({user:this.user,isRunning:true});

        if(runningActivity && runningActivity._id.toString() !== this._id.toString()) {
            throw new Error("Another activity is already running"); 
        }
        this.isRunning = true;
    }
    next();
})