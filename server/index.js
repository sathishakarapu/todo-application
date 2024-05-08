const express = require("express");
const connectDB = require("./config/db");
const User = require("./models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const todo = require("./models/todo");
const  mongoose  = require("mongoose");
const ObjectId = mongoose.Types.ObjectId

const app = express();
const PORT = process.env.PORT || 8080
const JWT = process.env.JWT || "dbdveevjvbcvcvgcvddvhedeecmhecehcvehc"

app.use(express.json());
app.use(cors("*"));

app.listen(PORT, async () => {
    try {
        await connectDB();
        console.log(`Server running at ${PORT}`);
    } catch (error) {
        console.log(error);
    }
})

app.post("/register", async (req,res) => {
    const {email,password,confirmPassword} = req.body;

    if(!email || !password || !confirmPassword) {
        return res.status(400).json({
            error:"Please Enter All The Required Fields !"
        })
    }

    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!emailReg.test(email)) {
        return res.status(400).json({
            error:"Please Enter a Valid Email"
        })
    }

    if(password !== confirmPassword) {
        return res.status(400).json({
            error:"Please Enter The Password Correctly"
        })
    }

    try {
        const userAlreadyExist = await User.findOne({email});

        if(userAlreadyExist) {
            return res.status(400).json({
                error:`User with ${email} Already Exist`
            })
        }

        const hashPassword = await bcrypt.hash(password,12);

        const newUser = new User({email,password:hashPassword});

        const savedUser = await newUser.save();

        res.status(201).json({
            message:"User Registered successfully", user :savedUser
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error:"Internal Server Error"
        })
    }
});


app.post("/login", async (req,res) => {
    const {email,password} = req.body;

    if(!email || !password) {
        return res.status(400).json({
            error:"Please Enter All The Required Fields !"
        })
    }

    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!emailReg.test(email)) {
        return res.status(400).json({
            error:"Please Enter a Valid Email"
        })
    }

    try {
        const userAlreadyExist = await User.findOne({email});

        if(!userAlreadyExist) {
            return res.status(400).json({
                error:"User Not Found !"
            })
        }

        const doesPasswordMatch = await bcrypt.compare(password,userAlreadyExist.password);

        if(!doesPasswordMatch) {
            return res.status(400).json({
                error:"Invalid Email or Password"
            })
        }

        const payload = {_id:userAlreadyExist._id};

        const token = jwt.sign(payload, JWT, {expiresIn:"2h"});


        res.status(201).json({
            message:"User Logged in successfully",
            token :token
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error:error.message
        })
    }
});

app.get("/verify", async (req,res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];

        const decodeToken = jwt.verify(token,JWT);
        const user = await User.findById(decodeToken._id);

        if(!user) {
            return res.status(404).json({
                error: "User Not Found"
            })
        }
        res.status(200).json({user});
    } catch (error) {
        console.error(error);
        if(error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error:"Invalid Token"
            })
        } else if(error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error:"Token Expired"
            })
        } else {
            return res.status(401).json({
                error:"Internal Server Error"
            })
        }
    }
});


app.post("/create",async (req,res) => {
    try {
        const {name} = req.body;
        const activity = new todo({
            name,
        });
        await activity.save();
        res.status(201).json(activity);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});

