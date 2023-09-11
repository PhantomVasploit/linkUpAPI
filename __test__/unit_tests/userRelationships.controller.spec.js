const mssql = require('mssql')
const { followUser, unfollowUser, fetchUserFollowing } = require('../../src/controller/userRelationship.controller')

describe('Follow User Test Suites', ()=>{

    it('should return a status code of 500 when an error occurs during request execution', async()=>{

        const request = {
            params: {
                followerId: 1,
                followingId: 2
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const mockPool = {
            request: jest.fn(()=>{
                throw new Error('Could not connect to the database server')
            })
        }

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce(mockPool)
        await followUser(request, response)
        expect(response.status).toHaveBeenCalledWith(500)
        expect(response.json).toHaveBeenCalledWith({error: 'Internal server error'})
    })

    it('should return a status code of 409 if user already follows the user', async()=>{

        const mockRecordSet = [
            {
                "following_id": 2,
                "following_first_name": "Paul",
                "following_last_name": "Sanga"
            }
        ]

        const request = {
            params: {
                followerId: 1,
                followingId: 2
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

        await followUser(request, response)
        expect(response.status).toHaveBeenCalledWith(409)
        expect(response.json).toHaveBeenCalledWith({error: 'User already follows this user'})
    })

    it('should return a status code of 200 if user successfully follows the user', async()=>{
        
        const mockRecordSet = []

        const request = {
            params: {
                followerId: 1,
                followingId: 2
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

        await followUser(request, response)
        expect(response.status).toHaveBeenCalledWith(201)
        expect(response.json).toHaveBeenCalledWith({message: 'User following added'})
    })

})


describe('Unfollow User Test Suites', ()=>{

    it('should return a status code of 500 if an error occurs during request execution', async()=>{

        const request = {
            params: {
                followerId: 1,
                followingId: 2
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
        await unfollowUser(request, response)
        expect(response.status).toHaveBeenCalledWith(500)
        expect(response.json).toHaveBeenCalledWith({error: 'Internal server error'})

    })

    it('should return a status code of 409 if the relationship between the users does not exist', async()=>{

        const request = {
            params: {
                followerId: 1,
                followingId: 2
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const mockRecordSet = []

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({recordset: mockRecordSet})
        })

        await unfollowUser(request, response)
        expect(response.status).toHaveBeenCalledWith(409)
        expect(response.json).toHaveBeenCalledWith({error: 'Can not unfollow a user you do not follow'})

    })

    it('should return a status code of 200 if user suceesfully unfollows user', async()=>{
  
        const request = {
            params: {
                followerId: 1,
                followingId: 2
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const mockRecordSet = [
            {
                "following_id": 2,
                "following_first_name": "Paul",
                "following_last_name": "Sanga"
            }
        ]

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({recordset: mockRecordSet})
        })

        await unfollowUser(request, response)
        expect(response.status).toHaveBeenCalledWith(200)
        expect(response.json).toHaveBeenCalledWith({message: 'Unfollow successfull'})
        
    })

})

describe('Fetch User Following', ()=>{

    it('should return a status code of 500 when an error occurs during request execution', async()=>{

        const request = {
            params: {
                followerId: 1
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
        
        const mockPool = {
            request: jest.fn(()=>{
                throw new Error('Error connecting to the database server')
            })
        }

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce(mockPool)
        await fetchUserFollowing(request, response)
        expect(response.status).toHaveBeenCalledWith(500)
        expect(response.json).toHaveBeenCalledWith({error: 'Internal server error'})

    })

    it('should return a status code of 200 if user followings are retrieved sucessfully', async()=>{

        const request = {
            params: {
                followerId: 1
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const mockRecordSet = [
            {
                "following_id": 2,
                "following_first_name": "Paul",
                "following_last_name": "Sanga"
            }
        ]

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({recordset: mockRecordSet})
        })

        await fetchUserFollowing(request, response)
        expect(response.status).toHaveBeenCalledWith(200)
        expect(response.json).toHaveBeenCalledWith({
            message: 'Fetch successful', 
            following: mockRecordSet
        })
        
    })

})