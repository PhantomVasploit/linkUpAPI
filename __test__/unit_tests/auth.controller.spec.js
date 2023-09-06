const mssql = require('mssql')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')

const { register, verifyUserRegistration, login, forgotPassword } = require('../../src/controller/auth.controller')
const { registrationSchema, overWriteOTP, loginSchema, forgotPasswordSchema } = require('../../src/utils/validators')


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