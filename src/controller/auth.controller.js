const mssql = require('mssql')
const crypto = require('crypto')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')

const { sqlConfig } = require('../config/database.connection.config')
const { registrationSchema, loginSchema, overWriteOTP } = require('../utils/validators')

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

        if(checkEmailQuery.recordset.length < 0){
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
        console.log(error.message);
        return res.status(500).json({error: 'Internal server error'})
    }
}