const mssql = require('mssql')
const crypto = require('crypto')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')

const { sqlConfig } = require('../config/database.connection.config')
const { registrationSchema, loginSchema, overWriteOTP, forgotPasswordSchema, validateResetPasswordTokenSchema } = require('../utils/validators')

module.exports.register = async(req, res)=>{
    try {
        
        if(!req.body){
            return res.status(400).json({error: 'Request body can not be empty'})
        }
        
        const { firstName, lastName, email, profilePicture } = req.body
        const {error} = registrationSchema.validate({ firstName, lastName, email, profilePicture })
        if(error){
            return res.status(422).json({error: error.message})
        }
    
        const pool = await mssql.connect(sqlConfig)
        const checkEmailQuery = await pool
        .request()
        .input('email', email)
        .execute('findUserByEmailProc')
    
        if(checkEmailQuery.recordset.length > 0){
            return res.status(409).json({error: 'This email address is already registered'})
        }
        
        const otp = crypto.randomBytes(8).toString('hex')
        await pool
        .request()
        .input('first_name', firstName)
        .input('last_name', lastName)
        .input('email', email)
        .input('password', otp)
        .input('avatar', profilePicture)
        .execute('createNewUserProcedure')
    
        const trasporter = nodemailer.createTransport({
            service: 'gmail',
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PWD
            }
        })
    
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Link Up Registration',
            text: `Congratulations!!!\nWe are glad you could join the world greatest social platfrom.\nIn order to begin exploring and expressing yourself we've provided you with a one time password please use in the next few steps and you'll be ready to go.\nOTP: ${otp}`
        }
    
        trasporter.sendMail(mailOptions, (error, info)=>{
            if(error){
                return res.status(500).json({error: `${error.message}`})
            }else{
                return res.status(201).json({message: 'User account created successfully'})
            }
        })

    } catch (error) {
        return res.status(500).json({error: 'Internal server error'})
    }
}

module.exports.verifyUserRegistration = async (req, res)=>{
    try {

        if(!req.body){
            return res.status(400).json({error: 'Request body can not be empty'})
        }

        const { email, userPassword, newPassword } = req.body
        const {error} = overWriteOTP.validate({ email, userPassword, newPassword })
        if(error){
            return res.status(422).json({error: error.message})
        }

        const pool = await mssql.connect(sqlConfig)
        const checkEmailQuery = await pool
        .request()
        .input('email', email)
        .execute('findUserByEmailProc')

        if(checkEmailQuery.recordset.length <= 0){
            return res.status(409).json({error: 'This email is not registred'})
        }

        if(userPassword === checkEmailQuery.recordset[0].password){
            const salt = await bcrypt.genSalt(10)
            const hash = await bcrypt.hash(newPassword, salt)
            await pool
            .request()
            .input('email', email)
            .input('password', hash)
            .execute('overWriteOtpProc')
            return res.status(200).json({message: 'Password reset successful'})           
        }

        return res.status(409).json({error: 'Invalid OTP'})

    } catch (error) {
        return res.status(500).json({error: 'Internal server error'})
    }
}


module.exports.login = async(req, res)=>{
    try {
        
        if(!req.body){
            return res.status(400).json({error: 'Request body can not be empty'})
        }

        const { email, userPassword } = req.body
        const {error} = loginSchema.validate({ email, userPassword })
        if(error){
            return res.status(422).json({error: error.message})
        }

        const pool = await mssql.connect(sqlConfig)
        const checkEmailQuery = await pool
        .request()
        .input('email', email)
        .execute('findUserByEmailProc')

        if(checkEmailQuery.recordset.length <= 0){
            return res.status(409).json({error: 'Invalid login credentials'})
        }

        if(checkEmailQuery.recordset[0].is_deleted == 1){
            return res.status(403).json({error: 'User account is deactivated'})
        }

        const valid = await bcrypt.compare(userPassword, checkEmailQuery.recordset[0].password)
        if(!valid){
            return res.status(401).json({error: 'Invalid login credentials'})
        }

        const token = jwt.sign({email: checkEmailQuery.recordset[0].email, id: checkEmailQuery.recordset[0].id}, process.env.SECRET_KEY, {
            expiresIn: 24*60*60
        })

        const {password, ...user} = checkEmailQuery.recordset[0]

        return res.status(200).json({message: 'login successful', token, user})

    } catch (error) {
        return res.status(500).json({error: 'Internal server error'})
    }
}


