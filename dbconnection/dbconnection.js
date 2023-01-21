const path = require('path')
const mysql = require('mysql')
require('dotenv').config({
    path : path.join(__dirname, '../.env')
})

const connection = mysql.createConnection({
    host : process.env.DATABASE_HOST,
    user : process.env.DATABASE_USER,
    password : process.env.DATABASE_PASSWORD,
    database : process.env.DATABASE
})

connection.connect((err) => {
    if(err){
        throw err
    }
})

module.exports = connection