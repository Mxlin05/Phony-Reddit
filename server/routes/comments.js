const express = require('express');
const router = express.Router();
const Comment = require("../models/comments");
const Post = require('../models/posts');
const user = require('../models/user');

//this will get all the comments
router.get("/", async (req, res) => {
    try{
        const c = await Comment.find().populate("commentIDs");
        if (!c){
            return res.status(404).send("could not find that comment, err");
        }
        res.json(c);
    } catch (error){
        console.log(error);

        res.status(500).json({ error : "could not get the comments "});
    }
});

//this will get all the comments for one post
router.get("/:commentID", async (req, res) => {
    try{
        const c = await Comment.findByID(req.params.commentID).populate("commentIDs").populate("commentedBy");
        if (!c){
            return res.status(404).send("could not find that comment, err");
        }
        res.json(c);
    } catch (error){
        console.log(error);

        res.status(500).json({ error : "could not get the comment "});
    }
});

//this will add a new comment
router.post("/", async (req, res) => {

    const { content, commentIDs, commentedBy, commentedDate } = req.body;

    const newComment = new Comment(
        { content, commentIDs, commentedBy, commentedDate } 
    );

    try {
        const saveComment = await newComment.save();
        res.json(saveComment);
    } catch (error){
        console.log(error);

        res.status(500).json({ error : "there was an error tyring to save your comment "});
    }
});

router.put('/:commentId/upVote', async (req,res) => {
    try {
        const updatedPost = await Comment.findByIdAndUpdate(
            req.params.commentId, { $inc: { upVotes: 1} }, { new: true }
        );
        if (!updatedPost){
            return res.status(404).json({ error: "comment not found" });
        }
        res.json(updatedPost);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "increment failed"});
    }
});

router.put('/:commentId/downVote', async (req,res) => {
    try {
        const updatedPost = await Comment.findByIdAndUpdate(
            req.params.commentId, { $inc: { downVotes: -1} }, { new: true }
        );
        if (!updatedPost){
            return res.status(404).json({ error: "comment not found" });
        }
        res.json(updatedPost);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "increment failed"});
    }
});


//add comment to comment

router.put("/addComment", async (req, res) => {
    try {
        const c = await Comment.findByIdAndUpdate(
            req.body.findCommentID,
            { $push: { commentIDs : req.body.addCommentID } },
            { new : true }
        );
        if (!c){
            return res.status(404).send("could not find that post");
        }
        res.json(c);
    } catch (error){
        console.log(error);

        res.status(500).json(error);
    }
})

router.post('/Votecomments', async(req, res) => {
    const { commentID, userId, voteType } = req.body;
    try {
        const comment = await Comment.findById(commentID);
        if (!comment) {
            return res.status(404).send("Could not find comment");
        }

        const curr = comment.votes.findIndex(votes => votes.user.toString() === userId);

        if (curr !== -1){
            const curr_vote = comment.votes[curr];
            if (curr_vote.type === voteType){
                return res.json(comment);
            } else {
                comment.votes[curr].type = voteType;
                if (voteType === 'up'){
                    comment.upVotes += 1;
                    comment.downVotes -= 1;
                } else {
                    comment.upVotes -= 1;
                    comment.downVotes += 1;
                }
            }
        } else {
            comment.votes.push({
                user: userId,
                type: voteType
            });
            if (voteType === 'up'){
                comment.upVotes += 1;
            } else {
                comment.downVotes += 1;
            }
        }

        await comment.save();
        res.json(comment);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "there was an error" });
    }
});

router.post("/edit/comment", async (req, res) => {
    const { commentID, description } = req.body;
    try{
        const comment = await Comment.findById(commentID);
        if (!comment){
            return res.status(404).send("could not find the community");
        }

        comment.content = description;

        await comment.save();
        res.json(comment);
    } catch (error){
        console.log(error);
        res.status(500).json({error : "error edit community"});
    }
});

router.post("/delete/comment", async (req, res) => {
    const { commentID, allCom } = req.body;
    try {
        const comment = await Comment.findById(commentID);
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }
        
        
        const allCommentIDs = [commentID];
        if (allCom && Array.isArray(allCom) && allCom.length > 0) {
            allCommentIDs.push(...allCom);
        }
        
        await Comment.deleteMany({ _id: { $in: allCommentIDs } });
        
        await user.updateMany(
            { comments: { $in: allCommentIDs } },
            { $pull: { comments: { $in: allCommentIDs } } }
        );
        
        await user.updateMany(
            {},
            { $pull: { votes_comment: { comment: { $in: allCommentIDs } } } }
        );

        await Post.updateMany(
            { commentIDs: { $in: allCommentIDs } },
            { $pull: { commentIDs: { $in: allCommentIDs } } }
        );
        
        await Comment.updateMany(
            {},
            { $pull: { commentIDs: { $in: allCommentIDs } } }
        );
        
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error deleting comment" });
    }
});




// router.post('/upVote/Dec', async(req, res) => {
//     const { commentID } = req.body;
//     try {
//         const updatedComment = await Comment.findByIdAndUpdate(commentID, { $inc: { downVotes: -1 } }, { new : true});
//         if(!updatedComment) {
//             return res.status(404).send("could not find that user, err");
//         }
//         res.json(updatedComment);
//     }
//     catch (error) {
//         console.log(error);
//         res.status(500).json({ error: "there was an error" })
//     }
// });
module.exports = router;
//mioght need to make one just to add a comment id to an already existing comment, just like post