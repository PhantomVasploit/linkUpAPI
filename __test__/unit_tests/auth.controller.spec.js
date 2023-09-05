const mssql = require('mssql')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')

const { register } = require('../../src/controller/auth.controller')
const { registrationSchema } = require('../../src/utils/validators')


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