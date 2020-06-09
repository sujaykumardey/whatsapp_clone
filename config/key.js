require('dotenv').config();

const mongoURI =`mongodb+srv://sujaydey:${process.env.password}@cluster0-lcy2m.mongodb.net/chatappcollection?retryWrites=true&w=majority`;
exports.url = mongoURI;

