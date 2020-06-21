const express = require('express');
const router = require('express').Router();
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
const { Users, Chat } = require('../modals/modals');
const { client } = require('../server');
const { jwtkey } = require('../config/key');
const { validateUser, validateUserSign } = require('../modals/validate');
const multer = require('multer');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './upload/');
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  },
});

var upload = multer({ storage: storage });

client.on('connection', (socket) => {
  console.log('client is connected');
  socket.on('chats', async (data) => {
    try{
    const users = await Users.findOne({ _id: data.id });
    if (!users) return res.send("user doesn't exsit");
    const user = new Chat(
      _.pick(data, ['phone', 'sender', 'text', 'timestamp'])
    );
    users.chats.push(user);
    await users.save();
    client.emit('userchat', users.chats);
    }catch(error){
      
      res.status(500).send('something failed')
    }
  });
});

router.post('/signin', async (req, res) => {
  try {
  //  const data=req.body;
  //   const { error } = validateUserSign(data);
  //   if (error) return res.json(error);
    const user = await Users.findOne({ phone: req.body.phone });
    if (!user)
      return res.json({ success: false, username: "User Doesn't Exist" });
    const validpassword = bcrypt.compare(req.body.password, user.password);
    if (!validpassword)
      return res.json({
        success: false,
        username: 'User password is incorrect',
      });
    const token = jwt.sign({ _id: user._id }, jwtkey);
    user.token = token;
    return res.json(_.pick(user, ['_id', 'username', 'phone', 'token']));
  
  } catch (error) {
    res.status(500).send('something failed');
  }
});

router.post('/registration', async (req, res) => {
  try {
    const { error } = validateUser(req.body);
    if (error)
      return res.json({ success: true, username: 'Invalid user input' });
    const user = await Users.findOne({
      username: req.body.username,
      phone: req.body.phone,
    });
    if (user)
      return res.json({
        success: true,
        username: user.username + ' already register Please Signin',
      });
    const login = new Users(
      _.pick(req.body, ['username', 'phone', 'password'])
    );
    const salt = await bcrypt.genSalt(5);
    const hashed = await bcrypt.hash(login.password, salt);
    login.password = hashed;
    const users = await login.save();
    return res.json({
      success: true,
      username: users.username + ' successfully register please Signin',
    });
  } catch (error) {
    res.status(500).send('something failed');
  }
});

router.get('/chat/:id', auth, async (req, res) => {
  try {
    const user = await Users.findOne({ _id: req.params.id });
    return res.json(user.chats);
  } catch (errror) {
    res.status(500).send('something failed');
  }
});

router.get('/users', auth, (req, res) => {
  Users.find()
    .then((obj) => {
      sendsUserData(obj);
    })
    .catch((error) => {
      console.log(error);
    });
});

router.post(
  '/fileupload',
  upload.single('uploadImage'),
  async (req, res, next) => {
    try {
      const users = await Users.findOne({ _id: req.body.id });
      if (!users) return res.send("user doesn't exsit");
      const user = new Chat(_.pick(req.body, ['phone', 'sender', 'timestamp']));
      user.url = `http://localhost:${process.env.PORT}/` + req.file.path;
      
      users.chats.push(user);
      await users.save();
      client.emit('userchat', users.chats);
    } catch (errror) {
      res.status(500).send('something failed');
    }
  }
);

sendsUserData = (obj) => {
  client.emit('userdata', obj);
};

module.exports = router;
