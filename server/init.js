/* server/init.js
** You must write a script that will create documents in your database according
** to the datamodel you have defined for the application.
*/

const UserModel = require('./models/user');
const CommunityModel = require('./models/communities');
const LinkFlairModel = require('./models/linkflairs');
const PostModel = require('./models/posts');
const CommentModel = require('./models/comments');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Parse command line arguments
const fields = process.argv.slice(2);
const cmd_args = () => {
    const admin = {};
    for (let i = 0; i < fields.length; i += 2) { //might need to verify name, password, and email are valid
        if (fields[i] === '-email') admin.email = fields[i+1];
        else if (fields[i] === '-username') admin.username = fields[i+1];
        else if (fields[i] === '-password') admin.password = fields[i+1];
    }
    return admin;
}

function createLinkFlair(linkFlairObj) {
    let newLinkFlairDoc = new LinkFlairModel({
        content: linkFlairObj.content,
    });
    return newLinkFlairDoc.save();
}

function createComment(commentObj) {
    let newCommentDoc = new CommentModel({
        content: commentObj.content,
        commentedBy: commentObj.commentedBy,
        commentedDate: commentObj.commentedDate,
        commentIDs: commentObj.commentIDs,
        upVotes: commentObj.upVotes || 0,
        downVotes: commentObj.downVotes || 0,
        votes: commentObj.votes || [] 
    });
    return newCommentDoc.save();
}

function createPost(postObj) {
    let newPostDoc = new PostModel({
        title: postObj.title,
        content: postObj.content,
        postedBy: postObj.postedBy,
        postedDate: postObj.postedDate,
        views: postObj.views,
        linkFlairID: postObj.linkFlairID,
        commentIDs: postObj.commentIDs,
        upVotes: postObj.upVotes || 0,
        downVotes: postObj.downVotes || 0,
        votes: postObj.votes || [] 
    });
    return newPostDoc.save();
}

function createCommunity(communityObj) {
    let newCommunityDoc = new CommunityModel({
        name: communityObj.name,
        description: communityObj.description,
        postIDs: communityObj.postIDs,
        startDate: communityObj.startDate,
        members: communityObj.members,
        createdBy: communityObj.createdBy
    });
    return newCommunityDoc.save();
}

function createUser(userObj){
    let newUserDoc = new UserModel({
        firstName: userObj.firstName,
        secondName: userObj.secondName,
        username: userObj.username,
        password: userObj.password, 
        email: userObj.email,
        createdAt: userObj.createdAt,
        communities: userObj.communities,
        posts: userObj.posts,
        comments: userObj.comments,
        reputation: userObj.reputation || 100,
        votes: userObj.votes || [] 
    });
    return newUserDoc.save();
}

let mongoDB = 'mongodb://127.0.0.1:27017/phreddit';
mongoose.connect(mongoDB);
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

async function initializeDB(){
    // Clear all collections first
    await UserModel.deleteMany({});
    await CommunityModel.deleteMany({});
    await LinkFlairModel.deleteMany({});
    await PostModel.deleteMany({});
    await CommentModel.deleteMany({});
    
    const admin = cmd_args();

    if (!admin.username || !admin.email || !admin.password){
        console.log("Missing email, username, or password");
        process.exit(1);
    }

    // Create admin user
    const new_admin = {
        firstName: 'Admin',
        secondName: 'Admin',
        username: admin.username,
        password: admin.password, // Will be hashed by schema
        email: admin.email,
        createdAt: new Date('August 15, 2010 03:32:00'),
        communities: [],
        posts: [],
        comments: [],
        reputation: 1000, // Admin starts with 1000 reputation
        votes: [] // Empty votes array
    };
    const adminRef = await createUser(new_admin);

    
    const linkFlair1 = { content: 'The jerkstore called...' };
    const linkFlair2 = { content: 'Literal Saint' };
    const linkFlair3 = { content: 'They walk among us' };
    const linkFlair4 = { content: 'Worse than Hitler' };
    
    let linkFlairRef1 = await createLinkFlair(linkFlair1);
    let linkFlairRef2 = await createLinkFlair(linkFlair2);
    let linkFlairRef3 = await createLinkFlair(linkFlair3);
    let linkFlairRef4 = await createLinkFlair(linkFlair4);
    
    
    const user1 = {
        firstName: 'Matthew',
        secondName: 'Lin',
        username: 'astyanax',
        password: 'pass1', 
        email: 'u1@gmail.com',
        createdAt: new Date('August 15, 2010 03:32:00'),
        communities: [],
        posts: [],
        comments: [],
        reputation: 100,
        votes: [] 
    };

    const user2 = {
        firstName: 'person',
        secondName: 'two',
        username: 'bigfeet',
        password: 'pass2', 
        email: 'u2@gmail.com',
        createdAt: new Date('August 16, 2010 03:32:00'),
        communities: [],
        posts: [],
        comments: [],
        reputation: 150,
        votes: [] 
    };
    
    let userRef1 = await createUser(user1);
    let userRef2 = await createUser(user2);
    
  
    const community1 = {
        name: 'Am I the Jerk?',
        description: 'A practical application of the principles of justice.',
        postIDs: [],
        startDate: new Date('August 10, 2014 04:18:00'),
        members: [userRef1._id, userRef2._id],
        createdBy: userRef1._id
    };
    
    let communityRef1 = await createCommunity(community1);
    
    
    const comment7 = {
        content: 'Generic poster slogan #42',
        commentIDs: [],
        commentedBy: userRef2._id,
        commentedDate: new Date('September 10, 2024 09:43:00'),
        upVotes: 3,
        downVotes: 1,
        votes: []
    };
    
    let commentRef7 = await createComment(comment7);
    
    
    const post1 = {
        title: 'AITJ: I parked my cybertruck in the handicapped spot to protect it from bitter, jealous losers.',
        content: 'Recently I went to the store in my brand new Tesla cybertruck. I know there are lots of haters out there, so I wanted to make sure my truck was protected. So I parked it so it overlapped with two of those extra-wide handicapped spots. When I came out of the store with my beef jerky some Karen in a wheelchair was screaming at me. So tell me prhreddit, was I the jerk?',
        linkFlairID: linkFlairRef1._id,
        postedBy: userRef1._id,
        postedDate: new Date('August 23, 2024 01:19:00'),
        commentIDs: [commentRef7._id],
        views: 14,
        upVotes: 5,
        downVotes: 2,
        votes: []
    };
    
    let postRef1 = await createPost(post1);
    
    
    await UserModel.findByIdAndUpdate(userRef1._id, {
        communities: [communityRef1._id],
        posts: [postRef1._id],
        votes: []
    });
    
    
    await UserModel.findByIdAndUpdate(userRef2._id, {
        communities: [communityRef1._id],
        comments: [commentRef7._id],
        votes: []
    });
    
    
    await CommunityModel.findByIdAndUpdate(communityRef1._id, {
        postIDs: [postRef1._id]
    });
    
    if (db) {
        db.close();
    }
    console.log("Database initialized");
}

initializeDB()
    .catch((err) => {
        console.log('ERROR: ' + err);
        console.trace();
        if (db) {
            db.close();
        }
    });

console.log('Processing...');
