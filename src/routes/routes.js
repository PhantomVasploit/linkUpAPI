const { Router } = require('express')
const { register, login, verifyUserRegistration, forgotPassword, validateResetPasswordToken, setNewPassword, deactivateAccount, activateAccount } = require('../controller/auth.controller')
const { fetchUserById, updateUser, deleteUser, fetchAllUsers } = require('../controller/user.controller')
const { createNewPost, getAllPosts, getPostById, getUserPosts, updatePost, deletePost } = require('../controller/post.controller')


const router = Router()

router.post('/login', login)
router.post('/register', register)
router.post('/forgot-password', forgotPassword)
router.post('/set-new-password', setNewPassword)
router.post('/activate-account', activateAccount)
router.post('/verify-user', verifyUserRegistration)
router.post('/deactivate-account', deactivateAccount)
router.post('/validate-reset-password-token', validateResetPasswordToken)

router.get("/users", fetchAllUsers)
router.put("/user/:id", updateUser)
router.delete("/user/:id", deleteUser)
router.get("/user/:id", fetchUserById)

router.get('/posts', getAllPosts)
router.put('/post/:userId/:id', updatePost)
router.get('/post/:id', getPostById)
router.delete('/post/:id', deletePost)
router.post('/post/:id', createNewPost)
router.get('/user/post/:id', getUserPosts)

module.exports = router