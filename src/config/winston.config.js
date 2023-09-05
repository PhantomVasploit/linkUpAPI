const winston = require('winston')

const logger = winston.createLogger({
    level: 'verbose',
    format: winston.format.json(),
    defaultMeta: {service: 'LinkUp API server'},
    transports: [
        new winston.transports.File({filename: 'error.log',level: 'error'}),
        new winston.transports.File({filename: 'combined.log'})
    ],
    exceptionHandlers: [
        new winston.transports.File({filename: 'exception.log'})
    ],
    rejectionHandlers: [
        new winston.transports.File({filename: 'rejections.log'})
    ]
})