const express = require('express');
const router = express.Router();

const Post = require('../models/posts');
const user = require('../models/user');
const Community = require("../models/communities");
const Comment = require("../models/comments");


//gets all the post together i.e api/posts
router.get('/', async (req, res) => {
    try{
        const p = await Post.find().populate("linkFlairID").populate("commentIDs");
        if (!p){
            return res.status(404).send("could not find that post, err");
        }
        res.json(p);
    }catch (error) {
        console.log(error);
        res.status(500).json({error : "failed to get post"});
    }
});

//this will get a single post based on postID i.e api/post/:id???? not sure tbh need to read ithink >:()
router.get('/:postId', async (req, res) => {
    try{
        const p = await Post.findById(req.params.postId).populate("linkFlairID").populate("commentIDs").populate("postedBy");
        if (!p){
            return res.status(404).send("could not find that post, err");
        }
        res.json(p);
    }catch (error) {
        console.log(error);
        res.status(500).json({ error : "there was an eerror"})
    }
});

//this will add a post
router.post("/", async (req, res) => {
    console.error("makes it here");
    const { title, content, linkFlairID, postedBy, postedDate, commentIDs, views } = req.body;
    const newPost = new Post(
        { title, content, linkFlairID, postedBy, postedDate, commentIDs, views } 
    );
    
    try{
        const savePost = await newPost.save();
        res.json(savePost);
    } catch (error){
        console.log(error);
        res.status(500).json({ error : "there was an error saving your post" });
    }
});



router.put('/:postId/view-increment', async (req,res) => {
    try {
        const updatedPost = await Post.findByIdAndUpdate(
            req.params.postId, { $inc: { views: 1} }, { new: true }
        );
        if (!updatedPost){
            return res.status(404).json({ error: "Post not found" });
        }
        res.json(updatedPost);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "increment failed"});
    }
});

router.put('/:postId/upVote', async (req,res) => {
    try {
        const updatedPost = await Post.findByIdAndUpdate(
            req.params.postId, { $inc: { upVotes: 1} }, { new: true }
        );
        if (!updatedPost){
            return res.status(404).json({ error: "Post not found" });
        }
        res.json(updatedPost);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "increment failed"});
    }
});

router.put('/:postId/downVote', async (req,res) => {
    try {
        const updatedPost = await Post.findByIdAndUpdate(
            req.params.postId, { $inc: { downVotes: -1} }, { new: true }
        );
        if (!updatedPost){
            return res.status(404).json({ error: "Post not found" });
        }
        res.json(updatedPost);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "increment failed"});
    }
});

router.put("/addComment", async (req, res) => {
    try {
        const p = await Post.findByIdAndUpdate(
            req.body.postID,
            { $push: { commentIDs : req.body.commentID } },
            { new : true }
        );
        if (!p){
            return res.status(404).send("could not find that post");
        }
        res.json(p);
    } catch (error){
        console.log(error);
        res.status(500).json(error);
    }
});

//this will edit a post
router.post("/edit", async (req, res) => {
    
    const { postID, title, content, linkFlairID} = req.body;
    
    try{
        const post = await Post.findById(postID);
        
        if (!post) {
            return res.status(404).send("Could not find posts");
        }

        post.title = title;
        post.content = content;
        post.linkFlairID = linkFlairID;
        
        console.error("I SEEE IT HERERE");
        await post.save();
        res.json(post);
    } catch (error){
        console.log(error);
        res.status(500).json({ error : "there was an error saving your post" });
    }
});

router.post('/Voteposts', async(req, res) => {
    const { postID, userId, voteType } = req.body;
    try {
        const post = await Post.findById(postID);
        if (!post) {
            return res.status(404).send("Could not find posts");
        }

        const curr = post.votes.findIndex(votes => votes.user.toString() === userId);

        if (curr !== -1){
            const curr_vote = post.votes[curr];

            if (curr_vote.type === voteType){
                return res.json(post);
            }
            else {
                post.votes[curr].type = voteType;

                if (voteType === 'up'){
                    post.upVotes += 1;
                    post.downVotes -= 1;
                }
                else{
                    post.upVotes -= 1;
                    post.downVotes += 1;
                }
            }
        }
        else {
            post.votes.push({
                user: userId,
                type: voteType
            });
            if (voteType === 'up'){
                post.upVotes += 1;
            }
            else{
                post.downVotes += 1;
            }
        }

        // const updatedPost = await Post.findByIdAndUpdate(postID, { $inc: { upVotes: 1 } }, { new : true});
        // if(!updatedPost) {
        //     return res.status(404).send("could not find that user, err");
        // }
        await post.save();
        res.json(post);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "there was an error" })
    }
});


router.post("/delete", async (req, res) => {
    const { postID, communityID, commentIDs } = req.body;
    
    try {
        
        await Post.findByIdAndDelete(postID);
        await Community.findByIdAndUpdate(
            communityID, 
            { $pull: { postIDs: postID } },
            { new: true }
        );
        
        if (Array.isArray(commentIDs) && commentIDs.length > 0) {
            await Comment.deleteMany({ _id: { $in: commentIDs } });
        }
        
        await user.updateMany(
            { posts: postID },
            { $pull: { posts: postID } }
        );
        
        await user.updateMany(
            { "votes_post.post": postID },
            { $pull: { votes_post: { post: postID } } }
        );
        
        res.status(200).json({ message: 'delete' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "There was an error deleting the post" });
    }
});


async function delete_posttest(postID, communityID, commentIDs){
    await Post.findByIdAndDelete(postID);
    await Community.findByIdAndUpdate(
        communityID, 
        { $pull: { postIDs: postID } },
        { new: true }
    );
    
    if (Array.isArray(commentIDs) && commentIDs.length > 0) {
        await Comment.deleteMany({ _id: { $in: commentIDs } });
    }
    
    await user.updateMany(
        { posts: postID },
        { $pull: { posts: postID } }
    );
    
    await user.updateMany(
        { "votes_post.post": postID },
        { $pull: { votes_post: { post: postID } } }
    );
}

module.exports = router;
module.exports.delete_post = delete_posttest;
//might need to add one whwre i add a single comment when a new comment is added?

//moght need to get all comments here?