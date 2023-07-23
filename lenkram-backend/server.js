const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const _ = require('lodash');



const app = express();

app.use(cors());

const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"]
  }
});

const { User } = require('./Helpers/userClass');

require('./socket/streams')(io, User, _);
require('./socket/private')(io);


const auth = require('./routes/authRoutes');
const posts = require('./routes/postRoutes');
const users = require('./routes/userRoutes');
const friends = require('./routes/friendsRoutes');
const messages = require('./routes/messageRoutes');
const images = require('./routes/imagesRoutes');





const dbConfig = require('./config/secret');


app.use(express.json({limit:'50mb'}));
app.use(express.urlencoded({extended:true, limit:'50mb'}));

app.use(cookieParser());
//app.use(logger('dev'));

mongoose.Promise = global.Promise;

// Localhost ไม่ได้ผลต้องเปลี่ยนมาเป็น 127.0.0.1

mongoose.connect(
  dbConfig.url
  , {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.log('Error connecting to MongoDB:', error.message);
});



//mongoose.connect('mongodb://localhost:27017/lenkram');



app.use('/api/lenkram', auth);
app.use('/api/lenkram', posts);
app.use('/api/lenkram', users);
app.use('/api/lenkram', friends);
app.use('/api/lenkram', messages);
app.use('/api/lenkram', images);




server.listen(3000, ()=>{
    console.log('Runing on 3000');
})