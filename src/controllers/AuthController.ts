import type { Request, Response } from "express";
import colors from 'colors';
import signale from 'signale';
import User from "../models/User";
import { checkPassword, hashPassword } from "../utils/auth";
import Token from "../models/Token";
import { generateToken } from "../utils/token";
import { AuthEmail } from "../emails/AuthEmail";
import { generateJWT } from "../utils/jwt";

export class AuthController {

	static createAccount = async (req : Request, res : Response) => {
		console.log(signale.info(colors.bgWhite.bold("In the Function called: createAccount in AuthController")));
		try {
			const { password, email } = req.body;

			//Preventing Duplicates
			const userExists = await User.findOne({ email });
			if(userExists) {
				const error = new Error("User already exists");
				return res.status(409).json({ error: error.message });
			}
			//Create a new User
			const user = new User(req.body);

			//Hash Password
			user.password = await hashPassword(password)

			//Generate Token
			const token = new Token();
			token.token = generateToken()
			token.user = user.id;
			
			//Send Confirmation Email
			AuthEmail.sendConfirmationEmail({
				email: user.email,
				name: user.name,
                token: token.token
			})


			await Promise.allSettled([user.save(),  token.save()]);
			res.send("Account created successfully, please confirm your email");
		} catch (error) {
			res.status(500).json({ error: error})
		}
	}

	static confirmAccount = async (req : Request, res : Response) => {
		console.log(signale.info(colors.bgWhite.bold("In the Function called: confirmAccount in AuthController")));

		try {
			const { token } = req.body;
			const tokenExists = await Token.findOne({ token });
			if(!tokenExists){
				const error = new Error("Token does not exist");
                return res.status(404).json({ error: error.message });
			}

			const user = await User.findById(tokenExists.user);
            user.confirmed = true;

			await Promise.allSettled([user.save(),  tokenExists.deleteOne()]);
            res.send("Account confirmed successfully");
		} catch (error) {
			res.status(500).json({ error: error})
		}
	}

	// Login
	static login = async (req : Request, res : Response) => {
		console.log(signale.info(colors.bgWhite.bold("In the Function called: login in AuthController")));
		try {
			const { email, password } = req.body;
			const user = await User.findOne({ email });
			if(!user) {
				const error = new Error("User does not exist");
				return res.status(404).json({ error: error.message });
			}
			if(!user.confirmed) {
				const token = new Token();
				token.user = user.id;
				token.token = generateToken();
				await token.save();

				//Send Confirmation Email
				AuthEmail.sendConfirmationEmail({
					email: user.email,
					name: user.name,
					token: token.token
				})

				const error = new Error("The account is not confirmed, please check your email for the confirmation link");
				return res.status(401).json({ error: error.message });
			}

			//Check Password is correct
			const isPasswordCorrect = await checkPassword(password, user.password);
			if(!isPasswordCorrect) {
				const error = new Error("The password is incorrect");
				return res.status(401).json({ error: error.message });
			}
			
			//
			const token = generateJWT({id: user._id});
			res.send(token)	
			
		} catch (error) {
			res.status(500).json({ error: error})
		}
	}

	// Request Confirmation Code
	static requestConfirmationCode = async (req : Request, res : Response) => {
		console.log(signale.info(colors.bgWhite.bold("In the Function called: requestConfirmationCode in AuthController")));
		try {
			const { email } = req.body;

			//User Existes
			const user = await User.findOne({ email });
			if(!user) {
				const error = new Error("The user is not registered");
				return res.status(404).json({ error: error.message });
			}

			if(user.confirmed) {
				const error = new Error("The user is already confirmed");
				return res.status(403).json({ error: error.message });
			}
			//Generate Token
			const token = new Token();
			token.token = generateToken()
			token.user = user.id;
			
			//Send Confirmation Email
			AuthEmail.sendConfirmationEmail({
				email: user.email,
				name: user.name,
                token: token.token
			})

			await Promise.allSettled([user.save(),  token.save()]);
			res.send("A new token has been sent, please check your email.");
		} catch (error) {
			res.status(500).json({ error: error})
		}
	}