module.exports.forgotPassword = async(req, res)=>{
    try {

        if(!req.body){
            return res.status(400).json({error: 'Request body can not be empty'})
        }

        const {email} = req.body
        const {error} = forgotPasswordSchema.validate({email})
        if(error){
            return res.status(422).json({error: error.message})
        }

        const pool = await mssql.connect(sqlConfig)
        const checkEmailQuery = await pool
        .request()
        .input('email', email)
        .execute('findUserByEmailProc')

        if(checkEmailQuery.recordset.length <= 0){
            return res.status(409).json({error: 'This email is not registered'})
        }

        const resetPasswordToken = crypto.randomBytes(8).toString('hex')

        

        const trasporter = nodemailer.createTransport({
            service: 'gmail',
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PWD
            }
        })
    
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Link Up Reset Your Password',
            text: `Please use the token below to reset your password\nThe reset password token is: ${resetPasswordToken}`
        }
    
        trasporter.sendMail(mailOptions, async(error, info)=>{
            if(error){
                return res.status(500).json({error: `${error.message}`})
            }else{
                await pool
                .request()
                .input('email', email)
                .input('reset_password_token', resetPasswordToken)
                .execute('forgotPasswordProc')
                return res.status(200).json({message: 'Reset password token sent. Please check your email inbox'})
            }
        })

    } catch (error) {
        return res.status(500).json({error: 'Internal server error'})
    }
}

module.exports.validateResetPasswordToken = async(req, res)=>{
    try {

        if(!req.body){
            return res.status(400).json({error: 'Request body must be provided'})
        }

        const { email, resetPasswordToken } = req.body
        const { error } = validateResetPasswordTokenSchema.validate({ email, resetPasswordToken})
        if(error){
            return res.status(422).json({error: error.message})
        }

        const pool = await mssql.connect(sqlConfig)
        const checkEmailQuery = await pool
        .request()
        .input('email', email)
        .execute('findUserByEmailProc')

        if(checkEmailQuery.recordset.length <= 0){
            return res.status(409).json({error: 'This email is unregistered'})
        }

        if(resetPasswordToken == checkEmailQuery.recordset[0].password_reset_token){
            return res.status(200).json({message: 'Proceed to set new password'})
        }

        return res.status(409).json({error: 'Invalid reset password token'})

    } catch (error) {
        return res.status(500).json({error: 'Internal server error'})
    }
}


module.exports.setNewPassword = async(req, res)=>{
    try {

        if(!req.body){
            return res.status(400).json({error: 'Request body can not be empty'})
        }

        const { email, userPassword } = req.body
        const {error} = loginSchema.validate({email, userPassword})
        if(error){
            return res.status(422).json({error: error.message})
        }

        const pool = await mssql.connect(sqlConfig)
        const checkEmailQuery = await pool
        .request()
        .input('email', email)
        .execute('findUserByEmailProc')

        if(checkEmailQuery.recordset.length <= 0){
            return res.status(409).json({error: 'This email is unregistered'})
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPwd = await bcrypt.hash(userPassword, salt)

        await pool
        .request()
        .input('email', email)
        .input('password', hashedPwd)
        .execute('changePasswordProc')

        return res.status(200).json({message: 'Password reset successfull'})

    } catch (error) {
        return res.status(500).json({error: 'Internal server error'})
    }
}

module.exports.deactivateAccount = async(req, res)=>{
    try {
        
        if(!req.body){
            return res.status(400).json({error: 'Request body can not be empty'})
        }

        const {email, userPassword} = req.body
        const {error} = loginSchema.validate({email, userPassword})
        if(error){
            return res.status(422).json({error: error.message})
        }

        const pool = await mssql.connect(sqlConfig)
        const checkEmailQuery = await pool
        .request()
        .input('email', email)
        .execute('findUserByEmailProc')

        if(checkEmailQuery.recordset.length <= 0){
            return res.status(409).json({error: 'This email is not registred'})
        }

        if(checkEmailQuery.recordset[0].is_deleted == 1){
            return res.status(403).json({error: "User account is already deactivated"})
        }

        const valid = await bcrypt.compare(userPassword, checkEmailQuery.recordset[0].password)
        if(!valid){
            return res.status(409).json({error: 'Authentication failed'})
        }

        await pool
        .request()
        .input('email', email)
        .execute('deactivateUserProc')

        return res.status(200).json({message: 'User account deactivated'})

    } catch (error) {
        return res.status(500).json({error: "Internal server error"})
    }
}


module.exports.activateAccount = async(req, res)=>{
    try {
        
        if(!req.body){
            return res.status(400).json({error: 'Request body can not be empty'})
        }

        const {email} = req.body
        const {error} = forgotPasswordSchema.validate({email})
        if(error){
            return res.status(422).json({error: error.message})
        }

        const pool = await mssql.connect(sqlConfig)
        const checkEmailQuery = await pool
        .request()
        .input('email', email)
        .execute('findUserByEmailProc')

        if(checkEmailQuery.recordset.length <= 0){
            return res.status(409).json({error: 'This email is not registered'})
        }

        if(checkEmailQuery.recordset[0].is_deleted == 0){
            return res.status(400).json({error: 'User account is active'})
        }

        await pool
        .request()
        .input('email', email)
        .execute('restoreUserProc')

        return res.status(200).json({message: 'User account activated successfully'})


    } catch (error) {
        return res.status(500).json({error: 'Internal server error'})
    }
}