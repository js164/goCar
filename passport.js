const LocalStrategy=require('passport-local').Strategy;
const { compareSync } = require('bcrypt');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const dotenv=require('dotenv').config({path: __dirname + '/.env' })
const goCarUser=require('./models/Auth/user')
var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
var opts = {}

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWTtoken;
passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    goCarUser.findOne({id: jwt_payload.sub}, function(err, user) {
        if (err) {
            return done(err, false);
        }
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
            // or you could create a new account
        }
    });
}));

module.exports = function (passport) {
    passport.use(new LocalStrategy(
        function (username, password, done) {
            goCarUser.findOne({ username: username }, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false);
                }
                if (!compareSync(password,user.password)) {
                    return done(null, false);
                }
                return done(null, user);
            });
        }
    ));

    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback"        
        },
        async (accessToken, refreshToken, profile, done)=> {
            var newUser={
                googleID:profile.id,
                displayName:profile.displayName,
                image:profile.photos[0].value
            }
            
            try{
                let user=await goCarUser.findOne({googleID:profile.id})
                if (user){
                    done(null,user)
                }else{
                    user=await goCarUser.create(newUser)
                    done(null,user)
                }
            } catch(err){
                console.log(err)
            }
        },
    )),

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    })
    passport.deserializeUser(function(id, done) {
        goCarUser.findById(id, function(err, user) {
          done(err, user);
        });
    });

}