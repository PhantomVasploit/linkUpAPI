const mssql = require('mssql')
const { postSchema } = require('../utils/validators')
const { sqlConfig } = require('../config/database.connection.config')

module.exports.createNewPost = async(req, res)=>{
    try {
        if(!req.body){
            return res.status(400).json({error: 'Request body can not be empty'})
        }
    
        const {content, image} = req.body
        const { id } = req.params
    
        const {error} = postSchema.validate({content, image})
        if(error){
            return res.status(422).json({error: error.message})
        }
    
        const pool = await mssql.connect(sqlConfig)
        const result = await pool
        .request()
        .input('user_id', id)
        .input('image', image)
        .input('content', content)
        .execute('createNewPostsProc')
    
        if(result.rowsAffected[0] == 1){
            return res.status(201).json({message: 'Post created successfully'})
        }
        return res.status(400).json({error: 'Error creating post'})
        
    } catch (error) {
        return res.status(500).json({error: 'Internal server error'})    
    }
}

module.exports.getAllPosts = async(req, res)=>{
    try {
        
        const pool = await mssql.connect(sqlConfig)
        const posts = await pool
        .request()
        .execute('getAllPostsProc')

        return res.status(200).json({message: 'Fetch successful', posts: posts.recordset})

    } catch (error) {
        return res.status(500).json({error: 'Internal server error'})
    }
}

module.exports.getPostById = async(req, res)=>{
    try {
        
        const {id} = req.params
        const pool = await mssql.connect(sqlConfig)
        const post = await pool
        .request()
        .input('id', id)
        .execute('getPostByIdProc')

        if(post.recordset.length <= 0){
            return res.status(404).json({error: 'Post not found'})
        }
        return res.status(200).json({message: 'Fetch successful', post: post.recordset[0]})
    } catch (error) {
        return res.status(500).json({error: 'Internal server error'})
    }
}

module.exports.getUserPosts = async(req, res)=>{

    try {
        const {id} = req.params

        const pool = await mssql.connect(sqlConfig)
        const userPosts = await pool
        .request()
        .input('user_id', id)
        .execute('getUserPostsProc')

        return res.status(200).json({message: 'Fetch successful', posts: userPosts.recordset})
    } catch (error) {
        return res.status(500).json({error: 'Internal server error'})
    }

}


module.exports.updatePost = async(req, res)=>{
    try {

        if(!req.body){
            return res.status(400).json({error: 'Request body can not be empty'})
        }

        const {id, userId} = req.params
        const {image, content} = req.body

        const {error} = postSchema.validate({image, content})
        if(error){
            return res.status(422).json({error: error.message})
        }

        const pool = await mssql.connect(sqlConfig)
        const checkPostQuery = await pool
        .request()
        .input('id', id)
        .execute('getPostByIdProc')

        if(checkPostQuery.recordset.length <= 0){
            return res.status(404).json({error: 'Post not found'})
        }

        if(checkPostQuery.recordset[0].is_deleted == 1){
            return res.status(409).json({error: 'Post is deleted'})
        }

        if(checkPostQuery.recordset[0].user_id != userId){
            return res.status(409).json({error: 'This post does not belong to you, you can not update it'})
        }

        await pool
        .request()
        .input('id', id)
        .input('image', image)
        .input('content', content)
        .execute('updatePostProc')

        return res.status(200).json({message: 'Post updated successfully'})

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({error: 'Internal server error'})
    }
}

module.exports.deletePost = async(req, res)=>{
    try {
        const {id} = req.params

        const pool = await mssql.connect(sqlConfig)
        const checkPostQuery = await pool
        .request()
        .input('id', id)
        .execute('getPostByIdProc')

        if(checkPostQuery.recordset.length <= 0){
            return res.status(404).json({error: 'Post not found'})
        }

        if(checkPostQuery.recordset[0].is_deleted == 1){
            return res.status(409).json({error: 'Post is already deleted'})
        }

        await pool
        .request()
        .input('id',id)
        .execute('deletePostProc')

        return res.status(200).json({message: 'Post deleted successfully'})
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({error: 'Internal server error'})
    }
}