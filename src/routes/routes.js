const { Router } = require('express')
const { register, login, verifyUserRegistration, forgotPassword } = require('../controller/auth.controller')


const router = Router()

router.post('/login', login)
router.post('/register', register)
router.post('/forgot-password', forgotPassword)
router.post('/verify-user', verifyUserRegistration)

module.exports = router