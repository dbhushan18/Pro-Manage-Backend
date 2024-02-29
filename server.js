const express = require("express");
const app = express();
const cors = require("cors");
const authRoute = require("./Routes/auth");
const tasksRoute = require("./Routes/tasks");
const { default: mongoose } = require("mongoose");
require("dotenv").config();

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI).then(()=>{
    console.log("Connected to DB")
}).catch((err)=>{
    console.log("error connecting to the DB",err);
})

app.get("/", (req,res)=>{
    res.json({message: "This is Home route"})
})

app.get("/health", (req,res)=>{
    res.json({
        service : "Pro Manage",
        status: "Active",
        time : new Date(),
    })
})

app.use("/api/v1/auth", authRoute)
app.use("/api/v1/task", tasksRoute)

PORT = process.env.PORT || 4000;
app.listen(PORT, ()=>{
    console.log(`app is connected to the port ${PORT}`);
})