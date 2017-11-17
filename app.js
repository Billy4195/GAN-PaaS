var express = require('express');
var server_route = require('./route/server_route');
var http = require('http');
//if using https
//var https = require('https');
//var ssl = require('./ssl/ssl_liscense')


//fire express
var app = express();

//set up template engine
app.set('view engine', 'ejs');

//static Files
app.use(express.static('./'));

//fire server_route
server_route(app);

/*
https.createServer(ssl.options, app).listen(3000,function(){
    console.log("https server start");
    console.log('listen to port 3000');
});
*/
http.createServer(app).listen(3000,function(){
    console.log("https server start");
    console.log('listen to port 3000');
});