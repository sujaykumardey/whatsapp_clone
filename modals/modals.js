const mongoose = require('mongoose');


const chatdetail=new mongoose.Schema({
    phone:String,
    sender:String,  
    text:String,  
    timestamp:String,
})

const Chat = mongoose.model('Chat', chatdetail);
const user = new mongoose.Schema({
  username: {
    type: String,
    
   },
  country: {
    type: String,
    },
  phone: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 10,
    unique:true
  },
chats:[chatdetail],

});

const Users = mongoose.model('users', user);

exports.Users= Users;
exports.Chat= Chat;
