const mongoose = require('mongoose');


const chatdetail=new mongoose.Schema({
    phone:String,
    sender:String,  
    text:String,  
    timestamp:String,
    url:String,
})

const Chat = mongoose.model('Chat', chatdetail);
const user = new mongoose.Schema({
  username: {
    type: String,    
   },
  phone: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 10,
    unique:true
  },
  password:{
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024,
  },
chats:[chatdetail],

});

const Users = mongoose.model('users', user);

exports.Users= Users;
exports.Chat= Chat;
