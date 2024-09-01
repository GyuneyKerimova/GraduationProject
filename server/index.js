require('dotenv').config();
const express = require('express')
const sequelize = require('./db')
const models = require('./models/models')
const router = require('./routes/index')
const cors = require('cors')
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload')
const errorHandler = require('./middleware/ErrorHandlingMiddleware')
const path = require('path')

const PORT = process.env.PORT || 9000

const app = express()

// ОСНОВНАЯ
app.use(express.json())
app.use(cookieParser());
app.use(cors(
    {
        credentials: true,
        origin: process.env.CLIENT_URL
    }
))
app.use(express.static(path.resolve(__dirname, 'static')))
app.use(fileUpload({}))
app.use('/api', router)

// Обработка ошибок - последний middleware
app.use(errorHandler)

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
        app.listen(PORT, () => {console.log(`Server started: http://localhost:${PORT}`)})
    } catch (err) {
        console.error(err)
    }
}

start()

