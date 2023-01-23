const path = require('path')
const express = require('express')
const mysql = require('mysql')
const cookieparser = require('cookie-parser')
require('dotenv').config()
const {PORT} = process.env

const router = require('./routes/routers')

const app = express()

app.use(cookieparser())
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({extended : false}))
app.use(express.static(path.join(__dirname)))

app.use(router)

app.listen(PORT, () => {
    console.log(`Server Started on port: ${PORT}`)
})