import Task from "../models/task.model.js";

export const createTask = async (req, res) => {
    try {
        const { title, description, priority, dueDate, owner, completed } = req.body;

        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: "Title and description are required"
            });
        }

        const task = await Task.create({
            title,
            description,
            priority,
            dueDate,
            owner: req.user.id,
            completed: completed === "Yes" || completed === true
        });


        res.status(201).json({
            success: true,
            task: task
        })

    } catch (error) {

        console.log('Error in Create Task', error);
        res.status(500).json({
            success: false,
            message: "Error in Create task Controller",
            error: error.message
        })
    }
}




// get all task for Loged in User

export const getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ owner: req.user.id }).sort({ createdAt: -1 })
        if (!tasks) {
            return res.status(400).json({
                success: false,
                message: "Tasks for this user not exists"
            });
        }

        res.status(200).json({
            success: true,
            tasks
        })
    } catch (error) {
        console.log('Error in Create Task', error);
        res.status(500).json({
            success: false,
            message: "Error in Create task Controller",
            error: error.message
        })
    }
}

// get single task by loggrd user

export const getTaskById = async (req, res) => {
    try {
        const userId = req.user.id;
        const taskId = req.params.id;

        const task = await Task.findOne({ _id: taskId, owner: userId })

        if (!task) {
            return res.status(401).json({
                success: false,
                message: "Task does not exists"
            })
        }

        res.status(200).json({
            success: true,
            task

        })

    } catch (error) {
        console.log('Error in Single Task', error);
        res.status(500).json({
            success: false,
            message: "Error in Single task Controller",
            error: error.message
        })
    }
}

// Update task

export const updateTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        const data = { ...req.body };

        if (data.completed !== undefined) {
            data.completed = data.completed === 'Yes' || data.completed === true;
        }
        const task = await Task.findOneAndUpdate(
            { _id: taskId, owner: req.user.id },
            data,
            { new: true, runValidators: true }
        );

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        res.status(200).json({
            success: true,
            task
        });

    } catch (error) {
        console.log('Error in Update Task', error);
        res.status(500).json({
            success: false,
            message: "Error in Update task Controller",
            error: error.message
        });
    }
};


// delete  task 

export const deleteTask = async (req, res) => {
    try {
        const deleteTask = await Task.findOneAndDelete({
            _id: req.params.id, owner: req.user.id
        })

        if (!deleteTask) {
            return res.status(401).json({
                success: false,
                message: "task  not found and deleted"
            })
        }

        res.status(200).json({
            succes:true,
            message:"Task Deleted"
        })
    } catch (error) {
        console.log('Error in Delete Task', error);
        res.status(500).json({
            success: false,
            message: "Error in Delete task Controller",
            error: error.message
        });
    }
}