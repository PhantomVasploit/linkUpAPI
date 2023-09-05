const logger = require('../config/winston.config')

module.exports.errorLogger = (err, req, res, next)=>{
    if(err){
        logger.error(err.message, err)
        return res.status(500).json({error: 'Internal server error'})
    }
    next()
}