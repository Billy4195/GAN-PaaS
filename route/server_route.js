var bodyParser = require('body-parser');
var session = require('express-session');
var formidable = require('formidable');
var fs = require('fs');
var rimraf = require('rimraf');
var exec = require('child_process').exec;
var Passport = require('passport');
var Strategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var secret = require('../secret');
var SaltRound = 10;

function find_projects(User, current_project){
    const user_folder = './images/' + User;
    var file_array = [];
    if(current_project !== 'empty'){
        file_array.push(current_project);
    }
    fs.readdirSync(user_folder).forEach(file => {
        if(file !== '.DS_Store' && file !== current_project){
            file_array.push(file);
        }
    })
    return file_array;
}

function find_images(User, projects){
    const user_folder = './images/' + User + '/' + projects + '/train';
    var file_array = [];
    fs.readdirSync(user_folder).forEach(file => {
        if(file !== '.DS_Store'){
            file_array.push(file);
        }
    })
    return file_array;
}

function connectToMongoDB(){
    mongoose.connect('mongodb://localhost/objectDetection', { useMongoClient:true });
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
       console.log("mongoDB connected!");
    });
    return mongoose;
}

function getOrCreateUserModel(){
    var User = mongoose.model('User',{
      email: String,
      password: String,
      first_name: String,
      last_name: String
    });
    return User;
}

function setupPassportAuth(User){
    Passport.use(new Strategy({
      usernameField: 'email',
      passwordField: 'password'
      },
      function(email,password,done){
        User.findOne({email : email}).exec(function(err,user){
          if(err) return done(null,false);

          bcrypt.compare(password,user.password,function(err,res){
            if(res) return done(null,user);
            else return done(null,false);
          });
        })
      }
    ));
}

function checkAuthentication(req,res,next){
    if(req.session && req.session.user){
        next();
    }else{
        res.redirect("/login");
    }
}

module.exports = function(app){
    var mongoose = connectToMongoDB();
    var User = getOrCreateUserModel();

    setupPassportAuth(User);
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json())
    app.use(Passport.initialize());
    app.use(session({
      secret: secret,
      resave: false,
      saveUninitialized: true,
    }));

    app.post('/signup',function(req, res){
      var hashed_passwd = bcrypt.hashSync(req.body.password,SaltRound);
      User.create({ email: req.body.email,
        password: hashed_passwd,
        first_name: req.body.first_name,
        last_name: req.body.last_name
      },function(err,user){
        if(err){
          return err;
        }
      })
      if(!req.body){
         return res.returnStatus(400);
      }
      else{
         var dir = './images/' + req.body.email;
        
         if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
         }
      }
      res.redirect("/login");
    });
    
    //login page
    app.get('/login', function(req, res){
        res.render('login');
    });

    //login request
    app.post('/login', Passport.authenticate('local', {session:false}),
      function(req, res){
        req.session.user = req.user;
        return res.redirect("/upload")
    });
    
    //upload
    app.post('/upload', checkAuthentication, function(req, res, next){
        var form = new formidable.IncomingForm();
        form.multiples = true;
        form.parse(req);
        form.on('fileBegin', function (name, file){
            file.path = './images/' + req.session.user.email + '/' + req.session.project + '/train/' + file.name;
        });
        form.on('file', function (name, file){
        });
        res.send('success');
    });
    
    app.get('/upload', checkAuthentication, function(req, res){
        if(req.session.project === undefined){
            req.session.project = 'empty';
        }
        res.render('uploader',{first_name: req.session.user.first_name, file_array: find_projects(req.session.user.email, req.session.project)});
    });

    //handle train get and post

    app.get('/train', checkAuthentication, function(req, res){
        if(req.session.status !== true){
            res.render('start_train',{first_name: req.session.user.first_name, file_array: find_projects(req.session.user.email, req.session.project)});            
        }
        else{
            res.render('stop_train',{first_name: req.session.user.first_name, file_array: find_projects(req.session.user.email, req.session.project)});            
        }
    });

    app.post('/start_train', checkAuthentication, function(req, res){
        req.session.status = true;
        req.session.train_ps = null;
        var train_command = "python ./pix2pix-tensorflow/tools/dockrun.py python ./pix2pix-tensorflow/pix2pix.py \
        --mode train \
        --output_dir images/" + req.session.user.email + "/" + req.session.project + "/" + req.session.project + "_train \
        --max_epochs 200 \
        --input_dir images/" + req.session.user.email + "/" + req.session.project + "/train/ \
        --which_direction BtoA";
        console.log(train_command);
        var train = exec(train_command, function (error, stdout, stderr) {
            if (error !== null) {
              console.log('exec error: ' + error);
            }
            
        });
        req.session.train_ps = train
        res.redirect('/train');
    });


