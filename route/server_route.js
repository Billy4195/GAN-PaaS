var bodyParser = require('body-parser');
var formidable = require('formidable');
var fs = require('fs');
var exec = require('child_process').exec;
var Passport = require('passport');
var Strategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var SaltRound = 10;


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

module.exports = function(app){
    var mongoose = connectToMongoDB();
    var User = getOrCreateUserModel();

    setupPassportAuth(User);
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json())
    app.use(Passport.initialize());

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
      res.redirect("/login");
    });
    
    //login page
    app.get('/login', function(req, res){
        res.render('login');
    });

    //login request
    app.post('/login', Passport.authenticate('local', {session:false}),
      function(req, res){
        res.redirect("/upload")
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
      res.redirect("/login")
    });
};
