const mssql = require('mssql')
const { createNewPost, getAllPosts, getPostById, getUserPosts, updatePost, deletePost, fetchAllPostAndTheirAuthors } = require('../../src/controller/post.controller')
const { postSchema } = require('../../src/utils/validators')


describe("Create New Post Test Suites", ()=>{

    it('should return a status code of 400 when the request body is empty or missing', async()=>{

        const request = {}
        
        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        await createNewPost(request, response)
        expect(response.status).toHaveBeenCalledWith(400)
        expect(response.json).toHaveBeenCalledWith({error: 'Request body can not be empty'})
    })

    it('should return a status code of 500 if an error occurs during request execution', async()=>{
       
        const request = {
            body: {
                "image": "https://pin.it/7xuYCnB",
                "content": "Another beautiful girl's picture"
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
                throw new Error("Error connecting to the database server")
            })
        }

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce(mockPool)
        await createNewPost(request, response)
        expect(response.status).toHaveBeenCalledWith(500)
        expect(response.json).toHaveBeenCalledWith({error: 'Internal server error'})

    })

    it('should return a status code of 422 when user input validation fails', async()=>{

        const request = {
            body: {
                "image": "pin.it/7xuYCnB",
                "content": "Another beautiful girl's picture"
            },
            params: {
                id: 1
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
        
        const createNewPostValidation = jest.spyOn(postSchema, 'validate')
        createNewPostValidation.mockReturnValue({error: new Error("Invalid url on the image field")})

        await createNewPost(request, response)
        expect(response.status).toHaveBeenCalledWith(422)
        expect(response.json).toHaveBeenCalledWith({error: 'Invalid url on the image field'})
    })

    it('should return a status code of 400 if an error occured when saving post to the database', async()=>{

        const request = {
            body: {
                "image": "pin.it/7xuYCnB",
                "content": "Another beautiful girl's picture"
            },
            params: {
                id: 1
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
        
        const createNewPostValidation = jest.spyOn(postSchema, 'validate')
        createNewPostValidation.mockReturnValue({error: null})

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({ rowsAffected: [0] })
        })

        await createNewPost(request, response)
        expect(response.status).toHaveBeenCalledWith(400)
        expect(response.json).toHaveBeenCalledWith({error: 'Error creating post'})
    })

    it('should return a status code of 201 when post is saved to the database', async()=>{

        const request = {
            body: {
                "image": "pin.it/7xuYCnB",
                "content": "Another beautiful girl's picture"
            },
            params: {
                id: 1
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
        
        const createNewPostValidation = jest.spyOn(postSchema, 'validate')
        createNewPostValidation.mockReturnValue({error: null})

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({ rowsAffected: [1] })
        })

        await createNewPost(request, response)
        expect(response.status).toHaveBeenCalledWith(201)
        expect(response.json).toHaveBeenCalledWith({message: 'Post created successfully'})
    })

})

describe('Get All Posts Test Suites', ()=>{
    
    it('should return a status code of 200 after fetching all posts', async()=>{

        const mockRecordSet = [
            {
                "id": 1,
                "user_id": 2,
                "image": "https://pin.it/1JP2tzT",
                "content": "Cool boy's picture",
                "created_at": "2023-09-09T17:58:42.180Z",
                "update_at": "2023-09-09T18:12:32.030Z",
                "is_deleted": false
            },
            {
                "id": 2,
                "user_id": 2,
                "image": "https://pin.it/7xuYCnB",
                "content": "Another beautiful girl's picture",
                "created_at": "2023-09-09T18:02:56.720Z",
                "update_at": null,
                "is_deleted": false
            }
        ]

        const request = {}
        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({ recordset: mockRecordSet })
        })

        await fetchAllPostAndTheirAuthors(request, response)
        expect(response.status).toHaveBeenCalledWith(200)
        expect(response.json).toHaveBeenCalledWith({
            message: 'Fetch successful',
            posts: mockRecordSet
        })
    })

    it('should return a status code of 500 when an error occurs during request execution', async()=>{

        const request = {}
        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const mockPool = {
            request: jest.fn(()=>{
                throw new Error("Error connecting to the database")
            })
        }

        jest.fn().mockResolvedValueOnce(mockPool)
        await fetchAllPostAndTheirAuthors(request, response)
        expect(response.status).toHaveBeenCalledWith(500)
        expect(response.json).toHaveBeenCalledWith({error: 'Internal server error'})
    })

})