	static forgotPassword = async (req : Request, res : Response) => {
		console.log(signale.info(colors.bgWhite.bold("In the Function called: forgotPassword in AuthController")));
		try {
			const { email } = req.body;

			//User Exists
			const user = await User.findOne({ email });
			if(!user) {
				const error = new Error("The user is not registered");
				return res.status(404).json({ error: error.message });
			}

			//Generate Token
			const token = new Token();
			token.token = generateToken()
			token.user = user.id;
			await token.save();
			
			//Send Confirmation Email
			AuthEmail.sendPasswordResetToken({
				email: user.email,
				name: user.name,
                token: token.token
			})
			res.send("Check your email for instructions");
		} catch (error) {
			res.status(500).json({ error: error})
		}
	}

	static validateToken = async (req : Request, res : Response) => {
		console.log(signale.info(colors.bgWhite.bold("In the Function called: validateToken in AuthController")));

		try {
			const { token } = req.body;
			const tokenExists = await Token.findOne({ token });
			if(!tokenExists){
				const error = new Error("Token does not exist");
                return res.status(404).json({ error: error.message });
			}
            res.send("Valid Token, define your new Password");
		} catch (error) {
			res.status(500).json({ error: error})
		}
	}

	static updatePasswordWithToken = async (req : Request, res : Response) => {
		console.log(signale.info(colors.bgWhite.bold("In the Function called: updatePassword in AuthController")));

		try {
			const { token } = req.params;
			const { password } = req.body;
			const tokenExists = await Token.findOne({ token });
			if(!tokenExists){
				const error = new Error("Token does not exist");
                return res.status(404).json({ error: error.message });
			}
			const user = await User.findById(tokenExists.user);
			user.password = await hashPassword(password);
			await Promise.allSettled([user.save(), tokenExists.deleteOne()]);
            res.send("Password has been changed successfully");
		} catch (error) {
			res.status(500).json({ error: error})
		}
	}


	static user = async (req : Request, res : Response) => {
		console.log(signale.info(colors.bgWhite.bold("In the Function called: updatePassword in AuthController")));
		return res.json(req.user);
	}

	static updateProfile = async (req : Request, res : Response) => {
		console.log(signale.info(colors.bgWhite.bold("In the Function called: updateProfile in AuthController")));
		const {name, email} = req.body;
		req.user.name = name;
		req.user.email = email;

		const userExists = await User.findOne({email});
		if(userExists && userExists.id.toString() !== req.user.id.toString()) {
			const error = new Error("Email already exists");
            return res.status(409).json({ error: error.message });
		}
		try {
			await req.user.save();
			res.send("Profile has been updated successfully");
		} catch (error) {
			res.status(500).json({ error: error})
		}
	}

	static updateCurrentUserPassword = async (req : Request, res : Response) => {
		console.log(signale.info(colors.bgWhite.bold("In the Function called: updateCurrentUserPassword in AuthController")));

		const { current_password, password  } = req.body;

		const user = await User.findById(req.user.id);
		const isPasswordCorrect = await checkPassword(current_password, user.password);
		if(!isPasswordCorrect) {
			const error = new Error("The current Password is incorrect");
            return res.status(401).json({ error: error.message });
		}
		try {
			user.password = await hashPassword(password);
			await user.save();
			res.send("Password has been changed successfully");
		} catch (error) {
			res.status(500).json({ error: error})
		}
	}

	static checkPassword = async (req : Request, res : Response) => {
		console.log(signale.info(colors.bgWhite.bold("In the Function called: updateCurrentUserPassword in AuthController")));

		const {  password } = req.body;

		const user = await User.findById(req.user.id);
		const isPasswordCorrect = await checkPassword(password, user.password);
		if(!isPasswordCorrect) {
			const error = new Error("The Password is incorrect");
            return res.status(401).json({ error: error.message });
		}
		res.send("Password is Correct");
	}
}