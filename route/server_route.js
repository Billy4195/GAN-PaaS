var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var formidable = require('formidable');
var fs = require('fs');
var exec = require('child_process').exec;


module.exports = function(app){
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json())
    
    //login
    app.get('/login', function(req, res){
        res.render('login');
    });

    app.post('/login', function(req, res){
        console.log(req.body);
        var email = req.body.email,
            password = req.body.password;
        res.render('uploader',{email: email});
    });
    
    
    //upload
    app.post('/upload', function(req, res, next){
        var form = new formidable.IncomingForm();

        form.multiples = true;
        form.parse(req);
        form.on('fileBegin', function (name, file){
            file.path = __dirname + '/tmp/' + file.name;
        });
        form.on('file', function (name, file){
            console.log('Uploaded ' + file.name);
        });
        res.send('success');
    });
    
    app.get('/upload', function(req, res){
        res.render('uploader',{email: ''});
    });

    //handle train get and post

    app.get('/train',function(req, res){
        res.render('train',{email: ''});
    });

    app.post('/train',function(req, res){
        cp = exec("cp -r docker/ controllers/test_user", function (error, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);
            if (error !== null) {
              console.log('exec error: ' + error);
            }
            docker = exec("docker run -i -v ~/Desktop/國網server/controllers/test_user:/docker object_detection bash /docker/run.sh", function (error, stdout, stderr) {
                console.log(stdout);
                console.log(stderr);
                if (error !== null) {
                  console.log('exec error: ' + error);
                }
            });
        });
        res.render('start_training');
    });
    
    //index

    app.get('/', function(req, res) {
        res.render('login');
    });

};