const path = require('path')
require('dotenv').config({path : path.join(__dirname + "../")})
const bcrypt = require("bcryptjs");
const dbconnection = require('../dbconnection/dbconnection')
const jwt = require('jsonwebtoken');
const uniqid = require('uniqid')

const CredentialsTable = "user"
const ShortUrlTable = "urls"
const cookieName = 'shorturl'
const MaxUrlPerUser = 10
const HostUrl = process.env.HostUrl || `http://localhost:${process.env.PORT}`

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
    res.render('shorturl', {
        isWarning : false,
        success : false
    });
}

module.exports.handlepostregister = (req,res) => {
    var { name, email, password } = req.body
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
    var {email, password} = req.body
    email = email.toString().toLowerCase()

    if(!(email && password)){
        return res.status(400).render('login', {
            success: true,
            message : "Please Enter The Credentials."
        })
    }

    dbconnection.query(`SELECT id, password FROM ${CredentialsTable} WHERE email = ?`, [email] ,async (err, data) =>{
        if(err){
            throw err
        }
        
        if(data.length > 0 && (await bcrypt.compare(password, data[0]["password"])) ){
            var userid = data[0].id
            const token = jwt.sign({id: userid, email}, process.env.JWTTOKEN, {
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
                req.userid = decodetoken.id;
                next()
            }
        })
    }
    else{
        res.status(400).redirect('/login')
    }
}


module.exports.handleShortUrl = (req,res) => {

    const { userurl } = req.body
    var userid = req.userid

    dbconnection.query(`SELECT count(1) as userUrlsCount FROM ${ShortUrlTable} WHERE userid = ?`, [userid], (err, data) => {

        if(err){
            throw err
        }
        var userUrlsCount = parseInt(data[0].userUrlsCount)
        if( userUrlsCount > MaxUrlPerUser ){
            return res.render('shorturl', {
                success : false,
                isWarning : true,
                message : "You can not add more than 10 URLs."
            })
        }
        else{

            const urlshorttoken = uniqid()

            dbconnection.query(`SELECT count(1) as isExists from ${ShortUrlTable} WHERE url = ? AND userid = ?`, [userurl, userid], (err, data) => {
                if(err){
                    throw err
                }
                if(parseInt(data[0].isExists) > 0){
                    return res.render('shorturl', {
                        success : false,
                        isWarning : true,
                        message : "You can not Generate multiple links for Single URL."
                    }) 
                }
                else{

                    dbconnection.query(`INSERT INTO ${ShortUrlTable} SET ?`, { userid, shorturl: urlshorttoken, url : userurl }, (err, data) => {
                        if(err){
                            throw err
                        }
                        res.render('shorturl', {
                            success : true,
                            isWarning : false,
                            usershorturl : `${HostUrl}/${urlshorttoken}`
                        })          
                    })
                }
            })
        }
    })
}

module.exports.handleRedirectUrl = (req,res) => {
    const {urltoken} = req.params
    dbconnection.query(`SELECT url FROM ${ShortUrlTable} WHERE shorturl = ?`, [urltoken], (err, data) => {
        if(err){
            throw err
        }

        if(data.length === 0) {
            return res.render('notfound')
        }
        else{
            res.redirect(data[0].url)
        }
    })
}