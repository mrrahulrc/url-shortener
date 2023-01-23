const express = require('express')
const authcontroller = require('../controller/authcontroller')
const router = express.Router()

router.get('/', (req,res) => {
    res.render("index")
})

router.get('/register',authcontroller.handleregister)

router.get('/login',authcontroller.handlelogin)

router.get('/shorturl',authcontroller.isUserLoggedin ,  authcontroller.handleshorturl)

router.get('/user')

router.get('*', (req,res) => {
    res.send("404 Not Found!")
})

router.post('/register',authcontroller.handlepostregister)

router.post('/login', authcontroller.handlepostlogin)

router.post('/ShortUrl', authcontroller.isUserLoggedin,  authcontroller.handleShortUrl)

module.exports = router