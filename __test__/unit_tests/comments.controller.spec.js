const mssql = require('mssql')
const { createNewComment, fetchPostComments, updateComment, deleteComment } = require('../../src/controller/comments.controller')
const { commentSchema } = require('../../src/utils/validators')

describe('Create New Comment Test Suites', ()=>{

    it('should return a status of 400 if request body is empty', async()=>{
        
        const request = {}
        
        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        await createNewComment(request, response)
        expect(response.status).toHaveBeenCalledWith(400)
        expect(response.json).toHaveBeenCalledWith({error: 'Request body can not be empty'})
    })

    it('should return a status code of 422 when user input validation fails', async()=>{

        const request = {
            body: {
                content: "Do"
            },
            params: {
                userId: 1,
                postId: 2
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const commentValidation = jest.spyOn(commentSchema, 'validate')
        commentValidation.mockReturnValue({error: new Error("Input validation failed")})

        await createNewComment(request, response)
        expect(response.status).toHaveBeenCalledWith(422)
        expect(response.json).toHaveBeenCalledWith({error: 'Input validation failed'})
    })

    it('should return a status code of 200 when a new comment is saved to the database', async()=>{

        const request = {
            body: {
                content: "Dope car"
            },
            params: {
                userId: 1,
                postId: 2
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const commentValidation = jest.spyOn(commentSchema, 'validate')
        commentValidation.mockReturnValue({error: null})

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce()
        })

        await createNewComment(request, response)
        expect(response.status).toHaveBeenCalledWith(201)
        expect(response.json).toHaveBeenCalledWith({message: 'Comment created successfully'})
    })

    it('should return a status code of 500 if an error occurs during request execution', async()=>{

        const request = {
            body: {
                content: "Dope car"
            },
            params: {
                userId: 1,
                postId: 2
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
        await createNewComment(request, response)
        expect(response.status).toHaveBeenCalledWith(500)
        expect(response.json).toHaveBeenCalledWith({error: 'Internal server error'})
    })

})


describe('Fetch Post Comment Test Suites', ()=>{

    it('should return a status code of 200 when comments are retrieved from the database', async()=>{

        const mockRecordSet = [
            {
                "comment_id": 1,
                "comment_content": "Dope car",
                "comment_created_at": "2023-09-09T23:48:30.100Z",
                "user_id": 2,
                "user_first_name": "Paul",
                "user_last_name": "Sanga",
                "user_email": "paul.nyamawi99@gmail.com",
                "user_avatar": "https://www.phantom-labs.com"
            }
        ]

        const request = {
            params: {
                postId: 1
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

        await fetchPostComments(request, response)
        expect(response.status).toHaveBeenCalledWith(200)
        expect(response.json).toHaveBeenCalledWith({
            message: "Fetch successful",
            comments: mockRecordSet
        })
    })

    it('should return status code of 500 when an error occurs during request execution', async()=>{

        const request = {
            params: {
                postId: 1
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const mockPool = {
            request: jest.fn(()=>{
                throw new Error("Failed to login user")
            })
        }

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce(mockPool)
        await fetchPostComments(request, response)
        expect(response.status).toHaveBeenCalledWith(500)
        expect(response.json).toHaveBeenCalledWith({error: 'Internal server error'})
    })

})

describe('Update Comments Tests Suites', ()=>{

    it('should return a status code of 400 if request body is empty or missing', async()=>{

        const request = {}

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        await updateComment(request, response)
        expect(response.status).toHaveBeenCalledWith(400)
        expect(response.json).toHaveBeenCalledWith({error: 'Request body can not be empty'})
    })

    it('should return a status code of 422 when user input validation fails', async()=>{

        const request = {
            body: {
                content: "Go"
            },
            params: {
                commentId: 2,
                userId: 1
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const updateCommentValidation = jest.spyOn(commentSchema, 'validate')
        updateCommentValidation.mockReturnValue({error: new Error('Input validation failed')})

        await updateComment(request, response)
        expect(response.status).toHaveBeenCalledWith(422)
        expect(response.json).toHaveBeenCalledWith({error: 'Input validation failed'})
    })

    it('should return a status code of 404 if comment is not found', async()=>{

        const mockRecordSet = []

        const request = {
            body: {
                content: "Gorgeous lass"
            },
            params: {
                commentId: 2,
                userId: 1
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const updateCommentValidation = jest.spyOn(commentSchema, 'validate')
        updateCommentValidation.mockReturnValue({error: null})

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({recordset: mockRecordSet})
        })

        await updateComment(request, response)
        expect(response.status).toHaveBeenCalledWith(404)
        expect(response.json).toHaveBeenCalledWith({error: 'Comment not found'})
    })

    it('should return a status code of 409 if comment is deleted', async()=>{

        const mockRecordSet = [
            {
                "comment_id": 1,
                "comment_content": "Dope car",
                "comment_created_at": "2023-09-09T23:48:30.100Z",
                "is_deleted": 1,
                "user_id": 2,
                "user_first_name": "Paul",
                "user_last_name": "Sanga",
                "user_email": "paul.nyamawi99@gmail.com",
                "user_avatar": "https://www.phantom-labs.com"
            }
        ]

        const request = {
            body: {
                content: "Gorgeous lass"
            },
            params: {
                commentId: 2,
                userId: 2
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const updateCommentValidation = jest.spyOn(commentSchema, 'validate')
        updateCommentValidation.mockReturnValue({error: null})

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({recordset: mockRecordSet})
        })

        await updateComment(request, response)
        expect(response.status).toHaveBeenCalledWith(409)
        expect(response.json).toHaveBeenCalledWith({error: 'Comment is deleted'})
    })

    it('should return a status code of 409 if user is not the owner of the comment', async()=>{

        const mockRecordSet = [
            {
                "comment_id": 1,
                "comment_content": "Dope car",
                "comment_created_at": "2023-09-09T23:48:30.100Z",
                "is_deleted": 0,
                "user_id": 2,
                "user_first_name": "Paul",
                "user_last_name": "Sanga",
                "user_email": "paul.nyamawi99@gmail.com",
                "user_avatar": "https://www.phantom-labs.com"
            }
        ]

        const request = {
            body: {
                content: "Gorgeous lass"
            },
            params: {
                commentId: 2,
                userId: 1
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const updateCommentValidation = jest.spyOn(commentSchema, 'validate')
        updateCommentValidation.mockReturnValue({error: null})

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({recordset: mockRecordSet})
        })

        await updateComment(request, response)
        expect(response.status).toHaveBeenCalledWith(409)
        expect(response.json).toHaveBeenCalledWith({error: 'This comment does not belong to you, ergo you can not update it'})

    })

    it('should return a status code of 200 if the comment is updated', async()=>{

        const mockRecordSet = [
            {
                "comment_id": 1,
                "comment_content": "Dope car",
                "comment_created_at": "2023-09-09T23:48:30.100Z",
                "is_deleted": 0,
                "user_id": 2,
                "user_first_name": "Paul",
                "user_last_name": "Sanga",
                "user_email": "paul.nyamawi99@gmail.com",
                "user_avatar": "https://www.phantom-labs.com"
            }
        ]

        const request = {
            body: {
                content: "Gorgeous lass"
            },
            params: {
                commentId: 2,
                userId: 2
            }
        }

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const updateCommentValidation = jest.spyOn(commentSchema, 'validate')
        updateCommentValidation.mockReturnValue({error: null})

        jest.spyOn(mssql, 'connect').mockResolvedValueOnce({
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValueOnce({recordset: mockRecordSet})
        })

        await updateComment(request, response)
        expect(response.status).toHaveBeenCalledWith(200)
        expect(response.json).toHaveBeenCalledWith({message: 'Comment updated'})
    })

    it('should return a status code of 500 when an error occurs during request execution', async()=>{

        const request = {
            body: {
                content: "Gorgeous lass"
            },
            params: {
                commentId: 2,
                userId: 2
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
        await updateComment(request, response)
        expect(response.status).toHaveBeenCalledWith(500)
        expect(response.json).toHaveBeenCalledWith({error: 'Internal server error'})
    })

})


describe('Delete Comment Test Suites', ()=>{

    it('should return a status code of 404 if comment is not in the database', async()=>{

        const mockRecordSet = []
    
        const request = {
            params: {
                commentId: 2,
                userId: 2
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
    
        await deleteComment(request, response)
        expect(response.status).toHaveBeenCalledWith(404)
        expect(response.json).toHaveBeenCalledWith({error: 'Comment not found'})

    })


    it('should return a status code of 409 if the comment is already deleted', async()=>{

        const mockRecordSet = [
            {
                "comment_id": 1,
                "comment_content": "Dope car",
                "comment_created_at": "2023-09-09T23:48:30.100Z",
                "is_deleted": 1,
                "user_id": 2,
                "user_first_name": "Paul",
                "user_last_name": "Sanga",
                "user_email": "paul.nyamawi99@gmail.com",
                "user_avatar": "https://www.phantom-labs.com"
            }
        ]

        const request = {
            params: {
                commentId: 2,
                userId: 2
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

        await deleteComment(request, response)
        expect(response.status).toHaveBeenCalledWith(409)
        expect(response.json).toHaveBeenCalledWith({error: 'Comment is already deleted'})
    })


    it('should return a status code of 403 if the comment does not belong to the user', async()=>{

        const mockRecordSet = [
            {
                "comment_id": 1,
                "comment_content": "Dope car",
                "comment_created_at": "2023-09-09T23:48:30.100Z",
                "is_deleted": 0,
                "user_id": 2,
                "user_first_name": "Paul",
                "user_last_name": "Sanga",
                "user_email": "paul.nyamawi99@gmail.com",
                "user_avatar": "https://www.phantom-labs.com"
            }
        ]

        const request = {
            params: {
                commentId: 2,
                userId: 1
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

        await deleteComment(request, response)
        expect(response.status).toHaveBeenCalledWith(403)
        expect(response.json).toHaveBeenCalledWith({error: 'Comment does not belong to you, ergo you do not have the right to delete it'})
    })


    it('should return a status code of 200 when comment is deleted', async()=>{

        const mockRecordSet = [
            {
                "comment_id": 1,
                "comment_content": "Dope car",
                "comment_created_at": "2023-09-09T23:48:30.100Z",
                "is_deleted": 0,
                "user_id": 2,
                "user_first_name": "Paul",
                "user_last_name": "Sanga",
                "user_email": "paul.nyamawi99@gmail.com",
                "user_avatar": "https://www.phantom-labs.com"
            }
        ]

        const request = {
            params: {
                commentId: 2,
                userId: 2
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

        await deleteComment(request, response)
        expect(response.status).toHaveBeenCalledWith(200)
        expect(response.json).toHaveBeenCalledWith({message: 'Comment deleted'})
    })

    it('should return a status code of 500 if an error occurs during request execution', async()=>{

        const request = {
            params: {
                commentId: 2,
                userId: 2
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
        await deleteComment(request, response)
        expect(response.status).toHaveBeenCalledWith(500)
        expect(response.json).toHaveBeenCalledWith({ error: 'Internal server error' })

    })

})