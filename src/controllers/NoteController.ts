import type {Request, Response} from 'express';
import Note, {INote} from '../models/Note';
import { Types } from 'mongoose';

//Colors y signale
import colors from 'colors';
import signale from 'signale';


type NoteParams = {
	noteId: Types.ObjectId;
}

export class NoteController {
	static createNote = async(req : Request<{}, {}, INote>, res : Response) => {
		console.log(signale.info(colors.bgWhite.bold("In the Function called: createNote in NoteController")));
		console.log(req.body);
		const { content } = req.body;
		const note = new Note()
		note.content = content;
		note.createdBy = req.user.id;
		note.task = req.task.id;

		req.task.notes.push(note.id);

		try {
			await Promise.allSettled([note.save(), req.task.save()]);
            res.send("Note created successfully");
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
		
	}
	static getTaskNotes = async(req : Request, res : Response) => {
		console.log(signale.info(colors.bgWhite.bold("In the Function called: getTaskNotes in NoteController")));
		try {
			const notes  = await Note.find({task: req.task.id});
			res.json(notes);
		} catch (error) {
			res.status(500).json({ error: error.message });
			
		}
	}

	static deleteNote = async(req : Request<NoteParams>, res : Response) => {
		console.log(signale.info(colors.bgWhite.bold("In the Function called: deleteNote in NoteController")));

		const { noteId } = req.params;
		const note = await Note.findById(noteId);

		if(!note) {
			const error = new Error("Note not found");
			return res.status(404).json({ error: error.message });
		}
		if(note.createdBy.toString() !== req.user.id.toString()) {
			const error = new Error("Invalid Action");
			return res.status(401).json({ error: error.message });
		}
		req.task.notes = req.task.notes.filter((note) => note.toString() !== noteId.toString())
		try {
			await Promise.allSettled([ req.task.save(), note.deleteOne()]);
			res.send("Note deleted successfully");
		} catch (error) {
			res.status(500).json({ error: error.message });
			
		}
	}
}