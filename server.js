const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const socketio = require('socket.io');
const { url } = require('./config/key');
const app = express();
const server = http.createServer(app);
const client = socketio(server);
const _ = require('lodash');
const bodyParser = require('body-parser');

const { Users, Chat } = require('./modals/modals');

app.use(bodyParser.json());
app.use(cors());

const port = process.env.PORT || 4000;

server.listen(port, () => {
  console.log(`server is running on the port ${port}`);
});

mongoose.connect(process.env.MONGODB_URI || url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

mongoose.connection.on('connected', () => {
  console.log('mongoose is connect..');
});

client.on('connection', (socket) => {
  console.log('client is connected');

  app.post('/api/signin', async (req, res) => {
    try {
      const user = await Users.findOne({ phone: req.body.phone });
      if (user)
        return res.json(_.pick(user, ['_id', 'username', 'country', 'phone']));
      const login = new Users(
        _.pick(req.body, ['username', 'country', 'phone'])
      );
      const users = await login.save();
      return res.json(_.pick(users, ['_id', 'username', 'country', 'phone']));
    } catch (errror) {
      res.status(500).send('something failed');
    }
  });

  app.get('/api/chat/:id', async (req, res) => {
    try {
      const user = await Users.findOne({ _id: req.params.id });
      console.log(user);
      return res.json(user.chats);
    } catch (errror) {
      res.status(500).send('something failed');
    }
  });

  socket.on('chats', async (data) => {
    const users = await Users.findOne({ _id: data.id });
    if (!users) return res.send("user doesn't exsit");
    const user = new Chat(
      _.pick(data, ['phone', 'sender', 'text', 'timestamp'])
    );
    users.chats.push(user);
    users.save();
    client.emit('userchat', users.chats);
  });
  app.get('/api/users', () => {
    Users.find().then((obj) => {
      client.emit('userdata', obj);
    });
  });
});
