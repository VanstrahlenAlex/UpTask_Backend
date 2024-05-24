import type {Request, Response} from 'express';

//Colors y signale
import colors from 'colors';
import signale from 'signale';

import Task from '../models/Task';

export class TaskController {
	static createTask = async(req : Request, res : Response) => {
		console.log(signale.info(colors.bgWhite.bold("In the Function called: createTask in TaskController")));
		try {
			const task = new Task(req.body);
			task.project = req.project._id;
			req.project.tasks.push(task.id);
			await Promise.allSettled([task.save(), req.project.save()])
			res.send("Task created successfully");
		} catch (error) {
			res.status(500).json({ error: error.message });
			
		}
	}

	static getProjectTasks = async(req : Request, res : Response) => {
		console.log(signale.info(colors.bgWhite.bold("In the Function called: getProjectTasks in TaskController")));
		try {
			const tasks = await Task.find({project: req.project._id}).populate('project');
			res.json(tasks);
		} catch (error) {
			res.status(500).json({ error: error.message });
			
		}
	}

	static getTaskById = async(req : Request, res : Response) => {
		console.log(signale.info(colors.bgWhite.bold("In the Function called: getTaskById in TaskController")));
		try {
			if(req.task.project.toString() !== req.project.id) {
				const error = new Error("Invalid Action");
				return res.status(400).json({ error: error.message });
			}
			const task = await Task.findById(req.task.id).populate({path: 'completedBy.user', select: 'id name email'})
							.populate({path: 'notes', populate: {path: 'createdBy' , select: 'id name email'}})	
			;
			res.json(task)
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	static updateTask = async(req : Request, res : Response) => {
		console.log(signale.info(colors.bgWhite.bold("In the Function called: updateTask in TaskController")));
		try {

			req.task.name = req.body.name;
			req.task.description = req.body.description;
			await req.task.save();
			res.send("Task updated successfully");
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	static deleteTask = async(req : Request, res : Response) => {
		console.log(signale.info(colors.bgWhite.bold("In the Function called: deleteTask in TaskController")));
		try {
			req.project.tasks = req.project.tasks.filter( task => task.toString() !== req.task.id.toString());
			await Promise.allSettled([req.task.deleteOne(), req.project.save()])
			res.send("Task deleted successfully");
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	static updateStatus = async(req : Request, res : Response) => {
		console.log(signale.info(colors.bgWhite.bold("In the Function called: updateStatus in TaskController")));
		try {

			const {status} = req.body;
			req.task.status = status;
			const data = {
				user: req.user.id,
				status
			}
			req.task.completedBy.push(data);
			await req.task.save();
			res.send("Task status updated successfully");
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}
}