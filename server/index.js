const express = require("express");
const connectDB = require("./config/db");
const User = require("./models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const todo = require("./models/todo");


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

// for register new user
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

// for login existing user
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

// verify the user with token in home page
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


// create a new activity
app.post("/create",async (req,res) => {
    try {
        const { name, user } = req.body;
        const activity = new todo({
            name,
            user
        });

        await activity.save();
        res.status(201).json(activity);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});

// get the all tasks by userId
app.get('/tasks', async (req, res) => {
    try {
        const userId = req.query.userId;
    
        const tasks = await todo.find({ user : userId });
        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// start the activity
app.post('/tasks/:taskId/start', async (req, res) => {
    try {
      const taskId = req.params.taskId;
      const task = await todo.findById(taskId);
  
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      task.status = 'ongoing';
      await task.save();
  
      res.status(200).json(task);
    } catch (error) {
      console.error('Error starting task:', error);
      res.status(500).json({ error: 'Server error' });
    }
});
  

// resume the activity
app.post('/tasks/:taskId/resume', async (req, res) => {
    try {
      const taskId = req.params.taskId;
      const task = await todo.findById(taskId);
  
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      task.status = 'ongoing';
      await task.save();
  
      res.status(200).json(task);
    } catch (error) {
      console.error('Error resuming task:', error);
      res.status(500).json({ error: 'Server error' });
    }
});

// pause the activity
app.post('/tasks/updateTimeForPause', async (req, res) => {
    try {
      const taskId = req.body.taskId;
      const timetaken = req.body.timeTaken;

      const task = await todo.findById(taskId);
  
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      task.timeTaken = timetaken;
      task.status = "pause"
      await task.save();
  
      res.status(200).json(task);
    } catch (error) {
      console.error('Error resuming task:', error);
      res.status(500).json({ error: 'Server error' });
    }
});

// end the activity
app.post('/tasks/updateTimeForEnd', async (req, res) => {
    try {
      const taskId = req.body.taskId;
      const timetaken = req.body.timeTaken;

      const task = await todo.findById(taskId);
  
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      task.timeTaken = timetaken;
      task.status = "completed"
      await task.save();
  
      res.status(200).json(task);
    } catch (error) {
      console.error('Error resuming task:', error);
      res.status(500).json({ error: 'Server error' });
    }
});