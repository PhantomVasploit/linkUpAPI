const mssql = require('mssql')

const { sqlConfig } = require('../config/database.connection.config')

module.exports.followUser = async(req, res)=>{
    try {

        const { followerId, followingId } = req.params
        const pool = await mssql.connect(sqlConfig)
        const result = await pool
        .request()
        .input('follower_id', followerId)
        .input('following_id', followingId)
        .execute('isFollowing')

        if(result.recordset.length <= 0){
            await pool
            .request()
            .input('follower_id', followerId)
            .input('following_id', followingId)
            .execute('folloUserProc')
            return res.status(201).json({message: 'User following added'})
        }

        return res.status(409).json({error: 'User already follows this user'})

    } catch (error) {
        return res.status(500).json({error: 'Internal server error'})
    }
}


module.exports.unfollowUser = async(req, res)=>{
    try {
        
        const {followerId, followingId} = req.params

        const pool = await mssql.connect(sqlConfig)
        const result = await pool
        .request()
        .input('follower_id', followerId)
        .input('following_id', followingId)
        .execute('isFollowing')

        if(result.recordset.length <= 0){
            return res.status(409).json({error: 'Can not unfollow a user you do not follow'})
        }

        await pool
        .request()
        .input('follower_id', followerId)
        .input('following_id', followingId)
        .execute('unfollowUserProc')

        return res.status(200).json({message: 'Unfollow successfull'})

    } catch (error) {
        return res.status(500).json({error: 'Internal server error'})
    }
}

module.exports.fetchUserFollowing = async(req, res)=>{
    try {
        
        const {followerId} = req.params

        const pool = await mssql.connect(sqlConfig)
        const listOfFollowing = await pool
        .request()
        .input('follower_id', followerId)
        .execute('fetchAllUserFollowingProc')

        return res.status(200).json({message: 'Fetch successful', following: listOfFollowing.recordset})


    } catch (error) {
        return res.status(500).json({error: 'Internal server error'})
    }
}