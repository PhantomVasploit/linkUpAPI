const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const express = require('express')
const bodyParser = require('body-parser')
const swaggerUI = require('swagger-ui-express')
require('dotenv').config()


const app = express()
const port = process.env.PORT
const routes = require('./routes/routes')
const logger = require('./config/winston.config')
const {errorLogger} = require('./middleware/errorLogger')
const swaggerDocument = require('./config/swagger.config.json')

app.use(cors())
app.use(helmet())
app.use(morgan('tiny'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.use('/api/link-up/v1', routes)
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))
app.use(errorLogger)


// hanlde exceptions and rejections
process.on('uncaughtException', (error)=>{
    logger.error('Uncaught Exception:', error)
})

process.on('unhandledRejection', (reason, promise)=>{
    logger.error('Unhandled Rejection:', reason)
})

const server = app.listen(port, ()=>{
    console.log(`LinkUp API server running on: http://127.0.0.1:${port}`);
})

module.exports = server