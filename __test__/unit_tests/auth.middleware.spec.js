const jwt = require('jsonwebtoken')
const { authorization } = require('../../src/middleware/auth.middleware')

describe('Authorization Middleware Test Suites', ()=>{

    let verifySpy

    beforeEach(()=>{
        verifySpy = jest.spyOn(jwt, 'verify')
    })

    afterEach(()=>{
        verifySpy.mockRestore()
    })

    it('should return a status of 401 if authorization headers are not set', async()=>{

        const request = {
            headers: {
                'authorization': ''
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const next = jest.fn()

        await authorization(request, response, next)
        expect(response.status).toHaveBeenCalledWith(401)
        expect(response.json).toHaveBeenCalledWith({ error: 'Authentication headers not set' })

    })

    it('should return a status code of 401 if token is not appended on the authorization header', async()=>{

        const request = {
            headers: {
                'authorization': 'Bearer '
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const next = jest.fn()

        await authorization(request, response, next)
        expect(response.status).toHaveBeenCalledWith(401)
        expect(response.json).toHaveBeenCalledWith({error: 'Authentication token not set'})
    })

    it('should return a status code of 401 if token verfication function throws an error', async()=>{
        
        verifySpy.mockImplementation((token, secret, callback)=>{
            callback(new Error('Invalid Token'), null)
        })

        const request = {
            headers: {
                'authorization': 'Bearer InvalidToken'
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const next = jest.fn()

        await authorization(request, response, next)
        expect(response.status).toHaveBeenCalledWith(401)
        expect(response.json).toHaveBeenCalledWith({error: 'Invalid Token'})
    })

    it('should return a status code of 500 if an error occurs during middleware execution', async()=>{
        const request = {}

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const next = jest.fn()

        await authorization(request, response, next)
        expect(response.status).toHaveBeenCalledWith(500)
        expect(response.json).toHaveBeenCalledWith({error: `Internal server error`})
    })

    it('should call next if decoded token is present', async()=>{
        const decodedToken = {
            email: 'paul.nyamawi99@gmail.com',
            id: 1
        }
        verifySpy.mockImplementation((token, secret, callback)=>{
            callback(null, decodedToken)
        })

        const request = {
            headers: {
                'authorization': 'Bearer InvalidToken'
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const next = jest.fn()

        await authorization(request, response, next)
        expect(next).toHaveBeenCalledTimes(1)
    })

})