describe('Get Post By Id Test Suites', ()=>{

    it('should return a status code of 404 if post does not exist in the database', async()=>{

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

        await getPostById(request, response)
        expect(response.status).toHaveBeenCalledWith(404)
        expect(response.json).toHaveBeenCalledWith({error: 'Post not found'})
    })

    it('should return a status code of 200 if post exists in the database', async()=>{

        const mockRecordSet = [
            {
                "id": 2,
                "user_id": 2,
                "image": "https://pin.it/7xuYCnB",
                "content": "Another beautiful girl's picture",
                "created_at": "2023-09-09T18:02:56.720Z",
                "update_at": null,
                "is_deleted": false
            }
        ]

        const request = {
            params: {
                id: 2
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

        await getPostById(request, response)
        expect(response.status).toHaveBeenCalledWith(200)
        expect(response.json).toHaveBeenCalledWith({
            message: 'Fetch successful',
            post: mockRecordSet[0]
        })
    })

    it('should return a status code of 500 when an error occurs during request execution', async()=>{
        
        const request = {
            params: {
                id: 2
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

        await getPostById(request, response)
        expect(response.status).toHaveBeenCalledWith(500)
        expect(response.json).toHaveBeenCalledWith({error: 'Internal server error'})
    })

})

describe('Get User Posts Test Suite', ()=>{

    it('should return a status code of 500 when an error occurs during request execution', async()=>{

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
                throw new Error("Error connenting to the database")
            })
        }

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce(mockPool)
        await getUserPosts(request, response)
        expect(response.status).toHaveBeenCalledWith(500)
        expect(response.json).toHaveBeenCalledWith({error: 'Internal server error'})

    })

    it('should return a status code of 200 when user posts are retrieved from the database', async()=>{

        const mockRecordSet = [
            {
                "id": 1,
                "image": "https://pin.it/1JP2tzT",
                "content": "Cool boy's picture",
                "created_at": "2023-09-09T17:58:42.180Z",
                "update_at": "2023-09-09T18:12:32.030Z",
                "is_deleted": true
            },
            {
                "id": 2,
                "image": "https://pin.it/7xuYCnB",
                "content": "Another beautiful girl's picture",
                "created_at": "2023-09-09T18:02:56.720Z",
                "update_at": null,
                "is_deleted": false
            }
        ]

        const request = {
            params: {
                id: 2
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

        await getUserPosts(request, response)
        expect(response.status).toHaveBeenCalledWith(200)
        expect(response.json).toHaveBeenCalledWith({
            message: 'Fetch successful',
            posts: mockRecordSet
        })
    })

})

describe('Update Post Test Suites', ()=>{

    it('should return a status code of 400 if the request body is empty or missing', async()=>{

        const request = {}
        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        await updatePost(request, response)
        expect(response.status).toHaveBeenCalledWith(400)
        expect(response.json).toHaveBeenCalledWith({error: 'Request body can not be empty'})

    })

    it('should return a status code of 422 if user input validation fails', async()=>{

        const request = {
            body: {
                "image": "pin.it/7xuYCnB",
                "content": "Another beautiful girl's picture"
            },
            params: {
                id: 1,
                userId: 2
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const updatePostValidation = jest.spyOn(postSchema, 'validate')
        updatePostValidation.mockReturnValue({error: new Error("Invalid image url")})

        await updatePost(request, response)
        expect(response.status).toHaveBeenCalledWith(422)
        expect(response.json).toHaveBeenCalledWith({error: 'Invalid image url'})
    })

    it('should return a status code of 404 if post is not in the database', async()=>{

        const mockRecordSet = []

        const request = {
            body: {
                "image": "pin.it/7xuYCnB",
                "content": "Another beautiful girl's picture"
            },
            params: {
                id: 1,
                userId: 2
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const updatePostValidation = jest.spyOn(postSchema, 'validate')
        updatePostValidation.mockReturnValue({error: null})

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({recordset: mockRecordSet})
        })

        await updatePost(request, response)
        expect(response.status).toHaveBeenCalledWith(404)
        expect(response.json).toHaveBeenCalledWith({error: 'Post not found'})
    })

    it('should return a status code of 409 if post is deleted', async()=>{

        const mockRecordSet = [
            {
                "id": 1,
                "user_id": 2,
                "image": "https://pin.it/1JP2tzT",
                "content": "Cool boy's picture",
                "created_at": "2023-09-09T17:58:42.180Z",
                "update_at": "2023-09-09T18:12:32.030Z",
                "is_deleted": 1
            }
        ]

        const request = {
            body: {
                "image": "pin.it/7xuYCnB",
                "content": "Another beautiful girl's picture"
            },
            params: {
                id: 1,
                userId: 2
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const updatePostValidation = jest.spyOn(postSchema, 'validate')
        updatePostValidation.mockReturnValue({error: null})

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({recordset: mockRecordSet})
        })

        await updatePost(request, response)
        expect(response.status).toHaveBeenCalledWith(409)
        expect(response.json).toHaveBeenCalledWith({error: 'Post is deleted'})
    })

    it('should return a status code of 409 is user is not the author of the post', async()=>{
        const mockRecordSet = [
            {
                "id": 1,
                "user_id": 2,
                "image": "https://pin.it/1JP2tzT",
                "content": "Cool boy's picture",
                "created_at": "2023-09-09T17:58:42.180Z",
                "update_at": "2023-09-09T18:12:32.030Z",
                "is_deleted": 0
            }
        ]

        const request = {
            body: {
                "image": "pin.it/7xuYCnB",
                "content": "Another beautiful girl's picture"
            },
            params: {
                id: 1,
                userId: 1
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const updatePostValidation = jest.spyOn(postSchema, 'validate')
        updatePostValidation.mockReturnValue({error: null})

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({recordset: mockRecordSet})
        })

        await updatePost(request, response)
        expect(response.status).toHaveBeenCalledWith(409)
        expect(response.json).toHaveBeenCalledWith({error: 'This post does not belong to you, you can not update it'})
    })

    it('should return a status code 500 if an error occurs during request execution', async()=>{
        
        const request = {
            body: {
                "image": "pin.it/7xuYCnB",
                "content": "Another beautiful girl's picture"
            },
            params: {
                id: 1,
                userId: 1
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

        jest.fn().mockResolvedValueOnce(mockPool)
        await updatePost(request, response)
        expect(response.status).toHaveBeenCalledWith(500)
        expect(response.json).toHaveBeenCalledWith({error: 'Internal server error'})
    })

    it('should return a status code of 200 when post is updated in the database', async()=>{

        const mockRecordSet = [
            {
                "id": 1,
                "user_id": 1,
                "image": "https://pin.it/1JP2tzT",
                "content": "Cool boy's picture",
                "created_at": "2023-09-09T17:58:42.180Z",
                "update_at": "2023-09-09T18:12:32.030Z",
                "is_deleted": 0
            }
        ]

        const request = {
            body: {
                "image": "pin.it/7xuYCnB",
                "content": "Another beautiful girl's picture"
            },
            params: {
                id: 1,
                userId: 1
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const updatePostValidation = jest.spyOn(postSchema, 'validate')
        updatePostValidation.mockReturnValue({error: null})

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({recordset: mockRecordSet})
        })

        await updatePost(request, response)
        expect(response.status).toHaveBeenCalledWith(200)
        expect(response.json).toHaveBeenCalledWith({message: 'Post updated successfully'})

    })

})


describe('Delete Post Tests Suites', ()=>{

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
                throw new Error('Error connecting to the databse')
            })
        }

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce(mockPool)
        await deletePost(request, response)
        expect(response.status).toHaveBeenCalledWith(500)
        expect(response.json).toHaveBeenCalledWith({error: 'Internal server error'})
    })

    it('should return a status code of 404 if post does not exist in the db', async()=>{

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

        await deletePost(request, response)
        expect(response.status).toHaveBeenCalledWith(404)
        expect(response.json).toHaveBeenCalledWith({error: 'Post not found'})
    })


    it('should return a status code of 409 if post is already deleted', async()=>{

        const mockRecordSet = [
            {
                "id": 1,
                "user_id": 1,
                "image": "https://pin.it/1JP2tzT",
                "content": "Cool boy's picture",
                "created_at": "2023-09-09T17:58:42.180Z",
                "update_at": "2023-09-09T18:12:32.030Z",
                "is_deleted": 1
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

        await deletePost(request, response)
        expect(response.status).toHaveBeenCalledWith(409)
        expect(response.json).toHaveBeenCalledWith({error: 'Post is already deleted'})
    })


    it('should return a status code of 200 when post is deleted from the database', async()=>{

        const mockRecordSet = [
            {
                "id": 1,
                "user_id": 1,
                "image": "https://pin.it/1JP2tzT",
                "content": "Cool boy's picture",
                "created_at": "2023-09-09T17:58:42.180Z",
                "update_at": "2023-09-09T18:12:32.030Z",
                "is_deleted": 0
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

        await deletePost(request, response)
        expect(response.status).toHaveBeenCalledWith(200)
        expect(response.json).toHaveBeenCalledWith({message: 'Post deleted successfully'})
    })

})