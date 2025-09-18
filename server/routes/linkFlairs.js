const express = require('express');
const router = express.Router();
const linkFlair = require("../models/linkflairs");

//get all linkFlairs
router.get("/", async (req, res) =>{
    try{
        const l = await linkFlair.find();
        if (!l){
            return res.status(404).send("could not find that linkFlair, err");
        }
        res.json(l);
    } catch (error){
        console.log(error);
        res.status(500).json({ error : "there was an error "});
    }
});

//get 1 linkFlair
router.get("/:linkFlairID", async (req, res) =>{
    try{
        const l = await linkFlair.findById(req.params.linkFlairID);
        if (!l){
            return res.status(404).send("could not find that linkFlair, err");
        }
        res.json(l);
    } catch (error){
        console.log(error);
        res.status(500).json({ error : "there was an error "});
    }
});

//add a linkFlair
router.post("/", async (req, res) =>{

    const { content } = req.body;
    const newLinkFlair = new linkFlair(
        { content }
    );
    try{
        const saveLinkFlair = await newLinkFlair.save();
        res.json(saveLinkFlair);
    } catch (error){
        console.log(error);
        res.status(500).json({ error : "there was an error "});
    }
});

module.exports = router;