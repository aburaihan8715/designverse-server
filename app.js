import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { userRouter } from './src/routes/userRoutes.js';
import createError from 'http-errors';
import { errorResponse } from './src/utils/response.js';

const app = express();

// middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(cors());

// home route
app.get('/', async (req, res) => {
  res.json({ message: 'Hello from home route!' });
});

app.use('/api/v1/users', userRouter);

// client error route
app.all('*', (req, res, next) => {
  next(createError(404, 'Route not found!'));
});

// server error route
app.use((err, req, res, next) => {
  return errorResponse(res, {
    statusCode: err.status,
    message: err.message,
  });
});

export { app };
