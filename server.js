const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;
const { url } = require('./config/key');




const port = process.env.PORT || 3000;

mongo.connect(process.env.MONGODB_URI || url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
},(error,db)=>{
    if(error) throw error;
    console.log('db is connected....')
});

  