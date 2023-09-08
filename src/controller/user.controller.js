const mssql = require('mssql')

const { sqlConfig } = require('../config/database.connection.config')
const { registrationSchema } = require('../utils/validators')


module.exports.fetchAllUsers = async(req, res)=>{
    try {
        const pool = await mssql.connect(sqlConfig)

        const users = await pool
        .request()
        .execute('findAllUsersProc')

        return res.status(200).json({message: 'Fetch successful', users: users.recordset})
    } catch (error) {
        return res.status(500).json({error: 'Internal server error'})
    }
}

module.exports.fetchUserById = async(req, res)=>{
    try {

        const {id} = req.params

        const pool = await mssql.connect(sqlConfig)
        const user = await pool
        .request()
        .input('id', id)
        .execute('findUserByIdProc')

        if(user.recordset.length <= 0){
            return res.status(404).json({error: 'User id is invalid'})
        }

        return res.status(200).json({message: 'Fetch successful', user: user.recordset[0]})

    } catch (error) {
        return res.status(500).json({error: 'Internal server error'})
    }
}

module.exports.updateUser = async(req, res)=>{
    try {

        if(!req.body){
            return res.status(400).json({error: 'Request body can not be empty'})
        }
        
        const { firstName, lastName, email, profilePicture } = req.body
        const {error} = registrationSchema.validate({ firstName, lastName, email, profilePicture })
        if(error){
            return res.status(422).json({error: error.message})
        }

        const {id} = req.params

        const pool = await mssql.connect(sqlConfig)
        const checkUserQuery = await pool
        .request()
        .input('id', id)
        .execute('findUserByIdProc')

        if(checkUserQuery.recordset.length <= 0){
            return res.status(404).json({error: 'User account not found'})
        }
        
        await pool
        .request()
        .input('id', id)
        .input('first_name', firstName)
        .input('last_name', lastName)
        .input('email', email)
        .input('avatar', profilePicture)
        .execute('updateUserProc')
        
        return res.status(200).json({message: 'Update successful'})

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({error: 'Internal server error'})
    }
}

module.exports.deleteUser = async(req, res)=>{
    try {
        
        const {id} = req.params

        const pool = await mssql.connect(sqlConfig)
        const checkUserQuery = await pool
        .request()
        .input('id', id)
        .execute('findUserByIdProc')

        if(checkUserQuery.recordset.length <= 0){
            return res.status(404).json({error: 'User account not found'})
        }

        await pool
        .request()
        .input('id', id)
        .execute("deleteUserProc")

        return res.status(200).json({message: 'User account deleted'})

    } catch (error) {
        return res.status(500).json({error: 'Internal server error'})
    }
}