const express = require('express')
const route = express.Router()
const passport = require('passport')
const goCarUser = require('../../models/Auth/user')
const { hashSync , compareSync} = require('bcrypt')
const LocalStrategy = require('passport-local').Strategy;
var jwt = require('jsonwebtoken');
require('../../passport')
const {jwtauth}=require('../../AuthMiddlewere')

route.get('/profile',jwtauth, function (req, res, next) {
    if (!res.headersSent) {
        res.send("welcome")
    }

});

route.post('/signup', function (req, res) {
    const usermodel = new goCarUser({
        username: req.body.username,
        password: hashSync(req.body.password, 10)
    })
    usermodel.save().then((user) => {

        let payload = {
            username: user.username,
            _id: user._id
        }

        const access_token = jwt.sign(payload, process.env.JWTtoken, { expiresIn: "3m" });
        const refresh_token = jwt.sign(payload, process.env.JWTRefreshToken, { expiresIn: "30d" });
        res.send({
            success: true,
            message: "New User Successfully Created!",
            user: {
                username: user.username,
                access_token: access_token,
                refresh_token: refresh_token
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
    goCarUser.findOne({ username: req.body.username }).then((user, err) => {
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
                _id: user._id
            }

            const access_token = jwt.sign(payload, process.env.JWTtoken, { expiresIn: "3m" });
            const refresh_token = jwt.sign(payload, process.env.JWTRefreshToken, { expiresIn: "30d" });
            return res.send({
                success: true,
                message: "your are Successfully Logged In!",
                user: {
                    username: user.username,
                    access_token: access_token,
                    refresh_token: refresh_token
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
                    _id: data._id
                }

                const access_token = jwt.sign(payload, process.env.JWTtoken, { expiresIn: "3m" });
                
                return res.send({
                    success: true,
                    user: {
                        username: data.username,
                        access_token: access_token
                    }
                })
            }
        })

    }

})



route.get('/google',
    passport.authenticate('google', { scope: ['profile'] })
);

route.get('/google/callback',
    passport.authenticate('google', { 
        failureRedirect: process.env.CLIENT_URL+ '/login' }),
        // successRedirect: process.env.CLIENT_URL+ '/success'}));
        function(req,res){

            let payload = {
                username: req.user.displayName,
                _id: req.user._id,
                isAdmin:false
            }

            const access_token = jwt.sign(payload, process.env.JWTtoken, { expiresIn: "3m" });
            const refresh_token = jwt.sign(payload, process.env.JWTRefreshToken, { expiresIn: "30d" });

            // window.location.replace(process.env.CLIENT_URL+ '/success',res)
            res.redirect(process.env.CLIENT_URL+ '/success?username='+req.user.displayName+
            '&access_token='+access_token+
            '&refresh_token='+refresh_token)
        });

route.get('/logout',jwtauth, (req, res) => {
    req.logout(function(err) {
        if (err) { 
          return next(err); 
          }
        res.send(200,{success:true})
      });
})

module.exports = route;