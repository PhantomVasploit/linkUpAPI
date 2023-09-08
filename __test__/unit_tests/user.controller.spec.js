const mssql = require('mssql')
const { fetchAllUsers, fetchUserById, updateUser, deleteUser } = require('../../src/controller/user.controller')
const { registrationSchema } = require('../../src/utils/validators')
const { json } = require('body-parser')


describe("Fetch All Users Test Suites", ()=>{

    it("should return a list of all users", async()=>{

        const mockRecordSet = [
            {
                "id": 1,
                "first_name": "Phantom",
                "last_name": "Vasploit",
                "email": "paulvasgit99@gmail.com",
                "avatar": "https://pin.it/3hcaWIg"
            }
        ]

        const request = {}
        
        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({recordset: mockRecordSet})
        })

        await fetchAllUsers(request, response)
        expect(response.status).toHaveBeenCalledWith(200)
        expect(response.json).toHaveBeenCalledWith({
            message: "Fetch successful",
            users: mockRecordSet
        })
    })
    
    it('should return a status code of 500 if an error occurs during request execution', async()=>{

        const request = {}

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

        await fetchAllUsers(request, response)
        expect(response.status).toHaveBeenCalledWith(500)
        expect(response.json).toHaveBeenCalledWith({error: "Internal server error"})
    })

})


describe('Fetch User By Id Test Suites', ()=>{

    it('should return a status code of 409 if the user account is missing', async()=>{

        const mockRecordSet = []

        const request = {
            params: {
                id: 1
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

        await fetchUserById(request, response)
        expect(response.status).toHaveBeenCalledWith(404)
        expect(response.json).toHaveBeenCalledWith({error: 'User id is invalid'})

    })

    it('should return a status code of 200 if user account exits', async()=>{

        const mockRecordSet = [
            {
                "first_name": "Phantom",
                "last_name": "Vasploit",
                "email": "paulvasgit99@gmail.com",
                "avatar": "https://pin.it/3hcaWIg"
            }
        ]

        const request = {
            params: {
                id: 1
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

        await fetchUserById(request, response)
        expect(response.status).toHaveBeenCalledWith(200)
        expect(response.json).toHaveBeenCalledWith({
            message: "Fetch successful",
            user: mockRecordSet[0]
        })
    })

    it('should return a status code of 500 if an error occurs during request execution', async()=>{

        const request = {
            params: {
                id: 1
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const mockPool = {
            request: jest.fn(()=>{
                throw new Error("Error connecting to the databse")
            })
        }

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce(mockPool)
        await fetchUserById(request, response)
        expect(response.status).toHaveBeenCalledWith(500)
        expect(response.json).toHaveBeenCalledWith({ error: 'Internal server error' })
    })

})


describe('Update User Test SUites', ()=>{

    it('should return a status code of 400 when the request body is empty or missing', async()=>{

        const request = {}

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        await updateUser(request, response)
        expect(response.status).toHaveBeenCalledWith(400)
        expect(response.json).toHaveBeenCalledWith({error: "Request body can not be empty"})
    })

    it('should return a status code of 422 if the user input validation fails', async()=>{
      
        const request = {
            body: {
                firstName: "Phantom",
                lastName: "Vasploit",
                email: "phantom.labs.com",
                profilePicture: "www.phantomlabs.com"
            },
            params: {
                id: 1
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const updateUserValidation = jest.spyOn(registrationSchema, 'validate')
        updateUserValidation.mockReturnValue({error: new Error('Invalid input')})

        await updateUser(request, response)
        expect(response.status).toHaveBeenCalledWith(422)
        expect(response.json).toHaveBeenCalledWith({error: 'Invalid input'})
        
    })

    it('should return a status code of 404 if user account does not exits', async()=>{

        const mockRecordSet = []

        const request = {
            body: {
                firstName: "Phantom",
                lastName: "Vasploit",
                email: "phantom.labs.com",
                profilePicture: "www.phantomlabs.com"
            },
            params: {
                id: 1
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const updateUserValidation = jest.spyOn(registrationSchema, 'validate')
        updateUserValidation.mockReturnValue({error: null})

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({recordset: mockRecordSet})
        })

        await updateUser(request, response)
        expect(response.status).toHaveBeenCalledWith(404)
        expect(response.json).toHaveBeenCalledWith({error: 'User account not found'})
    })

    it('should return a status code of 200 when the user account exits and validation passes', async()=>{

        const mockRecordSet = [
            {
                "first_name": "Phantom",
                "last_name": "Vasploit",
                "email": "paulvasgit99@gmail.com",
                "avatar": "https://pin.it/3hcaWIg"
            }
        ]

        const request = {
            body: {
                firstName: "Paul",
                lastName: "Sanga",
                email: "paul.nyamawi99@gmail.com",
                profilePicture: "www.phantomlabs.com"
            },
            params: {
                id: 1
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const updateUserValidation = jest.spyOn(registrationSchema, 'validate')
        updateUserValidation.mockReturnValue({error: null})

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({recordset: mockRecordSet})
        })

        await updateUser(request, response)
        expect(response.status).toHaveBeenCalledWith(200)
        expect(response.json).toHaveBeenCalledWith({message: 'Update successful'})
    })

    it('should return a status code of 500 when an error occurs during request execution', async()=>{

        const request = {
            body: {
                firstName: "Paul",
                lastName: "Sanga",
                email: "paul.nyamawi99@gmail.com",
                profilePicture: "www.phantomlabs.com"
            },
            params: {
                id: 1
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
        await updateUser(request, response)
        expect(response.status).toHaveBeenCalledWith(500)
        expect(response.json).toHaveBeenCalledWith({error: 'Internal server error'})
    })

})


describe("Delete User Test Suites", ()=>{

    it('should return a status code of 404 when user account does not exist', async()=>{

        const mockRecordSet = []

        const request = {
            params: {
                id: 1
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

        await deleteUser(request, response)
        expect(response.status).toHaveBeenCalledWith(404)
        expect(response.json).toHaveBeenCalledWith({ error: 'User account not found' })

    })

    it('should return a status code of 200 if user account exists and soft deete it', async()=>{

        const mockRecordSet = [
            {
                firstName: "Paul",
                lastName: "Sanga",
                email: "paul.nyamawi99@gmail.com",
                profilePicture: "www.phantomlabs.com"              
            }
        ]

        const request = {
            params: {
                id: 1
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

        await deleteUser(request, response)
        expect(response.status).toHaveBeenCalledWith(200)
        expect(response.json).toHaveBeenCalledWith({message: 'User account deleted'})
    })

    it('should return a status of 500 of an error occurs during request execution', async()=>{

        const request = {
            params: {
                id: 1
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const mockPool = {
            request: jest.fn(()=>{
                throw new Error("Error connecting to database")
            })
        }

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce(mockPool)

        await deleteUser(request, response)
        expect(response.status).toHaveBeenCalledWith(500)
        expect(response.json).toHaveBeenCalledWith({error: 'Internal server error'})

    })

})