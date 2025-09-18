const express = require('express');
const router = express.Router();
const user = require('../models/user');
const bcrypt = require('bcrypt');
const Community = require("../models/communities");
const Comment = require("../models/comments");
const Post = require('../models/posts');

//get all users
router.get('/', async(req, res) => {
    try {
        const users = await user.find();
        if(!users) {
            return res.status(404).send("could not find that user, err");
        }
        res.json(users);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "there was an error" })
    }
});
//add a user
router.post('/', async(req, res) => {
    const { firstName, secondName, email, username, password, createdAt, communities, posts, comments } = req.body;
    const newUser = new user(
        { firstName, secondName, email, username, password, createdAt, communities, posts, comments }
    );
    try {
        const saveUser = await newUser.save();
        res.json(saveUser);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "there was an error saving your user" });
    }
})

//login
router.post('/login', async(req, res) => {
    const { username, password } = req.body;

    try {
        
        const newUser = await user.findOne( { username });
        
        console.log(password);
        console.log(newUser);
        if (!newUser || !(await bcrypt.compare(password, newUser.password))) {
            console.log("password not right");
            return res.status(404).send("could not find the user");
        }
        // console.log("TADA");
        req.session.userID = newUser._id;
        res.json(newUser);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error : "there was an error" });
    }
})


//logOut
router.post('/logout', async(req, res) => {
    try {
        req.session.destroy((err) =>{
            if (err) {
                console.log(err);
                return res.status(500).json({ error : " there was an error" });
            }
            res.clearCookie('connect.sid', { path: '/' });
            res.json({ message : "logged out" });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({error : "there was an error" });
    }
})
//get a password
router.post('/auth', async(req, res) => {
    const { user, password } = req.body;
    try{
        const correctPassword = await bcrypt.compare(password, user.password);
        console.log(correctPassword);
        if(correctPassword){
            res.json({ message : "correct password"});
        }else{
            res.json({ message : "incorrect password" });
        }
    } catch (error){
        console.log(error);
        res.status(500).json({ error: "there was an error"});
    }
});


router.post('/switch', async(req, res) => {
    const { targetUserId } = req.body;
    
    try {
        const targetUser = await user.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({ error: "User not found" });
        }
        
        req.session.userID = targetUser._id;
        res.json(targetUser);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error" });
    }
});


router.post('/community/add', async(req, res) => {
    const { userID, community } = req.body;
    try {
        const updatedUser = await user.findByIdAndUpdate(userID, { $push: { communities: community } }, { new : true});
        if(!updatedUser){
            return res.status(404).send(userID + " ocould not find the user");
        }
        res.json(updatedUser);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "there was an error"});
    }
});

router.post('/community/remove', async(req, res) => {
    const { userID, communityID } = req.body;
    try {
        const updatedUser = await user.findByIdAndUpdate(userID, { $pull: { communities: communityID } }, { new : true});
        if(!updatedUser){
            return res.status(404).send("could not find the user");
        }
        res.json(updatedUser);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "there was an error"});
    }
})

router.post('/rep/Inc', async(req, res) => {
    const { userID } = req.body;
    try {
        const updatedUser = await user.findByIdAndUpdate(userID,{ $inc: { reputation: 5 } }, { new : true});
        if(!updatedUser) {
            return res.status(404).send("could not find that user, err");
        }
        res.json(updatedUser);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "there was an error" })
    }
});

router.post('/rep/Dec', async(req, res) => {
    const { userID } = req.body;
    try {
        const updatedUser = await user.findByIdAndUpdate(userID,{ $inc: { reputation: -10 } }, { new : true});
        if(!updatedUser) {
            return res.status(404).send("could not find that user, err");
        }
        res.json(updatedUser);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "there was an error" })
    }
});

router.put('/addCommunity', async(req, res) => {
    const { userID, community } = req.body;
    try {
        const updatedUser = await user.findByIdAndUpdate(userID, {$push: {communities: community}}, {new : true});
        if(!updatedUser) {
            return res.status(404).send("could not find that user, err");
        }
        res.json(updatedUser);
    }  catch (error) {
        console.log(error);
        res.status(500).json({ error: "there was an error" })
    }
});


router.post('/Vote/post', async(req, res) => {
    const { userID, postID, voteType } = req.body;
    try {
        const userObj = await user.findById(userID); 
        if (!userObj) {
            return res.status(404).send("Could not find user");
        }

        const curr = userObj.votes_post.findIndex(votes => votes.post.toString() === postID);

        if (curr !== -1){
            const curr_vote = userObj.votes_post[curr];
            if (curr_vote.type === voteType){
                console.log("always here");
                return res.json(userObj);
            } else {
                console.log("is this every ran");
                userObj.votes_post[curr].type = voteType;
            }
        } else {
            userObj.votes_post.push({
                post: postID,  
                type: voteType
            });
        }

        await userObj.save();
        res.json(userObj);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "there was an error" });
    }
});

