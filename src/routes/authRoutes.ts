import {Router} from 'express';
import { body, param } from 'express-validator';
import { AuthController } from '../controllers/AuthController';
import { handleInputErrors } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = Router();	

router.post('/create-account', 
	body('name').notEmpty().withMessage('The name is necessary'),
	body('password').isLength({min: 8}).withMessage('The password is too short, the minimum length is 8'),
	body('password_confirmation').custom((value, {req}) => {
		if(value!== req.body.password) {
			throw new Error('Passwords do not match');
		}
		return true;
	}),

	body('email').isEmail().withMessage('The Email is not valid'),
	handleInputErrors,
	AuthController.createAccount
);

router.post('/confirm-account',
	body('token').notEmpty().withMessage('The token is necessary'),
	handleInputErrors,
	AuthController.confirmAccount
);

//authentication 
router.post('/login',
	body('email').isEmail().withMessage('The Email is not valid'),
	body('password').notEmpty().withMessage('The password cannot be empty'),
	handleInputErrors,
	AuthController.login
);


router.post('/request-code',
	body('email').isEmail().withMessage('The Email is not valid'),
	handleInputErrors,
	AuthController.requestConfirmationCode
);

//Forgot Password Function
router.post('/forgot-password',
	body('email').isEmail().withMessage('The Email is not valid'),
	handleInputErrors,
	AuthController.forgotPassword
);

router.post('/validate-token',
	body('token').notEmpty().withMessage('The token is necessary'),
	handleInputErrors,
	AuthController.validateToken
)

router.post('/update-password/:token',
	param('token').isNumeric().withMessage('The token is necessary'),
	body('password').isLength({min: 8}).withMessage('The password is too short, the minimum length is 8'),
	body('password_confirmation').custom((value, {req}) => {
		if(value!== req.body.password) {
			throw new Error('Passwords do not match');
		}
		return true;
	}),
	handleInputErrors,
	AuthController.updatePasswordWithToken
)
router.get('/user', 
	authenticate,
	AuthController.user
)

/**Profile START */
router.put('/profile',
	authenticate,
	body('name').notEmpty().withMessage('The name is necessary'),
	body('email').isEmail().withMessage('The Email is not valid'),
	AuthController.updateProfile
)

router.post('/update-password', 
	authenticate,
	body('current_password').notEmpty().withMessage('The current password is necessary'),
    body('password').isLength({min: 8}).withMessage('The password is too short, the minimum length is 8'),
	body('password_confirmation').custom((value, {req}) => {
		if(value!== req.body.password) {
			throw new Error('Passwords do not match');
		}
		return true;
	}),
	handleInputErrors,
	AuthController.updateCurrentUserPassword
)

/**Profile END */

router.post('/check-password',
	authenticate,
	body('password').notEmpty().withMessage('The password is necessary'),
	handleInputErrors,
	AuthController.checkPassword
)


export default router;