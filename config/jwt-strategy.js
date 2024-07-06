const passport = require("passport");
const { ExtractJwt } = require("passport-jwt");
const User = require("../models/User");
const JwtStrategy = require('passport-jwt').Strategy;


const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
opts.secretOrKey = process.env.JWT_SECRET;

passport.use(new JwtStrategy(opts, async (jwt_payload, done)=>{
    const user = await User.findById(jwt_payload.id)
    if(user){
        return done(null, user);
    }
    return done(null, false);
}))