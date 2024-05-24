import colors from 'colors';
import signale from 'signale';
import mongoose from "mongoose";
import { exit } from 'node:process';

export const connectDB = async () => { 
	try {
		const {connection} = await mongoose.connect(process.env.DATABASE_URL)
		const url = `${connection.host}:${connection.port}`;
		console.log(signale.info(colors.yellow.bold(`Connected to MongoDB at ${url}`)));
		
		
	} catch (error) {
		console.log(signale.error(colors.bgRed.white.bold("Error connecting to MongoDB")));
		console.log(signale.error(colors.bgRed.white.bold(error.message)));
		exit(1);
		
	}
};