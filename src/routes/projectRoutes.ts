import { Router } from 'express';
import { body, param } from 'express-validator';
import { ProjectController } from '../controllers/ProjectController';
import { handleInputErrors } from '../middleware/validation';
import { TaskController } from '../controllers/TaskController';
import { projectExists } from '../middleware/project';
import { hasAuthorization, taskBelongsToProject, taskExists } from '../middleware/task';
import { authenticate } from '../middleware/auth';
import { TeamMemberController } from '../controllers/TeamController';
import { NoteController } from '../controllers/NoteController';

const router = Router();

router.use(authenticate);

//Create a project Route
router.post('/',
		body('projectName')
			.notEmpty().withMessage("The name of the project is required"),
		body('clientName')
			.notEmpty().withMessage("The Client of the project is required"),
		body('description')
			.notEmpty().withMessage("The Description of the project is required"),
		handleInputErrors,
		ProjectController.createProject)

//Get all projects Route
router.get('/', ProjectController.getAllProjects)

//Get a project by ID Route
router.get('/:id',
		param('id').isMongoId().withMessage("The ID is not valid"),
		handleInputErrors,
		ProjectController.getProjectById)

router.param('projectId', projectExists);

router.put('/:projectId',
		param('projectId').isMongoId().withMessage("The ID is not valid"),
		body('projectName')
			.notEmpty().withMessage("The name of the project is required"),
		body('clientName')
			.notEmpty().withMessage("The Client of the project is required"),
		body('description')
			.notEmpty().withMessage("The Description of the project is required"),
		handleInputErrors,
		hasAuthorization,
		ProjectController.updateProject)


router.delete('/:projectId',
		param('projectId').isMongoId().withMessage("The ID is not valid"),
		handleInputErrors,
		hasAuthorization,
		ProjectController.deleteProject)


/** Routes for Tasks */


router.post('/:projectId/tasks',
	hasAuthorization,
	body('name').notEmpty().withMessage("The name of the Task is required"),
	body('description').notEmpty().withMessage("The Description of the Task is required"),
	handleInputErrors,
	TaskController.createTask
)

router.get('/:projectId/tasks', 
	TaskController.getProjectTasks
)

router.param('taskId', taskExists);
router.param('taskId', taskBelongsToProject);

router.get('/:projectId/tasks/:taskId',
	param('taskId').isMongoId().withMessage("The ID is not valid"),
	handleInputErrors,
	TaskController.getTaskById
)

router.put('/:projectId/tasks/:taskId',
	hasAuthorization,
	param('taskId').isMongoId().withMessage("The ID is not valid"),
	body('name').notEmpty().withMessage("The name of the Task is required"),
	body('description').notEmpty().withMessage("The Description of the Task is required"),
	handleInputErrors,
	TaskController.updateTask
)

router.delete('/:projectId/tasks/:taskId',
	hasAuthorization,
	param('taskId').isMongoId().withMessage("The ID is not valid"),
	handleInputErrors,
	TaskController.deleteTask
)

router.post('/:projectId/tasks/:taskId/status',
	param('taskId').isMongoId().withMessage("The ID is not valid"),
	body('status').notEmpty().withMessage("The Status of the Task is required"),
	handleInputErrors,
	TaskController.updateStatus
)

/** Routes for Tasks END */
/** ======================== */

/** Routes for Teams */
router.post('/:projectId/team/find',
	body('email').isEmail().toLowerCase().withMessage("The Email of the User is invalid"),
	handleInputErrors,
	TeamMemberController.findMemberByEmail
)

router.get('/:projectId/team',
	TeamMemberController.getProjectTeam
)

router.post('/:projectId/team',
	body('id').isMongoId().withMessage("The ID  is invalid"),
	handleInputErrors,
	TeamMemberController.addMemberById
)

router.delete('/:projectId/team/:userId',
	param('userId').isMongoId().withMessage("The userID  is invalid"),
	handleInputErrors,
	TeamMemberController.removeMemberById
)

/** Routes for Teams END*/
/** ======================== */
/** Routes for Notes */

router.post('/:projectId/tasks/:taskId/notes', 
	body('content').notEmpty().withMessage("The content of the Note is required"),
	handleInputErrors,
	NoteController.createNote
)

router.get('/:projectId/tasks/:taskId/notes', 
	NoteController.getTaskNotes
)

router.delete('/:projectId/tasks/:taskId/notes/:noteId',
	param('noteId').isMongoId().withMessage("The ID is not valid"),
	handleInputErrors,
	NoteController.deleteNote
)
export default router;