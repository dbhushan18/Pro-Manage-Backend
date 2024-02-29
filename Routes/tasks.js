const task = require("../Models/task")
const express = require("express")
const moment = require('moment');
const router = express.Router();
const verifyJwt = require("../Middleware/authMiddleware")


router.post("/newTask", verifyJwt, async (req, res) => {
    try {
        const { title, priority, state, dueDate, createdAt, tasks, owner } = req.body;
        if (!title || !priority || !tasks) {
            return res.status(400).json({ message: "bad request" });
        }
        const newTask = new task({
            title,
            owner,
            priority,
            state,
            dueDate,
            createdAt,
            tasks
        })
        await newTask.save();
        return res.status(200).json({ message: "Task created successfully!!" });
    }
    catch (err) {
        res.status(400).json({ message: 'Failed to create task' });
        console.log(err)
    }
})


router.get('/allTasks/:ownerId', async (req, res) => {
    try {
        const { filter } = req.query;
        const ownerId = req.params.ownerId;

        if (!ownerId) {
            return res.status(400).json({ message: 'Bad request' });
        }

        let startDate, endDate;

        switch (filter) {
            case 'today':
                startDate = moment().subtract(1, 'day').startOf('day');
                endDate = moment().endOf('day');
                break;
            case 'thisMonth':
                startDate = moment().subtract(30, 'days').startOf('day');
                endDate = moment().endOf('day');
                break;
            default:
                startDate = moment().subtract(7, 'days').startOf('day');
                endDate = moment().endOf('day');
                break;
        }

        const taskData = await task.find({
            owner: ownerId,
            createdAt: { $gte: startDate, $lte: endDate }
        });

        res.json({ data: taskData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;

router.put('/cards/:cardId/tasks/:taskId', verifyJwt, async (req, res) => {
    try {
        const cardId = req.params.cardId;
        const taskId = req.params.taskId;
        const { checked } = req.body;

        const updatedTask = await task.findOneAndUpdate(
            { _id: cardId, "tasks._id": taskId },
            { $set: { "tasks.$.checked": checked } },
            { new: true }
        )
        return updatedTask;

    } catch (error) {
        console.error('Error updating task checked state:', error);
        res.status(500).json({ error: 'Failed to update task checked state' });
    }
});


router.put("/tasks/:taskId", async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const { state } = req.body;
        if (!taskId) {
            return res.status(400).json({ message: "bad request" });
        }

        const updatedTask = await task.findByIdAndUpdate(
            taskId,
            { $set: { state } },
            { new: true }
        )

        if (!updatedTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.json({ data: updatedTask });

    }
    catch (err) {
        console.log(err)
    }
})

router.put("/edit/:id", verifyJwt, async (req, res) => {
    try {
        const { title, priority, state, dueDate, createdAt, tasks, owner } = req.body;
        const cardId = req.params.id;
        if (!title || !priority || !tasks) {
            return res.status(400).json({ message: "bad request" });
        }
        await task.updateOne(
            { _id: cardId },
            {
                $set: {
                    title,
                    priority,
                    state,
                    dueDate,
                    createdAt,
                    tasks,
                    owner
                }
            }
        )
        return res.status(200).json({ message: "Card details Updated successfully!!" });
    }
    catch (err) {
        console.log(err)
        res.status(401).json({ message: "Something went wrong" })
    }
})

router.delete("/delete/:id", verifyJwt, async (req, res) => {
    try {
        const cardId = req.params.id;
        const deletedCard = await task.findByIdAndDelete(cardId);
        if (!deletedCard) {
            return res.status(404).json({ message: 'Card not found' });
        }
        res.status(200).json({ message: 'Card deleted successfully', deletedCard });
    }
    catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

router.get("/board/card/:cardId",async (req,res)=>{
    try{
        const cardId = req.params.cardId;
        const cardDetails = await task.findById(cardId);
        if (!cardDetails) {
            return res.status(404).json({ message: 'Card not found' });
        }
        res.status(200).json({data: cardDetails})
    }
    catch{
        console.error('Error Finding Card:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
})


router.get('/counts/:ownerId', async (req, res) => {
    try {
        const { ownerId } = req.params;

        const tasks = await task.find({ owner: ownerId });

        const counts = {
            backlog: tasks.filter(task => task.state === 'Backlog').length,
            todo: tasks.filter(task => task.state === 'To-do').length,
            completed: tasks.filter(task => task.state === 'Done').length,
            inProgress: tasks.filter(task => task.state === 'In Progress').length,
            lowPriority: tasks.filter(task => task.priority === 'low priority').length,
            moderatePriority: tasks.filter(task => task.priority === 'moderate priority').length,
            highPriority: tasks.filter(task => task.priority === 'high priority').length,
            dueDateTasks: tasks.filter(task => task.dueDate).length
        };

        res.json(counts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router