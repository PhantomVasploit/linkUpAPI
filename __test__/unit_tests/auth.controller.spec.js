const mssql = require('mssql')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')

const { register, verifyUserRegistration, login, forgotPassword, validateResetPasswordToken, setNewPassword, deactivateAccount, activateAccount } = require('../../src/controller/auth.controller')
const { registrationSchema, overWriteOTP, loginSchema, forgotPasswordSchema, validateResetPasswordTokenSchema } = require('../../src/utils/validators')



describe('User registration test suites', ()=>{

    it('should return status code of 400 and error message if request body is not empty or null', async()=>{

        const request = {}

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        await register(request, response)

        expect(response.status).toHaveBeenCalledWith(400)
        expect(response.json).toHaveBeenCalledWith({error: 'Request body can not be empty'})

    })

    it('should return a status code of 422 and error message if validation fails', async()=>{
        
        const registrationValidation = jest.spyOn(registrationSchema, 'validate')
        registrationValidation.mockReturnValue({error: new Error('Invalid input')})

        const request = {
            body: {
                firstName: "Paul",
                lastName: "Sanga",
                email: "paul.nyamawi99@gmail.com",
                profilePicture: "https://www.google.com/imgres?imgurl=https%3A%2F%2Fwallpapercg.com%2Fdownload%2Fyuji-itadori-3840x2743-9543.jpg&tbnid=u9FKufbPMLQ2EM&vet=12ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg..i&imgrefurl=https%3A%2F%2Fwallpapercg.com%2Fyuji-itadori-wallpapers&docid=sk23cipVVPF6mM&w=3840&h=2743&q=itadori&ved=2ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg"
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        await register(request, response)

        expect(response.status).toHaveBeenCalledWith(422)
        expect(response.json).toHaveBeenCalledWith({error: 'Invalid input'})
    })

    it('should return a status code of 409 and an error message for already registered email addresses', async()=>{

        const mockRecordSet = [
            {
                firstName: 'Paul',
                lastName: 'Sanga',
                email: 'paul.nyamawi99@gmail.com',
                profilePicture: 'https://www.phantomlabs.com',
                password: 'hjghgdgfdhg'
            }
        ]

        const registrationValidation = jest.spyOn(registrationSchema, 'validate')
        registrationValidation.mockReturnValue({error: null})

        const request = {
            body: {
                firstName: "Paul",
                lastName: "Sanga",
                email: "paul.nyamawi99@gmail.com",
                profilePicture: "https://www.google.com/imgres?imgurl=https%3A%2F%2Fwallpapercg.com%2Fdownload%2Fyuji-itadori-3840x2743-9543.jpg&tbnid=u9FKufbPMLQ2EM&vet=12ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg..i&imgrefurl=https%3A%2F%2Fwallpapercg.com%2Fyuji-itadori-wallpapers&docid=sk23cipVVPF6mM&w=3840&h=2743&q=itadori&ved=2ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg"
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({ recordset: mockRecordSet })
        })

        await register(request, response)
        expect(response.status).toHaveBeenCalledWith(409)
        expect(response.json).toHaveBeenCalledWith({error: 'This email address is already registered'})

    })


    it('should return a status code of 500 and error message if sending the email fails', async()=>{
        const mockRecordSet = []

        const registrationValidation = jest.spyOn(registrationSchema, 'validate')
        registrationValidation.mockReturnValue({error: null})

        const request = {
            body: {
                firstName: "Paul",
                lastName: "Sanga",
                email: "paul.nyamawi99@gmail.com",
                profilePicture: "https://www.google.com/imgres?imgurl=https%3A%2F%2Fwallpapercg.com%2Fdownload%2Fyuji-itadori-3840x2743-9543.jpg&tbnid=u9FKufbPMLQ2EM&vet=12ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg..i&imgrefurl=https%3A%2F%2Fwallpapercg.com%2Fyuji-itadori-wallpapers&docid=sk23cipVVPF6mM&w=3840&h=2743&q=itadori&ved=2ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg"
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({ recordset: mockRecordSet })
        })
        
        const createTransportSpy = jest.spyOn(nodemailer, 'createTransport')
        const sendMailMock = jest.fn((mailOptions, callback)=>{
            callback(new Error('Error sending mail'), null)
        })

        createTransportSpy.mockReturnValue({sendMail: sendMailMock})

        await register(request, response)
        expect(response.status).toHaveBeenCalledWith(500)
        expect(response.json).toHaveBeenCalledWith({error: 'Error sending mail'})
    })

    it('should create a new user account and return a status code of 201 and success message', async()=>{
        const mockRecordSet = []

        const registrationValidation = jest.spyOn(registrationSchema, 'validate')
        registrationValidation.mockReturnValue({error: null})

        const request = {
            body: {
                firstName: "Paul",
                lastName: "Sanga",
                email: "paul.nyamawi99@gmail.com",
                profilePicture: "https://www.google.com/imgres?imgurl=https%3A%2F%2Fwallpapercg.com%2Fdownload%2Fyuji-itadori-3840x2743-9543.jpg&tbnid=u9FKufbPMLQ2EM&vet=12ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg..i&imgrefurl=https%3A%2F%2Fwallpapercg.com%2Fyuji-itadori-wallpapers&docid=sk23cipVVPF6mM&w=3840&h=2743&q=itadori&ved=2ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg"
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({ recordset: mockRecordSet })
        })
        
        const createTransportSpy = jest.spyOn(nodemailer, 'createTransport')
        const sendMailMock = jest.fn((mailOptions, callback)=>{
            callback(null, 'Email sent successful')
        })

        createTransportSpy.mockReturnValue({sendMail: sendMailMock})

        await register(request, response)
        expect(response.status).toHaveBeenCalledWith(201)
        expect(response.json).toHaveBeenCalledWith({message: 'User account created successfully'})
    })

    it('should return a status code of 500 if an error occurs during the registration process', async()=>{

        const mockPool = {
            request: jest.fn(()=>{
                throw new Error('Error connecting to the database')
            })
        }

        const request = {
            body: {
                firstName: "Paul",
                lastName: "Sanga",
                email: "paul.nyamawi99@gmail.com",
                profilePicture: "https://www.google.com/imgres?imgurl=https%3A%2F%2Fwallpapercg.com%2Fdownload%2Fyuji-itadori-3840x2743-9543.jpg&tbnid=u9FKufbPMLQ2EM&vet=12ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg..i&imgrefurl=https%3A%2F%2Fwallpapercg.com%2Fyuji-itadori-wallpapers&docid=sk23cipVVPF6mM&w=3840&h=2743&q=itadori&ved=2ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg"
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce(mockPool)

        await register(request, response)
        expect(response.status).toHaveBeenCalledWith(500)
        expect(response.json).toHaveBeenCalledWith({error: 'Internal server error'})
    })

})


describe('Verify user registration test suites', ()=>{

    it('should return a status code of 400 when the request body is missing or empty', async()=>{

        const request = {}

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        await verifyUserRegistration(request, response)
        expect(response.status).toHaveBeenCalledWith(400)
        expect(response.json).toHaveBeenCalledWith({error: 'Request body can not be empty'})
    })

    it('should return a status code of 422 when user input validation fails', async()=>{
        
        const verifyUserRegistartionValidation = jest.spyOn(overWriteOTP, 'validate')
        verifyUserRegistartionValidation.mockReturnValue({error: new Error('Invalid input')})

        const request = {
            body: {
                email: 'paul.nyamawi99@gmail.com',
                userPassword: 'recievedOTP',
                newPassword: 'Test@1345.'
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        await verifyUserRegistration(request, response)
        expect(response.status).toHaveBeenCalledWith(422)
        expect(response.json).toHaveBeenCalledWith({error: 'Invalid input'})

    })

    it('should return a status code of 409 if email is not registered on our database', async()=>{

        const mockRecordSet = []

        const verifyUserRegistartionValidation = jest.spyOn(overWriteOTP, 'validate')
        verifyUserRegistartionValidation.mockReturnValue({error: null})

        const request = {
            body: {
                email: 'paul.nyamawi99@gmail.com',
                userPassword: 'recievedOTP',
                newPassword: 'Test@12345.'
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({recordset: mockRecordSet})
        })

        await verifyUserRegistration(request, response)
        expect(response.status).toHaveBeenCalledWith(409)
        expect(response.json).toHaveBeenCalledWith({error: 'This email is not registred'})
    })

    it('should return a status code of 409 if the OTP provided by the user is invalid', async()=>{

        const mockRecordSet = [
            {
                firstName: "Paul",
                lastName: "Sanga",
                email: "paul.nyamawi99@gmail.com",
                profilePicture: "https://www.google.com/imgres?imgurl=https%3A%2F%2Fwallpapercg.com%2Fdownload%2Fyuji-itadori-3840x2743-9543.jpg&tbnid=u9FKufbPMLQ2EM&vet=12ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg..i&imgrefurl=https%3A%2F%2Fwallpapercg.com%2Fyuji-itadori-wallpapers&docid=sk23cipVVPF6mM&w=3840&h=2743&q=itadori&ved=2ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg",
                password: 'wrongOTP'              
            }
        ]

        const verifyUserRegistartionValidation = jest.spyOn(overWriteOTP, 'validate')
        verifyUserRegistartionValidation.mockReturnValue({error: null})

        const request = {
            body: {
                email: 'paul.nyamawi99@gmail.com',
                userPassword: 'recievedOTP',
                newPassword: 'Test@12345.'
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({recordset: mockRecordSet})
        })

        await verifyUserRegistration(request, response)
        expect(response.status).toHaveBeenCalledWith(409)
        expect(response.json).toHaveBeenCalledWith({error: 'Invalid OTP'})
    })

    it('should return a status code of 200 when user inputs a valid OTP and the OTP should be replaced with the new password', async()=>{
        
        const mockRecordSet = [
            {
                firstName: "Paul",
                lastName: "Sanga",
                email: "paul.nyamawi99@gmail.com",
                profilePicture: "https://www.google.com/imgres?imgurl=https%3A%2F%2Fwallpapercg.com%2Fdownload%2Fyuji-itadori-3840x2743-9543.jpg&tbnid=u9FKufbPMLQ2EM&vet=12ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg..i&imgrefurl=https%3A%2F%2Fwallpapercg.com%2Fyuji-itadori-wallpapers&docid=sk23cipVVPF6mM&w=3840&h=2743&q=itadori&ved=2ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg",
                password: 'recievedOTP'              
            }
        ]

        const verifyUserRegistartionValidation = jest.spyOn(overWriteOTP, 'validate')
        verifyUserRegistartionValidation.mockReturnValue({error: null})

        const request = {
            body: {
                email: 'paul.nyamawi99@gmail.com',
                userPassword: 'recievedOTP',
                newPassword: 'Test@12345.'
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({recordset: mockRecordSet})
        })

        jest.spyOn(bcrypt, 'genSalt').mockResolvedValueOnce()
        jest.spyOn(bcrypt, 'hash').mockResolvedValueOnce()

        await verifyUserRegistration(request, response)
        expect(response.status).toHaveBeenCalledWith(200)
        expect(response.json).toHaveBeenCalledWith({message: 'Password reset successful'})
    })

    it('should return a status code of 500 when an error occurs during the request execution', async()=>{

        const verifyUserRegistartionValidation = jest.spyOn(overWriteOTP, 'validate')
        verifyUserRegistartionValidation.mockReturnValue({error: null})
        
        const request = {
            body: {
                email: 'paul.nyamawi99@gmail.com',
                userPassword: 'recievedOTP',
                newPassword: 'Test@12345.'
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const mockPool = {
            request: jest.fn(()=>{
                throw new Error('Error connecting to the database')
            })
        }

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce(mockPool)

        await verifyUserRegistration(request, response)
        expect(response.status).toHaveBeenCalledWith(500)
        expect(response.json).toHaveBeenCalledWith({error: 'Internal server error'})
    })

})


describe('User login test suites', ()=>{

    it('should return a status code of 400 when request body is empty or missing', async()=>{

        const request = {}

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        await login(request, response)
        expect(response.status).toHaveBeenCalledWith(400)
        expect(response.json).toHaveBeenCalledWith({ error: 'Request body can not be empty' })
    })

    it('should return a status code of 422 if user input valiadtion fails', async()=>{

        const loginValidation = jest.spyOn(loginSchema, 'validate')
        loginValidation.mockReturnValue({error: new Error('Invalid input')})

        const request = {
            body: {
                email: 'paul.nyamawi99@gmail.com',
                password: 'Test@12345.'
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        await login(request, response)
        expect(response.status).toHaveBeenCalledWith(422)
        expect(response.json).toHaveBeenCalledWith({error: 'Invalid input'})

    })


    it('should return a status code of 409 if user enters an unregistered email address', async()=>{

        const mockRecordSet = []

        const loginValidation = jest.spyOn(loginSchema, 'validate')
        loginValidation.mockReturnValue({error: null})

        const request = {
            body: {
                email: 'paul.nyamawi99@gmail.com',
                password: 'Test@12345.'
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({recordset: mockRecordSet})
        })

        await login(request, response)
        expect(response.status).toHaveBeenCalledWith(409)
        expect(response.json).toHaveBeenCalledWith({error: 'Invalid login credentials'})
    })

    it('should return a status code of 403 when user account is deactivates', async()=>{

        const mockRecordSet = [
            {
                firstName: "Paul",
                lastName: "Sanga",
                email: "paul.nyamawi99@gmail.com",
                profilePicture: "https://www.google.com/imgres?imgurl=https%3A%2F%2Fwallpapercg.com%2Fdownload%2Fyuji-itadori-3840x2743-9543.jpg&tbnid=u9FKufbPMLQ2EM&vet=12ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg..i&imgrefurl=https%3A%2F%2Fwallpapercg.com%2Fyuji-itadori-wallpapers&docid=sk23cipVVPF6mM&w=3840&h=2743&q=itadori&ved=2ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg",
                password: 'hashed@Password',
                is_deleted: '1'
            }
        ]

        const request = {
            body: {
                email: 'paul.nyamawi99@gmail.com',
                userPassword: 'Test@12345.'
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const loginValidation = jest.spyOn(loginSchema, 'validate')
        loginValidation.mockReturnValue({error: null})

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({recordset: mockRecordSet})
        })

        await login(request, response)
        expect(response.status).toHaveBeenCalledWith(403)
        expect(response.json).toHaveBeenCalledWith({error: 'User account is deactivated'})
    })

    it('should return a status code of 401 when user provides an invalid password', async()=>{

        const mockRecordSet = [
            {
                firstName: "Paul",
                lastName: "Sanga",
                email: "paul.nyamawi99@gmail.com",
                profilePicture: "https://www.google.com/imgres?imgurl=https%3A%2F%2Fwallpapercg.com%2Fdownload%2Fyuji-itadori-3840x2743-9543.jpg&tbnid=u9FKufbPMLQ2EM&vet=12ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg..i&imgrefurl=https%3A%2F%2Fwallpapercg.com%2Fyuji-itadori-wallpapers&docid=sk23cipVVPF6mM&w=3840&h=2743&q=itadori&ved=2ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg",
                password: 'hashed@Password'              
            }
        ]

        const loginValidation = jest.spyOn(loginSchema, 'validate')
        loginValidation.mockReturnValue({error: null})

        const request = {
            body: {
                email: 'paul.nyamawi99@gmail.com',
                password: 'Test@12345.'
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({recordset: mockRecordSet})
        })

        jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false)
        
        await login(request, response)
        expect(response.status).toHaveBeenCalledWith(401)
        expect(response.json).toHaveBeenCalledWith({error: 'Invalid login credentials'})
    })


    it('should return a status code of 200 when user credentials are valid and return json with user details, token and message', async()=>{

        const mockRecordSet = [
            {
                firstName: "Paul",
                lastName: "Sanga",
                email: "paul.nyamawi99@gmail.com",
                profilePicture: "https://www.google.com/imgres?imgurl=https%3A%2F%2Fwallpapercg.com%2Fdownload%2Fyuji-itadori-3840x2743-9543.jpg&tbnid=u9FKufbPMLQ2EM&vet=12ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg..i&imgrefurl=https%3A%2F%2Fwallpapercg.com%2Fyuji-itadori-wallpapers&docid=sk23cipVVPF6mM&w=3840&h=2743&q=itadori&ved=2ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg",
                password: 'hashed@Password' 
            }
        ]

        const loginValidation = jest.spyOn(loginSchema, 'validate')
        loginValidation.mockReturnValue({error: null})

        const request = {
            body: {
                email: 'paul.nyamawi99@gmail.com',
                password: 'Test@12345.'
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({recordset: mockRecordSet})
        })

        jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true)

        jest.spyOn(jwt, 'sign').mockReturnValue("AuthToken")

        await login(request, response)
        expect(response.status).toHaveBeenCalledWith(200)
        expect(response.json).toHaveBeenCalledWith({
            message: 'login successful',
            token: 'AuthToken',
            user: {
                firstName: "Paul",
                lastName: "Sanga",
                email: "paul.nyamawi99@gmail.com",
                profilePicture: "https://www.google.com/imgres?imgurl=https%3A%2F%2Fwallpapercg.com%2Fdownload%2Fyuji-itadori-3840x2743-9543.jpg&tbnid=u9FKufbPMLQ2EM&vet=12ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg..i&imgrefurl=https%3A%2F%2Fwallpapercg.com%2Fyuji-itadori-wallpapers&docid=sk23cipVVPF6mM&w=3840&h=2743&q=itadori&ved=2ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg",              
            }
        })
    })

    it('should return a status code of 500 and error message if any error occurs during request execution', async()=>{

        const request = {
            body: {
                email: 'paul.nyamawi99@gmail.com',
                password: 'Test@12345.'
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const mockPool = {
            request: jest.fn(()=>{
                throw new Error('Error connecting to database')
            })
        }

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce(mockPool)

        await login(request, response)
        expect(response.status).toHaveBeenCalledWith(500)
        expect(response.json).toHaveBeenCalledWith({error: 'Internal server error'})
    })

})


describe('Forgot password test suites', ()=>{

    it('should return a status code of 400 if request body is empty or missing', async()=>{
        
        const request = {}

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        await forgotPassword(request, response)
        expect(response.status).toHaveBeenCalledWith(400)
        expect(response.json).toHaveBeenCalledWith({error: 'Request body can not be empty'})
    })

    it('should return a status code of 422 when user input validation fails', async()=>{

        const forgotPasswordValidation = jest.spyOn(forgotPasswordSchema,'validate')
        forgotPasswordValidation.mockReturnValue({error: new Error('Invalid email')})

        const request = {
            body: {
                email: 'phantom.labs.com'
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        await forgotPassword(request, response)
        expect(response.status).toHaveBeenCalledWith(422)
        expect(response.json).toHaveBeenCalledWith({error: 'Invalid email'})
    })

    it('should return a status code of 409 if user provides an unregistered email address', async()=>{

        const mockRecordSet = []

        const forgotPasswordValidation = jest.spyOn(forgotPasswordSchema, 'validate')
        forgotPasswordValidation.mockReturnValue({error: null})

        const request = {
            body: {
                email: 'paul.nyamawi99@gmail.com'
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({recordset: mockRecordSet})
        })

        await forgotPassword(request, response)
        expect(response.status).toHaveBeenCalledWith(409)
        expect(response.json).toHaveBeenCalledWith({error: 'This email is not registered'})

    })


    it('should return a status code of 500 if an error occurs when sending reset password token to user email', async ()=>{
        
        const mockRecordSet = [
            {
                firstName: "Paul",
                lastName: "Sanga",
                email: "paul.nyamawi99@gmail.com",
                profilePicture: "https://www.google.com/imgres?imgurl=https%3A%2F%2Fwallpapercg.com%2Fdownload%2Fyuji-itadori-3840x2743-9543.jpg&tbnid=u9FKufbPMLQ2EM&vet=12ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg..i&imgrefurl=https%3A%2F%2Fwallpapercg.com%2Fyuji-itadori-wallpapers&docid=sk23cipVVPF6mM&w=3840&h=2743&q=itadori&ved=2ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg",
                password: 'hashed@Password'
            }
        ]

        const forgotPasswordValidation = jest.spyOn(forgotPasswordSchema, 'validate')
        forgotPasswordValidation.mockReturnValue({error: null})

        const request = {
            body: {
                email: "paul.nyamawi99@gmail.com",
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({ recordset: mockRecordSet })
        })
        
        const createTransportSpy = jest.spyOn(nodemailer, 'createTransport')
        const sendMailMock = jest.fn((mailOptions, callback)=>{
            callback(new Error('Error sending mail'), null)
        })

        createTransportSpy.mockReturnValue({sendMail: sendMailMock})

        await forgotPassword(request, response)
        expect(response.status).toHaveBeenCalledWith(500)
        expect(response.json).toHaveBeenCalledWith({error: 'Error sending mail'})

    })

    it('should return a status code 200 when we successfully send the user the reset password token', async()=>{

        const mockRecordSet = [
            {
                firstName: "Paul",
                lastName: "Sanga",
                email: "paul.nyamawi99@gmail.com",
                profilePicture: "https://www.google.com/imgres?imgurl=https%3A%2F%2Fwallpapercg.com%2Fdownload%2Fyuji-itadori-3840x2743-9543.jpg&tbnid=u9FKufbPMLQ2EM&vet=12ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg..i&imgrefurl=https%3A%2F%2Fwallpapercg.com%2Fyuji-itadori-wallpapers&docid=sk23cipVVPF6mM&w=3840&h=2743&q=itadori&ved=2ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg",
                password: 'hashed@Password'
            }
        ]

        const forgotPasswordValidation = jest.spyOn(forgotPasswordSchema, 'validate')
        forgotPasswordValidation.mockReturnValue({error: null})

        const request = {
            body: {
                email: 'paul.nyamawi99@gmail.com'
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({ recordset: mockRecordSet })
        })

        const createTransportSpy = jest.spyOn(nodemailer, 'createTransport')
        const sendMailMock = jest.fn((mailOptions, callback)=>{
            callback(null, 'Email sent successfully')
        })
        createTransportSpy.mockReturnValue({sendMail: sendMailMock})
        await forgotPassword(request, response)
        expect(response.status).toHaveBeenCalledWith(200)
        expect(response.json).toHaveBeenCalledWith({message: 'Reset password token sent. Please check your email inbox'})
    })

    it('should return a status code of 500 if an error occurs during request execution', async()=>{
        
        const request = {
            body: {
                email: 'paul.nyamawi99@gmail.com'
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const mockPool = {
            request: jest.fn(()=>{
                throw new Error('Error connecting to database')
            })
        }

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce(mockPool)

        await forgotPassword(request, response)
        expect(response.status).toHaveBeenCalledWith(500)
        expect(response.json).toHaveBeenCalledWith({error: 'Internal server error'})
    })

})

describe('Validate Reset Password Token Test Suites', ()=>{

    it('should return a status code of 400 when request body is missing or empty', async()=>{

        const request = {}

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        await validateResetPasswordToken(request, response)
        expect(response.status).toHaveBeenCalledWith(400)
        expect(response.json).toHaveBeenCalledWith({error: 'Request body must be provided'})
    })

    it('should return a status code of 422 when user input validation fails', async()=>{

        const validateResetPasswordTokenSchemaMock = jest.spyOn(validateResetPasswordTokenSchema, 'validate')
        validateResetPasswordTokenSchemaMock.mockReturnValue({error: new Error("Validation failed")})

        const request = {
            body: {
                email: 'phantom.labs.com',
                resetPasswordToken: 'hykgggysbjfho'
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        await validateResetPasswordToken(request, response)
        expect(response.status).toHaveBeenCalledWith(422)
        expect(response.json).toHaveBeenCalledWith({error: 'Validation failed'})

    })

    it('should return a status code of 409 if email is not registered', async()=>{

        const mockRecordSet = []

        const validateResetPasswordTokenSchemaMock = jest.spyOn(validateResetPasswordTokenSchema, 'validate')
        validateResetPasswordTokenSchemaMock.mockReturnValue({error: null})

        const request = {
            body: {
                email: 'paul.nyamawi99@gmail.com',
                resetPasswordToken: 'hdtndgfhj'
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({recordset: mockRecordSet})
        })

        await validateResetPasswordToken(request, response)
        expect(response.status).toHaveBeenCalledWith(409)
        expect(response.json).toHaveBeenCalledWith({error: 'This email is unregistered'})
    })

    it('should return a status code of 409 when the reset password token provided is invlaid', async()=>{

        const mockRecordSet = [
            {
                firstName: "Paul",
                lastName: "Sanga",
                email: "paul.nyamawi99@gmail.com",
                profilePicture: "https://www.google.com/imgres?imgurl=https%3A%2F%2Fwallpapercg.com%2Fdownload%2Fyuji-itadori-3840x2743-9543.jpg&tbnid=u9FKufbPMLQ2EM&vet=12ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg..i&imgrefurl=https%3A%2F%2Fwallpapercg.com%2Fyuji-itadori-wallpapers&docid=sk23cipVVPF6mM&w=3840&h=2743&q=itadori&ved=2ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg",
                password_reset_token: 'validtoken'   
            }
        ]

        const validateResetPasswordTokenSchemaMock = jest.spyOn(validateResetPasswordTokenSchema, 'validate')
        validateResetPasswordTokenSchemaMock.mockReturnValue({error: null})

        const request = {
            body: {
                email: 'paul.nyamawi99@gmail.com',
                resetPasswordToken: 'invalidToken'   
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({recordset: mockRecordSet})
        })

        await validateResetPasswordToken(request, response)
        expect(response.status).toHaveBeenCalledWith(409)
        expect(response.json).toHaveBeenCalledWith({error: 'Invalid reset password token'})

    })

    it('should return a status code of 200 when the reset password token is valid', async()=>{

        const mockRecordSet = [
            {
                firstName: "Paul",
                lastName: "Sanga",
                email: "paul.nyamawi99@gmail.com",
                profilePicture: "https://www.google.com/imgres?imgurl=https%3A%2F%2Fwallpapercg.com%2Fdownload%2Fyuji-itadori-3840x2743-9543.jpg&tbnid=u9FKufbPMLQ2EM&vet=12ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg..i&imgrefurl=https%3A%2F%2Fwallpapercg.com%2Fyuji-itadori-wallpapers&docid=sk23cipVVPF6mM&w=3840&h=2743&q=itadori&ved=2ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg",
                password_reset_token: 'validToken'
            }
        ]

        const validateResetPasswordTokenSchemaMock = jest.spyOn(validateResetPasswordTokenSchema, 'validate')
        validateResetPasswordTokenSchemaMock.mockReturnValue({error: null})

        const request = {
            body: {
                email: 'paul.nyamawi99@gmail.com',
                resetPasswordToken: 'validToken'
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({recordset: mockRecordSet})
        })

        await validateResetPasswordToken(request, response)
        expect(response.status).toHaveBeenCalledWith(200)
        expect(response.json).toHaveBeenCalledWith({message: 'Proceed to set new password'})

    })

    it('should return a status code of 500 when an error occurs during request execution', async()=>{

        const request = {
            body: {
                email: 'paul.nyamawi99@gmail.com',
                resetPasswordToken: 'validToken'
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const mockPool = {
            request: jest.fn(()=>{
                throw new Error("Error connecting to the database")
            })
        }

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce(mockPool)

        await validateResetPasswordToken(request, response)
        expect(response.status).toHaveBeenCalledWith(500)
        expect(response.json).toHaveBeenCalledWith({error: 'Internal server error'})

    })

})

describe('Set New Password Test Suites', ()=>{

    it('should return a status code of 400 when request body is empty or missing', async()=>{

        const request = {}
        
        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        await setNewPassword(request, response)
        expect(response.status).toHaveBeenCalledWith(400)
        expect(response.json).toHaveBeenCalledWith({error: 'Request body can not be empty'})

    })

    it('should return a status code of 422 if user validation fails', async()=>{

        const setNewPasswordValidationMock = jest.spyOn(loginSchema, 'validate')
        setNewPasswordValidationMock.mockReturnValue({error: new Error('Invalid user input')})

        const request = {
            body: {
                email: 'phantom.labs.com',
                password: 'labs@1337x'
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        await setNewPassword(request, response)
        expect(response.status).toHaveBeenCalledWith(422)
        expect(response.json).toHaveBeenCalledWith({error: 'Invalid user input'})
    })

    it('should return a status code of 409 if user email is not registered', async()=>{

        const mockRecordSet = []

        const setNewPasswordValidationMock = jest.spyOn(loginSchema, 'validate')
        setNewPasswordValidationMock.mockReturnValue({error: null})

        const request = {
            body: {
                email: 'paul.nyamawi99@gmail.com',
                userPassword: 'labs@1337x'
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({recordset: mockRecordSet})
        })

        await setNewPassword(request, response)
        expect(response.status).toHaveBeenCalledWith(409)
        expect(response.json).toHaveBeenCalledWith({error: 'This email is unregistered'})
    })

    it('should return a status code of 200 when user email is registered and input is valid', async()=>{

        const mockRecordSet = [
            {
                firstName: "Paul",
                lastName: "Sanga",
                email: "paul.nyamawi99@gmail.com",
                profilePicture: "https://www.google.com/imgres?imgurl=https%3A%2F%2Fwallpapercg.com%2Fdownload%2Fyuji-itadori-3840x2743-9543.jpg&tbnid=u9FKufbPMLQ2EM&vet=12ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg..i&imgrefurl=https%3A%2F%2Fwallpapercg.com%2Fyuji-itadori-wallpapers&docid=sk23cipVVPF6mM&w=3840&h=2743&q=itadori&ved=2ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg",
                password: 'hashed@Password'
            }
        ]

        const request = {
            body: {
                email: 'paul.nyamawi99@gmail.com',
                userPassword: 'Test@12345.'
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const setNewPasswordValidationMock = jest.spyOn(loginSchema, 'validate')
        setNewPasswordValidationMock.mockReturnValue({error: null})

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({recordset: mockRecordSet})
        })

        jest.spyOn(bcrypt, 'genSalt').mockResolvedValueOnce()
        jest.spyOn(bcrypt, 'hash').mockResolvedValueOnce()

        await setNewPassword(request, response)
        expect(response.status).toHaveBeenCalledWith(200)
        expect(response.json).toHaveBeenCalledWith({message: 'Password reset successfull'})
    })

    it('should return a status code of 500 if an error occur during request execution', async()=>{

        const request = {
            body: {
                email: 'pau.nyamawi99@gmail.com',
                password: 'Test@12345.'
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const mockPool = {
            request: jest.fn(()=>{
                throw new Error("Unable to connect to the database server")
            })
        }

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce(mockPool)
        
        await setNewPassword(request, response)
        expect(response.status).toHaveBeenCalledWith(500)
        expect(response.json).toHaveBeenCalledWith({error: 'Internal server error'})

    })
})


describe('Deactivate Account Test Suites', ()=>{

    it('should return a status code of 400 when the request body is missing or empty', async()=>{

        const request = {}

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        await deactivateAccount(request, response)
        expect(response.status).toHaveBeenCalledWith(400)
        expect(response.json).toHaveBeenCalledWith({error: 'Request body can not be empty'})
    })

    it('should return a status code of 422 if user input validation fails', async()=>{

        const request = {
            body: {
                email: 'phantom.labs.com',
                userPassword: 'Test@12345.'
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const deactivateAccountValidation = jest.spyOn(loginSchema, 'validate')
        deactivateAccountValidation.mockReturnValue({error: new Error("Invalid user input")})

        await deactivateAccount(request, response)
        expect(response.status).toHaveBeenCalledWith(422)
        expect(response.json).toHaveBeenCalledWith({error: "Invalid user input"})
    })

    it('should retrun a status code of 409 when user email provided is not registered', async()=>{

        const mockRecordSet = []

        const request = {
            body: {
                email: 'paul.nyamawi99@gmail.com',
                userPassword: 'Test@12345.'
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const deactivateAccountValidation = jest.spyOn(loginSchema, 'validate')
        deactivateAccountValidation.mockReturnValue({error: null})

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({recordset: mockRecordSet})
        })

        await deactivateAccount(request, response)
        expect(response.status).toHaveBeenCalledWith(409)
        expect(response.json).toHaveBeenCalledWith({error: 'This email is not registred'})
    })

    it('should return a status code of 403 when user tries to deactivate a deactivated account', async()=>{
      
        const mockRecordSet = [
            {
                firstName: "Paul",
                lastName: "Sanga",
                email: "paul.nyamawi99@gmail.com",
                profilePicture: "https://www.google.com/imgres?imgurl=https%3A%2F%2Fwallpapercg.com%2Fdownload%2Fyuji-itadori-3840x2743-9543.jpg&tbnid=u9FKufbPMLQ2EM&vet=12ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg..i&imgrefurl=https%3A%2F%2Fwallpapercg.com%2Fyuji-itadori-wallpapers&docid=sk23cipVVPF6mM&w=3840&h=2743&q=itadori&ved=2ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg",
                password: 'hashed@Password',
                is_deleted: '1'
            }
        ]

        const request = {
            body: {
                email: 'paul.nyamawi99@gmail.com',
                userPassword: 'Test@12345.'
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const deactivateAccountValidation = jest.spyOn(loginSchema, 'validate')
        deactivateAccountValidation.mockReturnValue({error: null})

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({recordset: mockRecordSet})
        })

        await deactivateAccount(request, response)
        expect(response.status).toHaveBeenCalledWith(403)
        expect(response.json).toHaveBeenCalledWith({error: 'User account is already deactivated'})
        
    })

    it('should return a status code of 409 if user password is invalid', async()=>{

        const mockRecordSet = [
            {
                firstName: "Paul",
                lastName: "Sanga",
                email: "paul.nyamawi99@gmail.com",
                profilePicture: "https://www.google.com/imgres?imgurl=https%3A%2F%2Fwallpapercg.com%2Fdownload%2Fyuji-itadori-3840x2743-9543.jpg&tbnid=u9FKufbPMLQ2EM&vet=12ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg..i&imgrefurl=https%3A%2F%2Fwallpapercg.com%2Fyuji-itadori-wallpapers&docid=sk23cipVVPF6mM&w=3840&h=2743&q=itadori&ved=2ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg",
                password: 'hashed@Password',
                is_deleted: '0'
            }
        ]

        const request = {
            body: {
                email: 'paul.nyamawi99@gmail.com',
                userPassword: 'Test@67890.'
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const deactivateAccountValidation = jest.spyOn(loginSchema, 'validate')
        deactivateAccountValidation.mockReturnValue({error: null})

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({ recordset: mockRecordSet })
        })

        jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false)

        await deactivateAccount(request, response)
        expect(response.status).toHaveBeenCalledWith(409)
        expect(response.json).toHaveBeenCalledWith({error: 'Authentication failed'})
    })

    it('should return a status of 200 if user email and password is valid and account is active', async()=>{

        const mockRecordSet = [
            {
                firstName: "Paul",
                lastName: "Sanga",
                email: "paul.nyamawi99@gmail.com",
                profilePicture: "https://www.google.com/imgres?imgurl=https%3A%2F%2Fwallpapercg.com%2Fdownload%2Fyuji-itadori-3840x2743-9543.jpg&tbnid=u9FKufbPMLQ2EM&vet=12ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg..i&imgrefurl=https%3A%2F%2Fwallpapercg.com%2Fyuji-itadori-wallpapers&docid=sk23cipVVPF6mM&w=3840&h=2743&q=itadori&ved=2ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg",
                password: 'hashed@Password',
                is_deleted: '0'
            }
        ]

        const request = {
            body: {
                email: 'paul.nyamawi99@gmail.com',
                userPassword: 'Test@12345.'
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const deactivateAccountValidation = jest.spyOn(loginSchema, 'validate')
        deactivateAccountValidation.mockReturnValue({error: null})

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({recordset: mockRecordSet})
        })

        jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true)

        await deactivateAccount(request, response)
        expect(response.status).toHaveBeenCalledWith(200)
        expect(response.json).toHaveBeenCalledWith({message: 'User account deactivated'})

    })

    it('should return a status code of 500 if an error occurs during the execution of the request', async()=>{

        const request = {
            body: {
                email: 'paul.nyamawi99@gmail.com',
                userPassword: 'Test@12345.'
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const mockPool = {
            request: jest.fn(()=>{
                throw new Error('Error connecting to the database')
            })
        }

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce(mockPool)

        await deactivateAccount(request, response)
        expect(response.status).toHaveBeenCalledWith(500)
        expect(response.json).toHaveBeenCalledWith({error: 'Internal server error'})

    })

})


describe('Activate Account Suites', ()=>{

    it('should return a status code of 400 if request body is empty or missing', async()=>{

        const request = {}

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        await activateAccount(request, response)
        expect(response.status).toHaveBeenCalledWith(400)
        expect(response.json).toHaveBeenCalledWith({error: 'Request body can not be empty'})

    })

    it('should return a status code of 422 when user input validation fails', async()=>{

        const request = {
            body: {
                email: 'paul.nyamawi99@gmail.com'
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const activateAccountValidation = jest.spyOn(forgotPasswordSchema, 'validate')
        activateAccountValidation.mockReturnValue({error: new Error("Invalid input")})

        await activateAccount(request, response)
        expect(response.status).toHaveBeenCalledWith(422)
        expect(response.json).toHaveBeenCalledWith({error: 'Invalid input'})

    })

    it('should return a status code of 409 id user email is not registered', async()=>{

        const mockRecordSet = []

        const request = {
            body: {
                email: 'paul.nyamawi99@gmail.com'
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const activateAccountValidation = jest.spyOn(forgotPasswordSchema, 'validate')
        activateAccountValidation.mockReturnValue({error: null})

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({recordset: mockRecordSet})
        })

        await activateAccount(request, response)
        expect(response.status).toHaveBeenCalledWith(409)
        expect(response.json).toHaveBeenCalledWith({error: 'This email is not registered'})

    })

    it('should retrun a status code of 400 if user account is already active', async()=>{

        const mockRecordSet = [
            {
                firstName: "Paul",
                lastName: "Sanga",
                email: "paul.nyamawi99@gmail.com",
                profilePicture: "https://www.google.com/imgres?imgurl=https%3A%2F%2Fwallpapercg.com%2Fdownload%2Fyuji-itadori-3840x2743-9543.jpg&tbnid=u9FKufbPMLQ2EM&vet=12ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg..i&imgrefurl=https%3A%2F%2Fwallpapercg.com%2Fyuji-itadori-wallpapers&docid=sk23cipVVPF6mM&w=3840&h=2743&q=itadori&ved=2ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg",
                password: 'hashed@Password',
                is_deleted: '0'
            }
        ]

        const request = {
            body: {
                email: 'paul.nyamawi99@gmail.com'
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const activateAccountValidation = jest.spyOn(forgotPasswordSchema, 'validate')
        activateAccountValidation.mockReturnValue({error: null})

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({ recordset: mockRecordSet })
        })

        await activateAccount(request, response)
        expect(response.status).toHaveBeenCalledWith(400)
        expect(response.json).toHaveBeenCalledWith({error: 'User account is active'})
    })

    it('should return a status code of 200 when user email is valid and user account is deactivated', async()=>{
       
        const mockRecordSet = [
            {
                firstName: "Paul",
                lastName: "Sanga",
                email: "paul.nyamawi99@gmail.com",
                profilePicture: "https://www.google.com/imgres?imgurl=https%3A%2F%2Fwallpapercg.com%2Fdownload%2Fyuji-itadori-3840x2743-9543.jpg&tbnid=u9FKufbPMLQ2EM&vet=12ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg..i&imgrefurl=https%3A%2F%2Fwallpapercg.com%2Fyuji-itadori-wallpapers&docid=sk23cipVVPF6mM&w=3840&h=2743&q=itadori&ved=2ahUKEwibov3YmZOBAxXQkicCHat8CkAQMyhLegUIARClAg",
                password: 'hashed@Password',
                is_deleted: '1'
            }
        ]

        const request = {
            body: {
                email: 'paul.nyamawi99@gmail.com'
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const activateAccountValidation = jest.spyOn(forgotPasswordSchema, 'validate')
        activateAccountValidation.mockReturnValue({error: null})

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({ recordset: mockRecordSet })
        })

        await activateAccount(request, response)
        expect(response.status).toHaveBeenCalledWith(200)
        expect(response.json).toHaveBeenCalledWith({message: 'User account activated successfully'})
    })

    it('should return a status code of 500 if an error occurs during request execution', async()=>{
        
        const request = {
            body: {
                email: 'paul.nyamawi99@gmail.com'
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const mockPool = {
            request: jest.fn(()=>{
                throw new Error('Error connecting to the database')
            })
        }

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce(mockPool)

        await activateAccount(request, response)
        expect(response.status).toHaveBeenCalledWith(500)
        expect(response.json).toHaveBeenCalledWith({error: 'Internal server error'})

    })

})