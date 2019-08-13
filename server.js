var express = require("express");
var dotenv = require('dotenv');
var path = require('path');
var session = require('express-session');
var passport = require('passport');
var Auth0Strategy = require('passport-auth0');
var userInViews = require('./lib/middleware/userInViews');
var authRouter = require('./routes/auth');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');


var sess = {
    secret: 'Pineapple',
    cookie: {},
    resave: false,
    saveUninitialized: true
};


//bring in the models
var db = require("./models");

dotenv.config();

var app = express();
// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static("client"));

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

var routes = require('./routes');

app.use(routes);

if (app.get('env') === 'production') {
    sess.cookie.secure = true;
};

app.use(session(sess));

var strategy = new Auth0Strategy(
    {
        domain: process.env.AUTH0_DOMAIN,
        clientID: process.env.AUTH0_CLIENT_ID,
        clientSecret: process.env.AUTH0_CLIENT_SECRET,
        callbackURL: process.env.AUTH0_CALLBACK_URL || 'http://localhost:5000/callback'
    },
    function (accessToken, refreshToken, extraParams, profile, done) {
        return done(null, profile);
    }
);

passport.use(strategy);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

app.use(userInViews());
app.use('/', authRouter);
app.use('/', indexRouter);
app.use('/', usersRouter);

var PORT = process.env.PORT || 3000;
db.sequelize.sync().then(function() {
    app.listen(PORT, function() {
        console.log('App listening on PORT ' + PORT);
    });
});