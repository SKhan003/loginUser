var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/logindb');

var userSchema = mongoose.Schema({
    username:String,
    password:String,
    email:String,
    profileImage:{
        type:String,
        default:"default.png"   
    }
    
});
userSchema.plugin(passportLocalMongoose,{usernameField:'username'});
module.exports = mongoose.model('user',userSchema); 
