const { Router } = require('express')

const { likePost, unlikePost, fetchPostsLikedByUser } = require('../controller/post.likes.controller')
const { fetchUserById, updateUser, deleteUser, fetchAllUsers } = require('../controller/user.controller')
const { createNewComment, fetchPostComments, updateComment, deleteComment } = require('../controller/comments.controller')
const { createNewPost, getPostById, getUserPosts, updatePost, deletePost, fetchAllPostAndTheirAuthors } = require('../controller/post.controller')
const { register, login, verifyUserRegistration, forgotPassword, validateResetPasswordToken, setNewPassword, deactivateAccount, activateAccount } = require('../controller/auth.controller')
const { followUser, unfollowUser, fetchUserFollowing } = require('../controller/userRelationship.controller')


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
router.delete('/comment/:userId/:commentId', deleteComment)

router.post('/post/like/:userId/:postId', likePost)
router.delete('/post/like/:userId/:postId', unlikePost)
router.get('/post/like/:userId', fetchPostsLikedByUser)

router.get('/user/followings/:followerId', fetchUserFollowing)
router.post('/user/follow/:followerId/:followingId', followUser)
router.delete('/user/unfollow/:followerId/:followingId', unfollowUser)

module.exports = router