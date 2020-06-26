require('dotenv').config();

const mongoURI =`mongodb+srv://sujaydey:${process.env.password}@cluster0-lcy2m.mongodb.net/chatappcollection?retryWrites=true&w=majority`;
const s3cred={
    accessKeyId:`${process.env.Access_Key_ID}`,
    secretAccessKey:`${process.env.Secret_Access_Key}`
}
exports.s3cred= s3cred;
exports.url = mongoURI;
exports.jwtkey = process.env.jwttoken

