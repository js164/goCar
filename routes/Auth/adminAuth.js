const express = require('express')
const route = express.Router()
const passport = require('passport')
const goCarUser = require('../../models/Auth/user')
const goCarAdminUser = require('../../models/Auth/adminUser')
const { hashSync } = require('bcrypt')
const LocalStrategy = require('passport-local').Strategy;
const { compareSync } = require('bcrypt');
var jwt = require('jsonwebtoken');
require('../../passport')
const jwtauth=require('../../AuthMiddlewere')


route.post('/signup', function (req, res) {
    const usermodel = new goCarAdminUser({
        username: req.body.username,
        password: hashSync(req.body.password, 10)
    })
    usermodel.save().then((user) => {
        res.send({
            success: true,
            message: "New User Successfully Created!",
            user: {
                id: user._id,
                username: user.username,
                isAdmin:true
            }
        })
    }).catch(err => {
        res.send({
            success: false,
            message: "Something wents wrong!",
            error: err
        })
    })


})

route.post('/login', (req, res) => {
    goCarAdminUser.findOne({ username: req.body.username }).then((user, err) => {

        if (err) {
            return res.send({
                success: false,
                message: "Something wents wrong!",
                error: err
            })
        }
        if (!user) {
            return res.send({
                success: false,
                message: "no user found!"
            })
        } else {
            if (!compareSync(req.body.password, user.password)) {
                return res.send({
                    success: false,
                    message: "password not match!"
                })
            }
            let payload = {
                username: user.username,
                _id: user._id,
                isAdmin:true
            }

            const access_token = jwt.sign(payload, process.env.JWTtoken, { expiresIn: "3m" });
            const refresh_token = jwt.sign(payload, process.env.JWTRefreshToken, { expiresIn: "30d" });

            return res.send({
                success: true,
                message: "your are Successfully Logged In!",
                user: {
                    username: user.username,
                    access_token: access_token,
                    refresh_token: refresh_token,
                    isAdmin:true
                }
            })

        }
    })
});

route.post('/refresh', function (req, res) {
    if (!req.body["refresh_token"]) {
        res.send(401, "refresh token not available")
    } else {
        jwt.verify(req.body['refresh_token'], process.env.JWTRefreshToken, function (err, data) {
            if (err) {
                res.send({
                    success: false,
                    message: "Invalid refresh token",
                    status: 401,
                    error: err.message
                })
            }
            if (data) {
                let payload = {
                    username: data.username,
                    _id: data._id,
                    isAdmin:true
                }

                const access_token = jwt.sign(payload, process.env.JWTtoken, { expiresIn: "3m" });
                
                return res.send({
                    success: true,
                    user: {
                        username: data.username,
                        access_token: access_token,
                        isAdmin:true
                    }
                })
            }
        })

    }

})


route.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/')
})

module.exports = route;