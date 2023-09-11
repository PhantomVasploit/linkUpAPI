const mssql = require('mssql')
const { likePost, unlikePost, fetchPostsLikedByUser } = require('../../src/controller/post.likes.controller')

describe('Like Post Test Suites', ()=>{

    it('should return a status code of 500 if an error occurs during request execution', async()=>{

        const request = {
            params: {
                userId: 1,
                postId: 3
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const mockPool = {
            request: jest.fn(()=>{
                throw new Error("Could not connect to the database server")
            })
        }

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce(mockPool)
        await likePost(request, response)
        expect(response.status).toHaveBeenCalledWith(500)
        expect(response.json).toHaveBeenCalledWith({error: 'Internal server error'})

    })

    it('should return a status of 409 when user has already liked the post', async()=>{

        const request = {
            params: {
                userId: 1,
                postId: 3
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const mockRecordSet = [
            {
                "id": 1,
                "user_id": 1,
                "post_id": 3
            }
        ]

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({recordset: mockRecordSet})
        })

        await likePost(request, response)
        expect(response.status).toHaveBeenCalledWith(409)
        expect(response.json).toHaveBeenCalledWith({error: 'User already liked the post'})
    })

    it('should return a status code of 200 when post is liked successfully', async()=>{

        const request = {
            params: {
                userId: 1,
                postId: 3
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

        await likePost(request, response) 
        expect(response.status).toHaveBeenCalledWith(201)
        expect(response.json).toHaveBeenCalledWith({message: 'Post liked'})
    })

})


describe('Ulike Post Test Suites', ()=>{

    it('should return a status code of 500 when an error occurs during request execution', async()=>{

        const request = {
            params: {
                userId: 1,
                postId: 3
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const mockPool = {
            request: jest.fn(()=>{
                throw new Error('Could not connect to database server')
            })
        }

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce(mockPool)
        await unlikePost(request, response)
        expect(response.status).toHaveBeenCalledWith(500)
        expect(response.json).toHaveBeenCalledWith({error: 'Internal server error'})
    })

    it('should return a status code of 409 when user tries to unlike a post they have not liked', async()=>{

        const request = {
            params: {
                userId: 1,
                postId: 3
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

        await unlikePost(request, response)
        expect(response.status).toHaveBeenCalledWith(409)
        expect(response.json).toHaveBeenCalledWith({error: 'You can not unlike a post you did not like'})

    })

    it('shoud return a status code of 200 if post is successfully unliked', async()=>{

        const request = {
            params: {
                userId: 1,
                postId: 3
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const mockRecordSet = [
            {
                "id": 1,
                "user_id": 1,
                "post_id": 3
            }
        ]

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({recordset: mockRecordSet})
        })

        await unlikePost(request, response)
        expect(response.status).toHaveBeenCalledWith(200)
        expect(response.json).toHaveBeenCalledWith({message: 'Post unliked'})
    })

})


describe('Fetch Posts Liked By User Test Suites', ()=>{

    it('should return a status code of 500 if an error occurs during request execution', async()=>{

        const request = {
            params: {
                userId: 1
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const mockPool = {
            request: jest.fn(()=>{
                throw new Error("Could not connect to the database server")
            })
        }
        jest.spyOn(mssql, 'connect').mockResolvedValueOnce(mockPool)
        await fetchPostsLikedByUser(request, response)
        expect(response.status).toHaveBeenCalledWith(500)
        expect(response.json).toHaveBeenCalledWith({error: 'Internal server error'})
    })

    it('should return a status code of 200 when posts are fetched successfully', async()=>{
        
        const request = {
            params: {
                userId: 1
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const mockRecordSet = [
            {
                
            }
        ]

    })

})