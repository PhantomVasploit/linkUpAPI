const { Router } = require('express')

const { fetchUserById, updateUser, deleteUser, fetchAllUsers } = require('../controller/user.controller')
const { createNewPost, getPostById, getUserPosts, updatePost, deletePost, fetchAllPostAndTheirAuthors } = require('../controller/post.controller')
const { register, login, verifyUserRegistration, forgotPassword, validateResetPasswordToken, setNewPassword, deactivateAccount, activateAccount } = require('../controller/auth.controller')
const { createNewComment, fetchPostComments, updateComment, deleteComment } = require('../controller/comments.controller')


const router = Router()

router.post('/login', login)
router.post('/register', register)
router.post('/forgot-password', forgotPassword)
router.post('/set-new-password', setNewPassword)
router.post('/activate-account', activateAccount)
router.post('/verify-user', verifyUserRegistration)
router.post('/deactivate-account', deactivateAccount)
router.post('/validate-reset-password-token', validateResetPasswordToken)

router.put("/user/:id", updateUser)
router.get("/users", fetchAllUsers)
router.get("/user/:id", fetchUserById)
router.delete("/user/:id", deleteUser)

router.get('/post/:id', getPostById)
router.delete('/post/:id', deletePost)
router.post('/post/:id', createNewPost)
router.get('/user/post/:id', getUserPosts)
router.put('/post/:userId/:id', updatePost)
router.get('/posts', fetchAllPostAndTheirAuthors)

router.get('/comments/:postId', fetchPostComments)
router.put('/comment/:userId/:commentId', updateComment)
router.post('/comment/:postId/:userId', createNewComment)
router.delete('/comment/:userId/:commnetId', deleteComment)

module.exports = router