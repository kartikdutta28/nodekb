//Add node module packages
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser=require('body-parser');
const expressValidator=require('express-validator');
const flash=require('express-flash');
const session = require('express-session');
const config = require('./config/database');
const passport = require('passport');

//Connect mongo database usigng mongoose
mongoose.connect(config.database);
let db=mongoose.connection;

//Check connection
db.once('open',function(){
    console.log('Connected to mongodb');
})

//Check for db erros
db.on('error',function(err){
    console.log(err);
})

//Init App
const app=express();

//Bring in models
let Article=require('./models/article');


//Load view engine
app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug');

//Parse application
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//Set public folder for static files
app.use(express.static(path.join(__dirname,'public')));

//Express session middle ware
app.use(session({
  secret:'keyboard cat',
  resave: true,
  saveUninitialized: true,
}));

//Express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//Express Validator middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

//passport config
require('./config/passport')(passport);
//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//
app.get('*',function(req,res,next){
  res.locals.user = req.user || null;
  next();
});
//Route Home
app.get('/',function(req,res){
    Article.find({},function(err,articles){
        if(err){
            console.log(err);

        }
        else{
            res.render('index',{
                title:'Articles',
                articles:articles
            });
        }

    });
});

//Router flies
let articles=require('./routes/articles');
app.use('/articles',articles);
let users=require('./routes/users');
app.use('/users',users);

app.listen(5000,function(){
    console.log("Server started at port 5000");
});
