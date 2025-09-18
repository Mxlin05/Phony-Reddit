const express = require('express');
const router = express.Router();
const Community = require("../models/communities");
const user = require('../models/user');

//this will get all communities
router.get("/", async (req, res) => {
    try{
        const c = await Community.find().populate("postIDs").populate("members");
        if (!c){
            return res.status(404).send("could not find that Community, err");
        }
        res.json(c);
    } catch (error){
        console.log(error);

        res.status(500).json({ error : "there was an error "});
    }
});

//this will get a specific community
router.get("/:communityID", async (req, res) => {
    try{
        const c = await Community.findByID(req.params.communityID).populate("postIDs").populate("members");
        if (!c){
            return res.status(404).send("could not find that Community, err");
        }
        res.json(c);
    } catch (error){
        console.log(error);

        res.status(500).json({ error : "there was an error "});
    }
});

//moight need to get all post of community

//might need to get all community names

//add a specific community
router.post("/", async (req, res) => {

    const { name, description, postIDs, startDate, members, createdBy } = req.body;
    const newCommunity = new Community(
        { name, description, postIDs, startDate, members, createdBy } 
    );

    try{
        const saveCommunity = await newCommunity.save();
        res.json(saveCommunity);
    } catch (error){
        console.log(error);

        res.status(500).json({ error : "there was an error "});
    }
});


router.put("/addPost", async (req, res) => {
    try {
        const c = await Community.findByIdAndUpdate(
            req.body.communityID,
            { $push: { postIDs : req.body.postID } },
            { new : true }
        );
        if (!c){
            return res.status(404).send("could not find that Community");
        }
        res.json(c);
    } catch (error){
        console.log(error);

        res.status(500).json(error);
    }
});


router.post("/addUser", async (req, res) => {
    const { communityID, user } = req.body;
    try {
        const c = await Community.findByIdAndUpdate(communityID, { $push : { members: user } }, {new : true});
        if(!c){
            return res.status(404).send("could not find the community");
        }
        res.json(c);
    } catch (error){
        console.log(error);
        res.status(500).json({ error : "there was an error" });
    }
});

router.post("/removeUser", async (req, res) => {
    const { communityID, userID } = req.body;
    try {
        const c = await Community.findByIdAndUpdate(communityID, { $pull : { members:  userID } }, {new : true});
        if(!c){
            return res.status(404).send("could not find the community");
        }
        res.json(c);
    } catch (error){
        console.log(error);
        res.status(500).json({ error : "there was an error" });
    }
});

router.post("/edit", async (req, res) => {
    
    const { oldCommunityID, newCommunityID, postID } = req.body;
    try{
        console.log(newCommunityID);
        console.log("COMMUNITY PROBLEM1");
        const new_community = await Community.findById(newCommunityID);
        console.log("COMMUNITY PROBLEM2");
        const old_community = await Community.findById(oldCommunityID);
        console.log("COMMUNITY PROBLEM3");
        
        if (oldCommunityID.toString() === newCommunityID.toString()){
            return res.json(old_community);
        }
        else {
            new_community.postIDs.push(postID);
            old_community.postIDs = old_community.postIDs.filter(id => 
                id.toString() !== postID.toString()
            );
        }

        await new_community.save();
        await old_community.save();
        res.json(new_community);
    } catch (error){
        console.log(error);
        res.status(500).json({ error : "there was an error changing communities"});
    }
});

router.post("/edit/com", async (req, res) => {
    const { communityID, name, description } = req.body;
    try{
        const community = await Community.findById(communityID);
        if (!community){
            return res.status(404).send("could not find the community");
        }

        community.name = name;
        community.description = description;

        await community.save();
        res.json(community);
    } catch (error){
        console.log(error);
        res.status(500).json({error : "error edit community"});
    }
});

router.post("/delete/com", async (req, res) => {
    const { communityID } = req.body;
    try{
        await Community.findByIdAndDelete(communityID);

        await user.updateMany(
            { communities: communityID },
            { $pull: { communities: communityID } }
        );
        console.log("I NEED HELP");
        res.status(200).json({ message: 'Community deleted successfully' });
    } catch (error){
        console.log(error);
        res.status(500).json({error : "error edit community"});
    }
});

module.exports = router;
//might need onne to add a specific post to a community
