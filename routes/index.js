import express from 'express';
import authRoutes from './authRoutes.js';

const routes = express.Router();

routes.use('/auth', authRoutes);

export default routes;