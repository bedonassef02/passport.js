const passport = require("passport");
require("./google-strategy")
require("./jwt-strategy")
require("./local-strategy")
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => done(err, user));
});