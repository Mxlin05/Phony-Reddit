// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.

//NOTES
//Check schemas, dont know if i need ids
//all frontend and server side stuff
//** CHECK ROUTES, NOT SURE IF I NEED TO ADD FUNCTIONS I./E GET ALL COMMENTS FOR 1 POST, 
// GET ALL COMM MUNITY IDS ETC IG WILL BE ON A NEED BY BASSIS*/
// need to make pages wait on load for data to be loaded in, willl do that later
//need to fix comment and view counts, will do later
//need to reload or have a beter way of filling model when loading main page as making new stufff isnt 
//loaded
//need to add members and post to communities
//turn everythign async
//need to make things load properly, think it is on server side top send packet to reload? no idea tbh
//should postIDs and commentids only be ids or the entire object?

//cd C:\
//md "\data\db"
//"C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath="c:\data\db"
//node server/init.js
//nodemon ./server.js
//npm start
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const app = express();
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
  }));
app.use(express.json());


//importing the routes
const PostRoute = require("./routes/posts");
const CommentRoute = require("./routes/comments");
const CommunityRoute = require("./routes/communitys");
const LinkFlairRoute = require("./routes/linkFlairs");
const UserRoute = require("./routes/user");



mongoose.connect('mongodb://127.0.0.1:27017/phreddit', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("connected"))
.catch(err => console.error("error:", err));


app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 86400000 },
    store: MongoStore.create({
      mongoUrl: 'mongodb://localhost:27017/phreddit',
      collectionName: 'sessions'
    })
  }));

app.get("/", function (req, res) {
    console.log("Get request received at '/'");
    res.send("Hello Phreddit!")
});

//use the routes
app.use("/api/posts", PostRoute);
app.use("/api/comments", CommentRoute);
app.use("/api/community", CommunityRoute);
app.use("/api/linkFlairs", LinkFlairRoute);
app.use("/api/users", UserRoute);


if (require.main === module) {
  app.listen(8000, () => {console.log("Server listening on port 8000...");});
}

module.exports = app;