///////////////////////////////////////////////////////todo//////////////////////////////////////////////
    app.post('/stop_train', checkAuthentication, function(req, res){
        if(req.session.status && req.session.train_ps){
            req.session.train_ps.kill();
            // send SIGTERM to child process
            // TODO: Setting a timer to check the child process actually been killed, or send SIGKILL to that process. 
        }
        req.session.status = false;
        res.redirect('/train');
    });
////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    app.get('/evaluation', checkAuthentication, function(req,res){
        res.render('evaluation',{first_name: req.session.user.first_name, file_array: find_projects(req.session.user.email, req.session.project)});
    });

    app.post('/evaluation', checkAuthentication, function(req, res, next){
        var form = new formidable.IncomingForm();
        form.multiples = true;
        form.parse(req);
        form.on('fileBegin', function (name, file){
            file.path = './images/' + req.session.user.email + '/' + req.session.project + '/test/' + file.name;
        });
        form.on('file', function (name, file){
        });
        var test_command = "python ./pix2pix-tensorflow/tools/dockrun.py python ./pix2pix-tensorflow/pix2pix.py \
        --mode test \
        --output_dir images/" + req.session.user.email + "/" + req.session.project + "/" + req.session.project + "_test \
        --max_epochs 200 \
        --input_dir images/" + req.session.user.email + "/" + req.session.project + "/test/ \
        --checkpoint images/" + req.session.user.email + "/" + req.session.project + "/" + req.session.project + "_train";
        console.log(test_command);
        var train = exec(test_command, function (error, stdout, stderr) {
            if (error !== null) {
              console.log('exec error: ' + error);
            }
            
        });
        res.send('success');
    });

    //index
    app.get('/', checkAuthentication, function(req, res) {
        res.redirect('/upload');
    });

    app.get('/logout', function(req,res,next){
        if(req.session){
            req.session.destroy(function(err){
              if(err) return next(err);
              else return res.redirect('/');
            })
        }
    });

    app.post('/get_image', checkAuthentication ,function(req, res){
        req.session.project = req.body.name;
        console.log(req.session.user.email);
        var image_list = find_images(req.session.user.email, req.body.name);
        image_list.push(req.session.user.email);
        console.log(image_list);
        res.send(image_list);
    });

    app.get('/addProject', checkAuthentication, function(req,res){
        res.render('addProject',{first_name: req.session.user.first_name, file_array: find_projects(req.session.user.email, req.session.project)});
    });
    app.post('/addProject', checkAuthentication, function(req,res){
        var newDirName = './images/' + req.session.user.email + '/' + req.body.newProjectName;
        if(!fs.existsSync(newDirName)){
          fs.mkdirSync(newDirName)
          fs.mkdirSync(newDirName + '/train');
          fs.mkdirSync(newDireName + '/test');
        }
        res.redirect("/upload");
    });
    app.get('/deleteProject', checkAuthentication, function(req,res){
        DirName = './images/' + req.session.user.email + '/' + req.session.project;
        req.session.project = find_projects(req.session.user.email, req.session.project)[1];
        rimraf(DirName, function () { console.log('done'); });
        res.redirect('/upload');
    });
};
