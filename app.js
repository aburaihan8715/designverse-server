import express from 'express';
import morgan from 'morgan';
import { userRouter } from './src/routes/userRoutes.js';

const app = express();

// middleware
app.use(morgan('dev'));
app.use(express.json());

// home route
app.get('/', async (req, res) => {
  res.json({ message: 'Hello from home route!' });
});

app.use('/api/v1/users', userRouter);

export { app };
