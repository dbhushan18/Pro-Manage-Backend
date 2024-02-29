const mongoose = require("mongoose")

const taskData = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    title:{
        type : String,
        required :true
    },
    priority:{
        type : String,
        required : true
    },
    state: {
        type: String,
        enum: ['Backlog', 'To-do', 'In Progress', 'Done'],
        default: 'To-do'
    },
    dueDate:{
        type: Date,
        required : false,

    },
    createdAt:{
        type: Date,
    },
    tasks:[{
        description:{
            type: String,
            required: true,
        },
        checked:{
            type : Boolean,
            default: false,
        }
    }]
})

module.exports = mongoose.model("tasks", taskData);