const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
exports.client = socketio(server);
const bodyParser = require('body-parser');
const { url } = require('./config/key');


app.use('/upload',express.static('upload'))
app.use(bodyParser.json());
app.use(cors());

const port = process.env.PORT || 4000;

server.listen(port, () => {
  console.log(`server is running on the port ${port}`);
});

const routers = require('./routes/api');

mongoose.connect(process.env.MONGODB_URI || url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

mongoose.connection.on('connected', () => {
  console.log('mongoose is connect..');
});
 
app
  .get('/', () => {
    res.send('Welcome you to whatsapp clone');
  });
app.use('/api', routers);

  
    