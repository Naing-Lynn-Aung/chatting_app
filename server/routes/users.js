import express from 'express';
import UserController from '../controllers/UserController.js';
import { body } from 'express-validator';
import handleErrorMessage from '../middlewares/handleErrorMessage.js';
import AuthMiddleware from '../middlewares/AuthMiddleware.js'
import upload from '../helpers/upload.js';

const router = express.Router();

router.get('/search', AuthMiddleware, UserController.search)
router.get('/', AuthMiddleware, UserController.index)
router.get('/active',AuthMiddleware, UserController.activeUser)
router.get('/me', AuthMiddleware, UserController.me);
router.get('/:id', UserController.show)
router.post('/register',[
    body('name').notEmpty().withMessage('Name is required'),
    body('email').notEmpty().withMessage('Email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    body('confirmPassword')
    .notEmpty().withMessage('Confirm Password is required')
    .custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
        }
        return true;
    })
], handleErrorMessage, UserController.store)
router.post('/login', [
    body('email').notEmpty().withMessage('Email is required'),
    body('password').notEmpty().withMessage('Password is required')
], handleErrorMessage, UserController.login)
router.post('/logout', UserController.logout)
router.patch('/:id', upload.single('avatar'), UserController.update)
router.delete('/:id', UserController.destroy)


export default router;