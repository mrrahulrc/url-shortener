const path = require('path')
require('dotenv').config({path : path.join(__dirname + "../")})
const bcrypt = require("bcryptjs");
const dbconnection = require('../dbconnection/dbconnection')
const jwt = require('jsonwebtoken');

const CredentialsTable = "user"
const cookieName = 'shorturl'

module.exports.handleregister = (req,res) => {
    res.render('register', {
        success : false
    });
}

module.exports.handlelogin = (req,res) => {
    res.render('login', {
        success : false
    })
}

module.exports.handleshorturl = (req,res) => {
    res.render('shorturl');
}

module.exports.handlepostregister = (req,res) => {
    const { name, email, password } = req.body
    email = email.toLowerCase()

    if(!(name &&email && password)){
        return res.status(400).render('register', {
            success : true,
            message : "Please fill all the fields."
        })
    }
    
    dbconnection.query(`SELECT email, password FROM ${CredentialsTable} WHERE email = ?`,[email], async (err, data) => {
        if( data.length > 0 ){
            return res.status(401).render('register', {
                success: true,
                message : "User already registered."
            })
        }

        let hashedpass = await bcrypt.hash(password, 10)
        
        dbconnection.query(`INSERT INTO ${CredentialsTable} SET ?`, { displayname : name, email, password : hashedpass },(err, data, fields) => {
            if(err){
                throw err
            }
            res.render('register', {
                success : true,
                message : "User Registered Successfully."
            })
        })
    })
}


module.exports.handlepostlogin = async (req,res) => {
    const {email, password} = req.body
    email = email.toLowerCase()

    if(!(email && password)){
        return res.status(400).render('login', {
            success: true,
            message : "Please Enter The Credentials."
        })
    }

    dbconnection.query(`SELECT password FROM ${CredentialsTable} WHERE email = ?`, [email] ,async (err, data) =>{
        if(err){
            throw err
        }
        
        if(data.length > 0 && (await bcrypt.compare(password, data[0]["password"])) ){
            const token = jwt.sign({email}, process.env.JWTTOKEN, {
                expiresIn : 24 * 60 * 60 
            })

            res.status(200).cookie(cookieName, token, {
                expiresIn : 24 * 60 * 60 * 1000,
                httpOnly : true
            })
            res.redirect('/shorturl');
        }
        else{
            res.status(400)
            res.render('login', {
                success : true,
                message : "Email or Password is not Correct."
            })
        }
    })
}


module.exports.isUserLoggedin = (req,res, next) => {
    const token = req.cookies[cookieName];

    if(token){
        jwt.verify(token, process.env.JWTTOKEN, (err,decodetoken ) => {
            if(err){
                res.status(400).redirect('/login')
            }
            else{
                next()
            }
        })
    }
    else{
        res.status(400).redirect('/login')
    }
}