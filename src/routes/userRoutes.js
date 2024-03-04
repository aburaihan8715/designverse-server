import express from 'express';
import * as userController from '../controllers/userController.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.route('/token').post(authController.createToken);
router.route('/').get(userController.getAllUsers).post(authController.register);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

export { router as userRouter };
