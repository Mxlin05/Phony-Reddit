import "../css/mainPage.css"; 
import React from "react";
import { validateLink } from "./createPageView";
import { CountComments } from "./pageView";
function TimeStamp({date}){
    const curr_date = new Date();
    const post_date = new Date(date);
    // console.log(curr_date)
    // console.log("date is" + date)
    // console.log(post_date)

    const diff_mili = curr_date - post_date;
    const diff_seconds = Math.floor(diff_mili / 1000);
    if (diff_seconds < 60){
        return `${diff_seconds} second${diff_seconds !== 1 ? "s" : ""} ago`;
    }
    const diff_minutes = Math.floor(diff_seconds / 60);
    if (diff_minutes < 60){
        return `${diff_minutes} minute${diff_minutes !== 1 ? "s" : ""} ago`;
    }
    const diff_hours = Math.floor(diff_minutes / 60);
    if (diff_hours < 24){
        return `${diff_hours} hour${diff_hours !== 1 ? "s" : ""} ago`;
    }
    const diff_days = Math.floor(diff_hours / 24);
    if (diff_days < 30){
        return `${diff_days} day${diff_days !== 1 ? "s" : ""} ago`;
    }
    const diff_months = Math.floor(diff_days / 30);
    if (diff_months < 12){
        return `${diff_months} month${diff_months !== 1 ? "s" : ""} ago`;
    }
    const diff_years = Math.floor(diff_months / 12);
    return `${diff_years} year${diff_years !== 1 ? "s" : ""} ago`;
}

function CraftShortPost({post, communityPost, model, setView, set_select_post_id}){
    const handle_click_post = () => {
        setView("post");
        set_select_post_id(post._id);
    }
    var linkFlair = {content: ""};

    if(post.linkFlairID != null){
        linkFlair = model.linkFlairs.find(linkFlair => linkFlair._id === post.linkFlairID);
    }
    var community;
    //console.log(model, model.communities);

    if (model.communities && Array.isArray(model.communities)) {
        community = model.communities.find(c => 
            c && c.postIDs && Array.isArray(c.postIDs) && 
            c.postIDs.some(p => p._id === post._id)
        );
    }

    //need to handle cases HERERERERE
    if (!community) {
        //console.log("No matching community found for post:", post._id);
        return;
    }

    //console.log("Found community:", community.name);
    const user = model.users.find(user => user._id === post.postedBy);
    if (!user){
        return; //SAME BULLSHIT HERE
    }

    if(communityPost){
        // console.log("Runs this");
        return(
            <div key={post.postID} className = "post" onClick = {handle_click_post}> 
                <div className = "post-header">
                    <div className = "post-meta-data">
                        <div>{user.username}</div>
                        <span>•</span>
                        <div><TimeStamp date = {post.postedDate} /></div>
                    </div>
                    <h2>{post.title}</h2>
                    <div className = "post-flair">{linkFlair !== undefined && linkFlair.content}</div>
                    </div>
                <div className = "post-content">{validateLink(post.content, true)}<span>...</span></div>
                <div className = "post-meta-data">
                    <div className = "post-comment-count">Comments: <CountComments post_ID={post._id} model={model}/></div>
                    <span>•</span>
                    <div className = "post-views">Views: {post.views}</div>
                    <span>•</span>
                    <div className = "post-views">up votes: {post.upVotes}</div>
                    <span>•</span>
                    <div className = "post-views">down votes: {post.downVotes}</div>
                </div>
            </div>
        )
    }
    // console.log("Runs");
    return(
        <div key={post.postID} className = "post" onClick = {handle_click_post}> 
            <div className = "post-header">
                <div className = "post-meta-data">
                    <div>{community.name}</div>
                    <span>•</span>
                    <div>{user.username}</div>
                    <span>•</span>
                    <div><TimeStamp date = {post.postedDate} /></div>
                </div>
                <h2>{post.title}</h2>
            </div>
            <div className = "post-flair">{linkFlair !== undefined && linkFlair.content}</div>
            <div className = "post-content">{validateLink(post.content, true)}<span>...</span></div>
            <div className = "post-meta-data">
                <div className = "post-comment-count">Comments: <CountComments post_ID={post._id} model={model}/></div>
                <span>•</span>
                <div className = "post-views">Views: {post.views}</div>
                <span>•</span>
                <div className = "post-views">up votes: {post.upVotes}</div>
                <span>•</span>
                <div className = "post-views">down votes: {post.downVotes}</div>
            </div>
        </div>
    )
}

export {CraftShortPost, TimeStamp};