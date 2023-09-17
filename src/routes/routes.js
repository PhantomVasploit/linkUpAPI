const { Router } = require('express')

const { authorization } = require('../middleware/auth.middleware')
const { likePost, unlikePost, fetchPostsLikedByUser } = require('../controller/post.likes.controller')
const { fetchUserById, updateUser, deleteUser, fetchAllUsers } = require('../controller/user.controller')
const { followUser, unfollowUser, fetchUserFollowing } = require('../controller/userRelationship.controller')
const { createNewComment, fetchPostComments, updateComment, deleteComment } = require('../controller/comments.controller')
const { createNewPost, getPostById, getUserPosts, updatePost, deletePost, fetchAllPostAndTheirAuthors } = require('../controller/post.controller')
const { register, login, verifyUserRegistration, forgotPassword, validateResetPasswordToken, setNewPassword, deactivateAccount, activateAccount } = require('../controller/auth.controller')


const router = Router()

router.post('/login', login)
router.post('/register', register)
router.post('/forgot-password', forgotPassword)
router.post('/set-new-password', setNewPassword)
router.post('/activate-account', activateAccount)
router.post('/verify-user', verifyUserRegistration)
router.post('/deactivate-account', deactivateAccount)
router.post('/validate-reset-password-token', validateResetPasswordToken)

router.put("/user/:id", authorization, updateUser)
router.get("/users", authorization, fetchAllUsers)
router.get("/user/:id", authorization, fetchUserById)
router.delete("/user/:id", authorization, deleteUser)

router.get('/post/:id', authorization, getPostById)
router.delete('/post/:id', authorization, deletePost)
router.post('/post/:id', authorization, createNewPost)
router.get('/user/post/:id', authorization, getUserPosts)
router.put('/post/:userId/:id', authorization, updatePost)
router.get('/posts', authorization, fetchAllPostAndTheirAuthors)

router.get('/comments/:postId', authorization, fetchPostComments)
router.put('/comment/:userId/:commentId', authorization, updateComment)
router.post('/comment/:postId/:userId', authorization, createNewComment)
router.delete('/comment/:userId/:commentId', authorization, deleteComment)

router.post('/post/like/:userId/:postId', authorization, likePost)
router.delete('/post/like/:userId/:postId', authorization, unlikePost)
router.get('/post/like/:userId', authorization, fetchPostsLikedByUser)

router.get('/user/followings/:followerId', authorization, fetchUserFollowing)
router.post('/user/follow/:followerId/:followingId', authorization, followUser)
router.delete('/user/unfollow/:followerId/:followingId', authorization, unfollowUser)

module.exports = router