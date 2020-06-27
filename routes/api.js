const express = require('express');
const router = require('express').Router();
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
const { Users, Chat } = require('../modals/modals');
const { client } = require('../server');
const { jwtkey } = require('../config/key');
const { validateUser, validateUserSign } = require('../modals/validate');
const multer = require('multer');
const config = require('../config/key');

aws.config.update(config.s3cred);
const s3 = new aws.S3({});

const uploads3 = multer({
  storage: multerS3({
    s3: s3,
    acl: 'public-read',
    bucket: 'whatsapp-clone-project',
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, Date.now().toString() + file.originalname);
    },
  }),
});

// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, './upload/');
//   },
//   filename: function (req, file, cb) {
//     cb(null, new Date().toISOString() + file.originalname);
//   },
// });

// var upload = multer({ storage: storage });

client.on('connection', (socket) => {
  console.log('client is connected');
  socket.on('chats', async (data) => {
    const users = await Users.findOne({ _id: data.id });
    if (!users) return res.send("user doesn't exsit");
    const user = new Chat(
      _.pick(data, ['phone', 'sender', 'text', 'timestamp'])
    );
    users.chats.push(user);
    await users.save();
    client.emit('userchat', users.chats);
  });
});

router.post('/signin', async (req, res) => {
  try {
    const { error } = validateUserSign(req.body);
    if (error) return res.status(400).send('invalid user');
    const user = await Users.findOne({ phone: req.body.phone });
    if (!user)
      return res.json({ success: false, username: "User Doesn't Exist" });
    const validpassword = bcrypt.compare(req.body.password, user.password);
    if (!validpassword) return res.status(400).send('invalid password');
    const token = jwt.sign({ _id: user._id }, jwtkey);
    user.token = token;
    res.json(_.pick(user, ['_id', 'username', 'phone', 'token', 'url']));
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

// router.post(
//   '/fileupload',
//   upload.single('uploadImage'),
//   async (req, res, next) => {
//     try {
//       console.log(req.file, 'file upload');
//       const users = await Users.findOne({ _id: req.body.id });
//       if (!users) return res.send("user doesn't exsit");
//       const user = new Chat(_.pick(req.body, ['phone', 'sender', 'timestamp']));
//       user.url = 'http://localhost:4000/' + req.file.path;
//       console.log(user);
//       users.chats.push(user);
//       await users.save();
//       client.emit('userchat', users.chats);
//     } catch (errror) {
//       res.status(500).send('something failed');
//     }
//   }
// );

router.post(
  '/fileupload',
  uploads3.single('uploadImage'),
  async (req, res, next) => {
    try {
      const users = await Users.findOne({ _id: req.body.id });
      if (!users) return res.send("user doesn't exsit");
      const user = new Chat(_.pick(req.body, ['phone', 'sender', 'timestamp']));
      user.url = `${req.file.location}`;
      users.chats.push(user);
      await users.save();
      client.emit('userchat', users.chats);
    } catch (error) {
      console.log(error);
      res.status(500).send('something failed');
    }
  }
);

router.post(
  '/imageupload',
  uploads3.single('uploadImage'),
  async (req, res, next) => {
    try {
      const users = await Users.findOne({ _id: req.body.id });
      if (!users) return res.send("user doesn't exsit");
      users.url = `${req.file.location}`;

      await users.save();
      client.emit(
        'profile',
        _.pick(users, ['_id', 'username', 'phone', 'url'])
      );
    } catch (error) {
      console.log(error);
      res.status(500).send('something failed');
    }
  }
);

sendsUserData = (obj) => {
  const users=obj.map(user=>{
    return _.pick(user, ['_id', 'username', 'phone', 'url'])
  })
  client.emit('userdata', users);
};

module.exports = router;