router.post('/Vote/reputation', async (req, res) => {
    const { userID, ownerID, postID, voteType } = req.body;

    try{
        const owner = await user.findById(ownerID);
        const voter = await user.findById(userID);
        console.log("find yourself here?");
        if (!owner || !voter) {
            return res.status(404).json({ error: "User not found" });
        }
        
        const existingVote = voter.votes_post.find(vote => vote.post.toString() === postID.toString());
        
        console.log(existingVote);

        if (existingVote) {
            
            if (existingVote.type === voteType){
                console.log("in here");
                return res.json(owner); 
            }
            else {
                console.log("on here");
                console.log(voteType);
                existingVote.type = voteType;
                if (voteType === 'up'){
                    owner.reputation += 15;
                }
                else{
                    owner.reputation -= 15;
                }
            }
        }
        else{
            console.log("in here 2");
            if (voteType === 'up'){
                owner.reputation += 5;
            }
            else{
                owner.reputation -= 10;
            }
        }
        console.log(owner.reputation);
        await owner.save();
        res.json(owner);
    } catch (error){
        console.log(error);
        res.status(500).json({ error: "There was error" })
    }
});


router.post('/Vote/com/reputation', async (req, res) => {
    const { userID, ownerID, commentID, voteType } = req.body;

    try{
        const owner = await user.findById(ownerID);
        const voter = await user.findById(userID);
        console.log("find yourself here?");
        if (!owner || !voter) {
            return res.status(404).json({ error: "User not found" });
        }
        
        const existingVote = voter.votes_comment.find(vote => vote.comment.toString() === commentID.toString());
        
        console.log(existingVote);

        if (existingVote) {
            
            if (existingVote.type === voteType){
                console.log("in here");
                return res.json(owner); 
            }
            else {
                console.log("on here");
                console.log(voteType);
                existingVote.type = voteType;
                if (voteType === 'up'){
                    owner.reputation += 15;
                }
                else{
                    owner.reputation -= 15;
                }
            }
        }
        else{
            console.log("in here 2");
            if (voteType === 'up'){
                owner.reputation += 5;
            }
            else{
                owner.reputation -= 10;
            }
        }
        console.log(owner.reputation);
        await owner.save();
        res.json(owner);
    } catch (error){
        console.log(error);
        res.status(500).json({ error: "There was error" })
    }
});


router.post('/Vote/comment', async(req, res) => {
    const { userID, commentID, voteType } = req.body;
    try {
        const userObj = await user.findById(userID);  
        if (!userObj) {
            return res.status(404).send("Could not find user");
        }

        const curr = userObj.votes_comment.findIndex(votes => votes.comment.toString() === commentID);

        if (curr !== -1){
            const curr_vote = userObj.votes_comment[curr];
            if (curr_vote.type === voteType){
                return res.json(userObj);
            } else {
                userObj.votes_comment[curr].type = voteType;
            }
        } else {
            userObj.votes_comment.push({
                comment: commentID,  
                type: voteType
            });
        }

        await userObj.save(); 
        res.json(userObj);  
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "there was an error" });
    }
});

router.post('/delete/profile', async (req, res) => {
    const { userID } = req.body;

    try {
        const curr_user = await user.findById(userID);
        if (!curr_user) {
            return res.status(404).json({ error: "User not found" });
        }

        await Community.updateMany(
            { members: userID }, 
            { $pull: { members: userID } }
        );

        if (curr_user.votes_post && curr_user.votes_post.length > 0) {
            const upvotedPostIds = curr_user.votes_post.filter(vote => vote.type === 'up').map(vote => vote.post);
            const downvotedPostIds = curr_user.votes_post.filter(vote => vote.type === 'down').map(vote => vote.post);

            if (upvotedPostIds.length > 0) {
                await Post.updateMany(
                    { _id: { $in: upvotedPostIds } },
                    { $inc: { upVotes: -1 } }
                );
            }

            if (downvotedPostIds.length > 0) {
                await Post.updateMany(
                    { _id: { $in: downvotedPostIds } },
                    { $inc: { downVotes: -1 } }
                );
            }

            await Post.updateMany(
                { "votes.user": userID },
                { $pull: { votes: { user: userID } } }
            );
        }

        if (curr_user.votes_comment && curr_user.votes_comment.length > 0) {
            const upvotedCommentIds = curr_user.votes_comment.filter(vote => vote.type === 'up').map(vote => vote.comment);
            const downvotedCommentIds = curr_user.votes_comment.filter(vote => vote.type === 'down').map(vote => vote.comment);

            if (upvotedCommentIds.length > 0) {
                await Comment.updateMany(
                    { _id: { $in: upvotedCommentIds } },
                    { $inc: { upVotes: -1 } }
                );
            }

            if (downvotedCommentIds.length > 0) {
                await Comment.updateMany(
                    { _id: { $in: downvotedCommentIds } },
                    { $inc: { downVotes: -1 } }
                );
            }

            await Comment.updateMany(
                { "votes.user": userID },
                { $pull: { votes: { user: userID } } }
            );
        }

        await user.findByIdAndDelete(userID);
        
        if (req.session && req.session.userID === userID) {
            req.session.destroy();
        }

        res.status(200).json({ message: "User profile deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "There was an error deleting the user profile" });
    }
});


module.exports = router;