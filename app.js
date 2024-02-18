import express from 'express';
import morgan from 'morgan';
import { userRouter } from './src/routes/userRoutes.js';
import { authRouter } from './src/routes/authRoutes.js';

const app = express();

// middleware
app.use(morgan('dev'));

// home route
// app.get("/", async (req, res) => {
//   res.json({ message: "Hello from home route!" });
// });

app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);

export { app };
