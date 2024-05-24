import { transporter } from "../config/nodemailer";

interface IEmail {
	email: string,
	name: string,
	token: string
}

export class AuthEmail {
	static sendConfirmationEmail = async(user: IEmail) => {
			//SEND EMAIL
			const info = await transporter.sendMail({
				from: 'UpTask <admin@uptask.com>',
				to: user.email,
				subject: "UpTask - Account Confirmation",
				text: "Please confirm your account by clicking the link below ",
				html: `
				<h1>Account Confirmation</h1>
				<p>Hi ${user.name},</p>
				<p>Please confirm your account by clicking the link below:</p>
				<a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirm Account</a>
				<p> Enter the following code: <b>${user.token} </b> </p>
				<p> This token expires in 10 minutes </p>
				`
			});
	}


	static sendPasswordResetToken = async(user: IEmail) => {
			//SEND EMAIL
			const info = await transporter.sendMail({
				from: 'UpTask <admin@uptask.com>',
				to: user.email,
				subject: "UpTask - Reset your password",
				text: "UpTask - Reset your password ",
				html: `
				<h1>Reset your password</h1>
				<p>Hi ${user.name},</p>
				<p>You have requested to reset your password</p>
				<a href="${process.env.FRONTEND_URL}/auth/new-password">Reset your password</a>
				<p> Enter the following code: <b>${user.token} </b> </p>
				<p> This token expires in 10 minutes </p>
				`
			});
	}
}