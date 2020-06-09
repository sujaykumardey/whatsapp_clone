const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const socketio = require('socket.io');
const { url } = require('./config/key');
const app = express();
const server = http.createServer(app);
const client = socketio(server);
const _=require('lodash')
const { Users, Chat } = require('./modals/modals');

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
  // socket.emit('output',count)
  // socket.emit('message', 'welcome to chat room');
  // socket.broadcast.emit('message', 'new user just joined');

  // socket.on('disconnect', () => {
  //   client.emit('message', 'user has been left');
  // });

  // socket.on('updateData', () => {
  //   count++;
  //   client.emit('output', count);
  // });
  socket.on('user', (data) => {
    const user = new Users(_.pick(data, ['username', 'country', 'phone']))
    user.chats=[];
    
    user.save();
    client.emit('sujay',user)
    Users.find().then((obj) => {
          
          client.emit('users data', obj);
          
        });
       
});
});