const { Router } = require('express')
const { register, login, verifyUserRegistration, forgotPassword, validateResetPasswordToken, setNewPassword } = require('../controller/auth.controller')


const router = Router()

router.post('/login', login)
router.post('/register', register)
router.post('/forgot-password', forgotPassword)
router.post('/set-new-password', setNewPassword)
router.post('/verify-user', verifyUserRegistration)
router.post('/validate-reset-password-token', validateResetPasswordToken)

module.exports = router