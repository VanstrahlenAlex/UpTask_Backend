import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import { corsConfig } from './config/cors';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';


dotenv.config();
//Call the connectDB function
connectDB();

//Initialize the app
const app = express();
app.use(cors(corsConfig));

//Logging
app.use(morgan('dev'))

//Enable reading of JSON formats
app.use(express.json());

//Routes 
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

export default app;
