const mssql = require('mssql')
const { sqlConfig } = require('../config/database.connection.config')

module.exports.likePost = async(req, res)=>{
    try {
        
        const {userId, postId} = req.params
        const pool = await mssql.connect(sqlConfig)
        const checkUserLike = await pool
        .request()
        .input('user_id', userId)
        .input('post_id', postId)
        .execute('isPostLikedByUserProc')

        if(checkUserLike.recordset.length <= 0){
            await pool
            .request()
            .input('user_id', userId)
            .input('post_id', postId)
            .execute('likePostProc')

            return res.status(201).json({message: 'Post liked'})
        }

        return res.status(409).json({error: 'User already liked the post'})

    } catch (error) {
        return res.status(500).json({error: 'Internal server error'})
    }   
}

module.exports.unlikePost = async(req, res)=>{
    try {
        
        const { userId, postId } = req.params

        const pool = await mssql.connect(sqlConfig)
        const checkUserLike = await pool
        .request()
        .input('user_id', userId)
        .input('post_id', postId)
        .execute('isPostLikedByUserProc')

        if(checkUserLike.recordset.length <= 0){
            return res.status(409).json({error: 'You can not unlike a post you did not like'})
        }

        await pool
        .request()
        .input('user_id', userId)
        .input('post_id', postId)
        .execute('unlikePostProc')

        return res.status(200).json({message: 'Post unliked'})
    } catch (error) {
        return res.status(500).json({error: 'Internal server error'})
    }
}

module.exports.fetchPostsLikedByUser = async(req, res)=>{
    try {
        
        const { userId } = req.params

        const pool = await mssql.connect(sqlConfig)

        const likedPosts = await pool 
        .request()
        .input('user_id', userId)
        .execute('getPostsLikedByUserProc')

        return res.status(200).json({message: 'Fetch successful', posts: likedPosts.recordset})

    } catch (error) {
        return res.status(500).json({error: 'Internal server error'})
    }
}