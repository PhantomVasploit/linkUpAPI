const { Router } = require('express')
const { register, login, verifyUserRegistration, forgotPassword, validateResetPasswordToken, setNewPassword, deactivateAccount, activateAccount } = require('../controller/auth.controller')
const { fetchUserById, updateUser, deleteUser, fetchAllUsers } = require('../controller/user.controller')


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

module.exports = router