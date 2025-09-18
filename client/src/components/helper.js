import "../css/mainPage.css"; 
import React from "react";
import { TimeStamp } from "./craftPost";
import { validateLink } from "./createPageView";
import { voteComment, userVoteComments, userVoteReputationCom } from "./asyncHelpers";
// import { validateLink } from "./createPageView";
function Sort_comment_new_old({comment_ids, model}){
    // console.log(model.comments);
    let arr = [];

    // console.log("under");
    comment_ids.forEach((commentID) => console.log(commentID));

    comment_ids.map(commentID => 
        model.comments.forEach((comment) => 
            comment._id === commentID._id ? arr.push(comment) : console.log("do nothing")));
    // console.log("in scnw");
    // console.log(arr);

    // console.log("arr is");
    // console.log(arr);

    return arr.sort((a,b) => new Date(b.commentedDate) - new Date(a.commentedDate));
}

function count_helper({commentIDs, model}){
    if (!commentIDs || commentIDs.length === 0){
        return 0;
    }
    else{
        return commentIDs.reduce((total, commentID) => {
            const comment = model.comments.find((comment) => comment._id === commentID._id);
            if (!comment){
                return total;
            }
            // console.log("total: " + total);
            return total + 1 + count_helper({commentIDs: comment.commentIDs, model: model});
        }, 0);
    }
}

function CountComments({post_ID, model}){
    // console.log("postID: " + post_ID)
    let post = model.posts.find((post) => post._id === post_ID);
    // console.log("Post: " + post.commentIDs.length)
    return count_helper({commentIDs: post.commentIDs, model: model});
}


function CreateComments({comment_ids, indent, model, handler, user, setModel}){

    const handleUpVote = async (comment) => {
        try{
            const newComment = await voteComment(comment._id, user._id, "up");
            console.log(newComment);
            setModel((prevModel) => {
                return{
                    ...prevModel,
                    comments: prevModel.comments.map((c) => {
                        if(c._id === newComment._id){
                            return { ...c, upVotes: newComment.upVotes, downVotes: newComment.downVotes, votes : newComment.votes};
                        }else{
                            return c;
                        }
                    })
                }
            });

            const newRep = await userVoteReputationCom(user._id, comment.commentedBy, comment._id, 'up');
            if(user._id === newRep._id){
                user.reputation = newRep.reputation;
            }
            setModel((prevModel) => {
                return{
                    ...prevModel,
                    users: prevModel.users.map((p) => {
                        if (p._id === newRep._id){
                            console.log("i am here");
                            console.log(p);
                            console.log(newRep.reputation);
                            return {
                                ...p,
                                reputation: newRep.reputation,
                            }
                        }
                        else{
                            return p
                        }
                    })
                }
            });

            const newUser = await userVoteComments(user._id, comment._id, "up");
            setModel((prevModel) => {
                return{
                    ...prevModel,
                    users: prevModel.users.map((u) => {
                        if(u._id === newUser._id){
                            return { ...u, reputation: newUser.reputation, votes_comment : newUser.votes_comment};
                        }else{
                            return u;
                        }
                    })
                }
            });
        }catch (error){
            console.log(error);
        }
    }

    
    const handleDownVote = async (comment) => {
        try {
            const newComment = await voteComment(comment._id, user._id, "down");
            setModel((prevModel) => {
                return{
                    ...prevModel,
                    comments: prevModel.comments.map((c) => {
                        if(c._id === newComment._id){
                            return { ...c, downVotes: newComment.downVotes, upVotes: newComment.upVotes, votes : newComment.votes };
                        }else{
                            return c;
                        }
                    })
                }
            });

            const newRep = await userVoteReputationCom(user._id, comment.commentedBy, comment._id, 'down');
            if(user._id === newRep._id){
                    user.reputation = newRep.reputation;
            }
            setModel((prevModel) => {
                return{
                    ...prevModel,
                    users: prevModel.users.map((p) => {
                        if (p._id === newRep._id){
                            console.log("i am here");
                            console.log(p);
                            console.log(newRep.reputation);
                            return {
                                ...p,
                                reputation: newRep.reputation,
                            }
                        }
                        else{
                            return p
                        }
                    })
                }
            });

            const newUser = await userVoteComments(user._id, comment._id, "down");
            setModel((prevModel) => {
                return{
                    ...prevModel,
                    users: prevModel.users.map((u) => {
                        if(u._id === newUser._id){
                            return { ...u, reputation: newUser.reputation, votes_comment : newUser.votes_comment };
                        }else{
                            return u;
                        }
                    })
                }
            });
        } catch (error){
            console.log(error)
        }


    }
    let comment_arr = Sort_comment_new_old({comment_ids: comment_ids, model: model});
    if (comment_arr.length === 0) return null;

    const comments = comment_arr.map((comment) => (
        <div style = {{marginLeft: `${indent*20}px`, marginBottom: "12px"}}>
            <div className = "post-meta-data">
                <div>{model.users.find((user) => user._id === comment.commentedBy).username}</div>
                <span>•</span>
                <div><TimeStamp date = {comment.commentedDate}/></div>
            </div>
            <div className = "community-stats">{validateLink(comment.content)}</div>
            <div className = "post-meta-data">
                <button className = "standard-button" 
                onClick={() => {if(user !== null){handler(comment._id)}}}
                disabled={user === null}
                >Reply</button>
                <span>•</span>
                {user !== null && user.reputation >= 50 && <button
                onClick={() => handleUpVote(comment)}>
                    ▲ Up Vote {comment.upVotes}
                </button>}
                <span>•</span>
                {user !== null && user.reputation >= 50 && <button
                onClick={() => handleDownVote(comment)}> 
                    ▼ down votes: {comment.downVotes}
                </button>} 
            </div>
            <div>
                <CreateComments user={user} setModel={setModel} comment_ids = {comment.commentIDs} indent = {indent+1} model = {model} handler={handler}/>
            </div>
        </div>
    ));
    return <>{comments}</>
}

export {Sort_comment_new_old, count_helper, CountComments, CreateComments}