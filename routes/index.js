var express = require('express');
var router = express.Router();
var userModel = require('./users');
const passport = require('passport');
const localStrategy = require('passport-local');
const multer = require('multer');
const path = require("path");

/* GET home page. */
passport.use(new localStrategy(userModel.authenticate()));
passport.use(userModel.createStrategy());


function fileFilter (req, file, cb) {
  if(file.mimetype==="image/png" || file.mimetype ==="image/jpg" || file.mimetype === "image/jpeg"){
    cb(null, true)                                            
  } 
  else{
    cb(new Error('I don\'t have a clue!'))
  }
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    var dt = new Date();
    var fn = Math.floor(Math.random()*10000000) + dt.getTime() + file.originalname;
    cb(null,fn)
  } 
})

const upload = multer({ storage: storage , fileFilter : fileFilter})

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/register', function(req, res) {
  res.send("hello");
});

router.get('/profile',function(req, res) {
  userModel.findOne({username:req.session.passport.user})
  .then(function(foundUser){
    res.render("profile",{user:foundUser});
  })
});

router.post('/uploads',isLoggedIn,upload.single('filename'),function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(loggedUser){
    loggedUser.profileImage = req.file.filename;
    loggedUser.save()
  })
  .then(()=>{
    res.redirect("back"); 
  })
});


router.get('/logout', function(req, res){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

router.post('/register',function(req,res,next){
  var newUser = new userModel({
    username:req.body.username,
    password:req.body.password,   
    email:req.body.email, 
    profileImage:req.body.profileImage  
  })
  userModel.register(newUser,req.body.password)
  .then(function(user){
    passport.authenticate('local')(req,res,function(){
        res.redirect('/profile');
    })
  })
})

router.post('/login',passport.authenticate('local',{
  successRedirect:'/profile',
  failureRedirect:'/'
}),function(req,res){});    

  


function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  else{
    res.redirect('/');
  }
}
module.exports = router;
