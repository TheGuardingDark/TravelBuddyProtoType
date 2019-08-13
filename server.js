var express = require("express");
var dotenv = require('dotenv');
var path = require('path');

//bring in the models
var db = require("./models");

dotenv.load();

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

var PORT = process.env.PORT || 3000;
db.sequelize.sync().then(function() {
    app.listen(PORT, function() {
        console.log('App listening on PORT ' + PORT);
    });
});