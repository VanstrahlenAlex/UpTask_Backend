import type { Request, Response } from 'express';
import Project from '../models/Project';
import colors from 'colors';
import signale from 'signale';

export class ProjectController { 

	static createProject = async(req : Request, res : Response) => {
		console.log(signale.info(colors.bgWhite.bold("In the Function called: createProject")));
		const project = new Project(req.body);
		//Assign the manager to the project
		project.manager = req.user.id;
		try {
			await project.save();
			res.send("Project created successfully");
		} catch (error) {
			console.log(error);
			
		}
	}

	static getAllProjects = async(req : Request, res : Response) => {
		console.log(signale.info(colors.bgWhite.bold("In the Function called: getAllProjects")));
		try {
			const projects = await Project.find({
				$or: [
					{manager: {$in: [req.user.id]}},
					{team: {$in: [req.user.id]}}
				]
			});
			res.json(projects);
		} catch (error) {
			
		}

	}
	// End getAllProjects Function

	static getProjectById = async(req : Request, res : Response) => {
		console.log(signale.info(colors.bgWhite.bold("In the Function called: getProjectById")));

		const { id } = req.params;
		try {
			const project = await Project.findById(id).populate('tasks');
			if(!project) {
				const error = new Error("Project not found");
				return res.status(404).json({ error: error.message });
			}
			if(project.manager.toString()!== req.user.id.toString() && !project.team.includes(req.user.id)) {
				const error = new Error("Invalid action");
				return res.status(404).json({ error: error.message });
			}
			res.json(project);
		} catch (error) {
			console.log(signale.error(colors.bgRed.bold(error)));
			
		}
	} 

	static updateProject = async(req : Request, res : Response) => {
		console.log(signale.info(colors.bgWhite.bold("In the Function called: updateProject")));

		
		try {

			req.project.clientName = req.body.clientName;
			req.project.projectName = req.body.projectName;
			req.project.description = req.body.description;
			await req.project.save();
			res.send("Project updated successfully");
		} catch (error) {
			console.log(signale.error(colors.bgRed.bold(error)));
		}
	}
	
	static deleteProject = async(req : Request, res : Response) => {
		console.log(signale.info(colors.bgWhite.bold("In the Function called: deleteProject")));
		try {

			await req.project.deleteOne();		
			res.send("Project delete successfully");
		} catch (error) {
			console.log(signale.error(colors.bgRed.bold(error)));
		}
	} 
}