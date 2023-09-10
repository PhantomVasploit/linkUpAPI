const mssql = require('mssql')

const { commentSchema } = require('../utils/validators')
const { sqlConfig } = require('../config/database.connection.config')

module.exports.createNewComment = async(req, res)=>{
    try {
        
        if(!req.body){
            return res.status(400).json({error: 'Request body can not be empty'})
        }
        
        const { content } = req.body
        const {userId, postId} = req.params

        const {error} = commentSchema.validate({content})
        if(error){
            return res.status(422).json({error: error.message})
        }

        const pool = await mssql.connect(sqlConfig)
        await pool
        .request()
        .input('user_id', userId)
        .input('post_id', postId)
        .input('content', content)
        .execute('createNewCommentProc')

        return res.status(201).json({message: 'Comment created successfully'})

    } catch (error) {
        return res.status(500).json({error: 'Internal server error'})
    }
}

module.exports.fetchPostComments = async(req, res)=>{
    try {

        const {postId} = req.params

        const pool = await mssql.connect(sqlConfig)
        const comments = await pool
        .request()
        .input('post_id', postId)
        .execute('fetchAllPostCommentsAndTheirAuthorProc')

        return res.status(200).json({message: 'Fetch successful', comments: comments.recordset})

    } catch (error) {
        return res.status(500).json({error: 'Internal server error'})
    }
}

module.exports.updateComment = async(req, res)=>{
    try {
        
        if(!req.body){
            return res.status(400).json({error: 'Request body can not be empty'})
        }

        const { content } = req.body
        const {commentId, userId} = req.params

        const {error} = commentSchema.validate({content})
        if(error){
            return res.status(422).json({error: error.message})
        }

        const pool = await mssql.connect(sqlConfig)
        const checkCommentQuery = await pool
        .request()
        .input('id', commentId)
        .execute('fetchCommentByIdProc')

        if(checkCommentQuery.recordset.length <= 0){
            return res.status(404).json({error: 'Comment not found'})
        }

        if(checkCommentQuery.recordset[0].is_deleted == 1){
            return res.status(409).json({error: 'Comment is deleted'})
        }

        if(checkCommentQuery.recordset[0].user_id != userId){
            return res.status(409).json({error: 'This comment does not belong to you, ergo you can not update it'})
        }

        await pool 
        .request()
        .input('id', commentId)
        .input('content', content)
        .execute('updateCommentProc')

        return res.status(200).json({message: 'Comment updated'})


    } catch (error) {
        return res.status(500).json({error: 'Internal server error'})
    }
}

module.exports.deleteComment = async(req, res)=>{
    try {
        
        const {commentId, userId} = req.params

        const pool = await mssql.connect(sqlConfig)
        const checkCommentQuery = await pool
        .request()
        .input('id', commentId)
        .execute('fetchCommentByIdProc')

        if(checkCommentQuery.recordset.length <= 0){
            return res.status(404).json({error: 'Comment not found'})
        }

        if(checkCommentQuery.recordset[0].is_deleted == 1){
            return res.status(409).json({error: 'Comment is already deleted'})
        }

        if(checkCommentQuery.recordset[0].user_id != userId){
            return res.status(403).json({error: 'Comment does not belong to you, ergo you do not have the right to delete it'})
        }

        await pool
        .request()
        .input('id', commentId)
        .execute('deleteCommentProc')

        return res.status(200).json({message: 'Comment deleted'})
    } catch (error) {
        return res.status(500).json({error: 'Internal server error'})
    }
}