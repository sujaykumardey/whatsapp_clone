const express = require('express');
const router = require('express').Router();
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Users, Chat } = require('../modals/modals');
const {client}=require('../server')
const { jwtkey } = require('../config/key');
const { validateUser,validateUserSign} = require('../modals/validate');

client.on('connection', (socket) => {
  console.log('client is connected');
  socket.on('chats', async (data) => {    
    console.log('hello',data)
    const users = await Users.findOne({ _id: data.id });
    if (!users) return res.send("user doesn't exsit");
    const user = new Chat(
      _.pick(data, ['phone', 'sender', 'text', 'timestamp'])
    );
    users.chats.push(user);
    await users.save();
    client.emit('userchat', users.chats);       
    });
  })
  
    router.post('/signin',async (req, res) => {
      try {
        const { error } = validateUserSign(req.body);
        if (error) return res.json({success:false,username:'Invalid user input'});
        const user = await Users.findOne({ phone: req.body.phone });
        if (!user) return res.json({success:false,username:"User Doesn't Exist"});
      const validpassword = bcrypt.compare(req.body.password, user.password);
      if (!validpassword) return res.json({success:false,username:"User password is incorrect"});
      const token = jwt.sign({ _id: user._id }, jwtkey);
      user.token=token;
      res.json(_.pick(user, ['_id', 'username', 'phone','token']))

      } catch (error) {
        console.log(error)
        res.status(500).send('something failed');
      }
    });

    router.post('/registration',async (req, res) => {
      try {
        const { error } = validateUser(req.body);
        if (error) return res.json({success:true,username:'Invalid user input'});
        const user = await Users.findOne({ username:req.body.username,phone: req.body.phone });
        if (user)
          return res.json({success:true,username:user.username+' already register Please Signin'});
        const login = new Users(
          _.pick(req.body, ['username','phone','password'])
        );
        const salt = await bcrypt.genSalt(5);
        const hashed = await bcrypt.hash(login.password, salt);
        login.password = hashed;
        const users = await login.save();
        return res.json({success:true,username:users.username+' successfully register please Signin'});
      } catch (error) {
        console.log(error)
        res.status(500).send('something failed');
      }
    });




  
    router.get('/chat/:id', async (req, res) => {
      try {
        console.log('hello')
        const user = await Users.findOne({ _id: req.params.id });
        return res.json(user.chats);
      } catch (errror) {
        res.status(500).send('something failed');
      }
    });
  
    
    router.get('/users', () => {
      Users.find()
        .then((obj) => {
          sendsUserData(obj);
        })
        .catch((error) => {
          console.log(error);
        });
   
        
      });
      sendsUserData=(obj)=>{
                client.emit('userdata', obj);
              }
      


  module.exports=router;

 