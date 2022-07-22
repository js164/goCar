const passport = require('passport')
var jwt = require('jsonwebtoken');

module.exports = {
    jwtauth: function (req, res, next) {
        passport.authenticate('jwt', { session: false }
            , (error, user, info) => {
                if (user === false && info) {
                    if (info.message === 'No auth token') {
                        // Just unauthorized - nothing serious, so continue normally
                        info = JSON.parse(JSON.stringify(info));
                        info['status'] = 500
                        res.send(500, info);
                    }
                    else if (info.message === 'jwt expired') {
                        info = JSON.parse(JSON.stringify(info));
                        info['status'] = 401
                        res.send(401, info);
                    }
                    else if (info.message === 'invalid token') {
                        info = JSON.parse(JSON.stringify(info));
                        info['status'] = 401
                        res.send(401, info);
                    } else {
                        info = JSON.parse(JSON.stringify(info));
                        info['status'] = 401
                        res.send(401, info);
                    }
                }
                if (error) {
                    res.send(error)
                }
                try{
                    if (user) {
                        let userverified=jwt.verify(req.headers.authorization.split(" ")[1],process.env.JWTtoken);
                        req.user = userverified;
                        return next();
                    }
                }catch(err){
                    console.log(err);
                    res.send(err)
                }
            }
        )(req, res, next);
    },
    adminAuth: function (req, res, next) {
                if (req.user && req.user.isAdmin) {
                    return next();
                }
                res.send('400', { status: 400, message: "Not Valid Admin" })

    }
}