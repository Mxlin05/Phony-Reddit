import "../css/mainPage.css"; 
import React from "react";
import { useState } from "react";

import { grab_post } from "./pageView";
import { addNewCommunityToUser, delete_post, dellete_user, editComment, deleteComment, deleteCommunity, editCommunity, addPost, addCommunity, addLinkFlair, addPostToCommunity, addComment, addCommentToPost, addCommentToComment, editPost, changeCommunity} from "./asyncHelpers";

function delete_user(model, setModel, setView, userView){
    const user_posts = model.posts.filter((post) => post.postedBy.toString() === userView._id.toString());
    const user_communities = model.communities.filter((community) => community.createdBy.toString() === userView._id.toString());
    const user_comments = model.comments.filter((comment) => comment.commentedBy.toString() === userView._id.toString());

    console.log(user_posts);
    console.log("___________________");
    console.log(user_communities);
    console.log("___________________");
    console.log(user_comments);
    console.log("___________________");
    user_communities.forEach((c) => console.log(c.members));
    const dummy = () => {};
    const dummy2 = () => {};

    if (user_comments && user_comments.length > 0) {
        user_comments.forEach(comment => {
            if (comment) {
                const acc_com = model.comments.find(p => p._id === (comment._id));
                if (acc_com){
                    delete_Comment(acc_com, grab_post(model, comment._id), Grab_all_comments(comment.commentIDs, model), userView, dummy, model, setModel, dummy2);
                }
            }
        });
    }

    if (user_posts && user_posts.length > 0) {
        user_posts.forEach(post => {
            if (post) {
                const community = model.communities.find(c => c.postIDs && c.postIDs.some(pid => (pid._id === post._id))); 
                if (community) {
                    handleDelete(post._id, community._id, Grab_all_comments(post.commentIDs, model), dummy, setModel);
                }
            }
        });
    }

    if (user_communities && user_communities.length > 0) {
        user_communities.forEach(community => {
            if (community) {
                handleDeleteCommunity(community, dummy, setModel, model, userView);
            }
        });
    }

    dellete_user(userView._id).then(() => {
        setModel((prevModel) => {
            return{
                ...prevModel,
                users: prevModel.users.filter((user) => user._id !== userView._id),
                communities: prevModel.communities.map((community) => {
                    if (community.members && community.members.some(member => (member._id === userView._id))){
                        return {
                            ...community,
                            members: community.members.filter(member => (member._id !== userView._id))
                        };
                    }
                    return community;
                }),
                posts: prevModel.posts.map(post => {
                    const updatedVotes = post.votes.filter(vote => vote.user !== userView._id);
                    const upVotes = updatedVotes.filter(vote => vote.type === 'up').length;
                    const downVotes = updatedVotes.filter(vote => vote.type === 'down').length;
                    return {
                        ...post, 
                        votes: updatedVotes, upVotes: upVotes, downVotes: downVotes
                    };
                }),
                comments: prevModel.comments.map(comment => {
                    const updatedVotes = comment.votes.filter(vote => vote.user.toString() !== userView._id.toString());
                    const upVotes = updatedVotes.filter(vote => vote.type === 'up').length;
                    const downVotes = updatedVotes.filter(vote => vote.type === 'down').length;
                    return {
                        ...comment, 
                        votes: updatedVotes, upVotes: upVotes, downVotes: downVotes
                    };
                })
            };
        });
    }).catch(error => {
        console.log("error delete user");
    });
}

function delete_Comment(comment, post, commentIDD, userView, set_selected_post_id, model, setModel, setView){
    console.log("LOOK HERE");
    console.log(comment);
    console.log(commentIDD);

    deleteComment(comment._id, commentIDD).then(() => {
        setModel((prevModel) => {
            return {
                ...prevModel,
                posts : prevModel.posts.map((p) => {
                    if (p._id === post._id){
                        return {
                            ...p,
                            commentIDs : p.commentIDs.filter((c) => c._id !== comment._id && !commentIDD.includes(c._id))
                        }
                    }
                    else{
                        return p
                    }
                }),
                comments : prevModel.comments.filter((c) => c._id !== comment._id && !commentIDD.includes(c._id)),
                users: prevModel.users.map((p) => {
                    if (p._id === userView._id){
                        return {
                            ...p,
                            comments: p.comments.filter((com) => com._id !== comment._id),
                            votes_comment: p.votes_comment.filter((vote) => vote.commment !== comment._id)
                        }
                    }
                    else{
                        return p;
                    }
                }),
            }
        })
    }).catch((error) => {
        console.log("bruhhhhh");
    })

    set_selected_post_id(post._id);
    setView("post");
}

function EditComment({comment, model, setModel, setView, userView, set_selected_post_id}){
    const [submitted, setSubmitted] = useState(false)
    const [content, setContent] = useState(comment.content)

    const handle_delete = () => {
        if(window.confirm("Are you sure you want to delete this comment? This action cannot be undone.")){
            delete_Comment(comment, og_post, Grab_all_comments(comment.commentIDs, model), userView, set_selected_post_id, model, setModel, setView);
        }
    }

    const og_post = grab_post(model, comment._id);
    console.log("HEREEE");
    console.log(og_post);
    const handleSubmit = (event) => {
        event.preventDefault();
        setSubmitted(true);

        if(!validateLink(content)){
            return;
        }

        if (content){
            editComment(comment._id, content).then((newComment) => {
                setModel((prevModel) => {
                    return {
                        ...prevModel,
                        comments : prevModel.comments.map((p) => {
                            if (p._id === newComment._id){
                                return {
                                    ...p,
                                    content: newComment.content,
                                }
                            }
                            else {
                                return p;
                            }
                        }),
                        users : prevModel.users.map((p) => {
                            if (p._id === userView._id){
                                return {
                                    ...p,
                                    comments: [...p.comments.filter((comment) => comment._id !== newComment._id), newComment],
                                }
                            }
                            else{
                                return p;
                            }
                        })
                    }
                })
            }).catch((error) => {
                console.log("bruhhhhh");
            })

            set_selected_post_id(og_post._id);
            setView("post");
        }
    }

    return(
        <div className = "sub-content">
            <h3>New Comment</h3>
            <form className = "create-form" onSubmit = {handleSubmit}>
                <h4>Content: (Required)</h4>
                <textarea type="text" defaultValue={comment.content} 
                                className = "create-input content"
                                minLength = "1"
                                onChange={(event) => setContent(event.target.value)}/>
                <div className = "error-message">
                    {!content && submitted && "Content is required"}
                    {content && submitted && !validateLink(content) && "Invalid Link"}
                </div>
                
                <button className = "standard-button">Submit Comment</button>
            </form>
            <button className = "standard-button" onClick={() => handle_delete()}>Delete Comment</button>
        </div>
    )
}


function Addcomment({postID, model, post_comment, setView, set_selected_post_id, setModel, userView}){
    const [submitted, setSubmitted] = useState(false)
    const [content, setContent] = useState(null)

    const handleSubmit = (event) => {
        let isPost = true;
        event.preventDefault();
        setSubmitted(true);

        if (content === null){
            return;
        }

        if(!validateLink(content)){
            return;
        }
        console.log(content);
        if (content){

            let x = model.posts.find((post) => post._id === post_comment);
            if (!x){
                isPost = false;
                x = model.comments.find((comment) => comment._id === post_comment);
            }
            
            const comment = {
                content: content,
                commentIDs: [],
                commentedBy: userView,
                commentedDate: new Date(),
            }
            
            if(isPost){
                addComment(comment).then((newComment) => {
                    addCommentToPost(post_comment, newComment._id).then(() => {
                        console.log("added comment to post");
                    });
                    setModel((prevModel) => {
                        return {
                            ...prevModel,
                            comments : [...prevModel.comments, newComment],
                            posts: prevModel.posts.map((p) => {
                                if (p._id === post_comment){
                                    return{
                                        ...p,
                                        commentIDs: [...p.commentIDs, newComment]
                                    }
                                }else{
                                    return p;
                                }
                            })
                        }
                    });
                });

            }else{
                addComment(comment).then((newComment) => {
                    addCommentToComment(x._id, newComment._id).then(() => {
                        console.log("added comment to comment");
                    });
                    
                    setModel((prevModel) => {
                        const updatedComments = [
                            ...prevModel.comments.map((c) => {
                                if (c._id === post_comment) {
                                    return {
                                        ...c,
                                        commentIDs: [...c.commentIDs, newComment], 
                                    };
                                } else {
                                    return c;
                                }
                            }),
                            newComment 
                        ];
                    
                        return {
                            ...prevModel,
                            comments: updatedComments,
                        };
                    });

                })
            }

            set_selected_post_id(postID);
            setView("post");
        }
    }

    return(
        <div className = "sub-content">
            <h3>New Comment</h3>
            <form className = "create-form" onSubmit = {handleSubmit}>
                <h4>Content: (Required)</h4>
                <textarea type="text" placeholder="Enter your content (max 500 characters)" 
                                className = "create-input content"
                                minLength = "1"
                                onChange={(event) => setContent(event.target.value)}/>
                <div className = "error-message">
                    {!content && submitted && "Content is required"}
                    {content && submitted && !validateLink(content) && "Invalid Link"}
                </div>
                
                {/* <h4>UserName (Required)</h4>
                <textarea type="text" placeholder="Enter your username" className = "create-input username"
                            minLength = "1"
                            onChange={(event) => setUsername(event.target.value)}/>
                <div className = "error-message">
                    {!username && submitted && "Username is required"}
                </div> */}
                <button className = "standard-button">Submit Comment</button>
            </form>
        </div>
    )
}

function sort_comunities(model, userView){
    console.log("ENTER THE SORT");
    console.log(model);
    console.log("______________");
    console.log(userView);
    const first = model.communities.filter(community => userView.communities.includes(community._id.toString()));
    // console.log(first);

    const second = model.communities.filter(community => !first.includes(community));
    
    return first.concat(second);
}

function EditPost({model, setView, setModel, userView, post}){
    console.log("start");
    let curr_community = null;
    model.communities.forEach((community) => community.postIDs.forEach((postID) => postID._id === post._id ? curr_community = community : console.log("nothing")));

    let curr_linkflair = null;
    model.linkFlairs.forEach((linkflair) => post.linkFlairID !== null && linkflair._id.toString() === post.linkFlairID.toString() ? curr_linkflair = linkflair : console.log("nothing"));
    
    console.log("LOOKED HER");
    console.log(post.linkFlairID)
    const [submitted, setSubmitted] = useState(false);
    const [selectedLF, setSelectedLF] = useState(post.linkFlairID === null ? "No LinkFlair" : post.linkFlairID);
    const [newLF, setNewLF] = useState(null);
    const [title, setTitle] = useState(post.title);
    const [content, setContent] = useState(post.content);
    // const [username, setUsername] = useState(null);
    const [communityID, setCommunityID] = useState(curr_community._id);
    const communities = sort_comunities(model, userView);
    // console.log("boom");
    // console.log(communities);

    const oldCommunityID = curr_community._id;
    // console.log(post.linkFlairID);
    // console.log(curr_linkflair._id);

    const handleLinkFlairChange = (event) => {
        setSelectedLF(event.target.value);
    }

    const handle_delete = () => {
        if(window.confirm("Are you sure you want to delete this comment? This action cannot be undone.")){
            handleDelete(post._id, curr_community._id, Grab_all_comments(post.commentIDs, model), setView, setModel)        
        }
    }

    // const handleContentChange = (event) => {
    //     //const content = event.target.value;
    //     //const updatedContent = validateLink(content);
    //     setContent(event.target.value);
    // }

    return (
        <div className = "sub-content">
            <h3>Create Post</h3>
            <form className = "create-form" 
                onSubmit = { (event) => {
                    event.preventDefault();
                    setSubmitted(true);
                    console.log("what's happening");
                    if(content != null && !validateLink(content)){
                        return;
                    }
                    console.log("goes here");
                    handleSubmitEdit(event, post, oldCommunityID, communityID, title, content, userView, selectedLF === "Create LinkFlair" ? newLF : (selectedLF === "No LinkFlair" ? "No LinkFlair" : selectedLF), model, setView, setModel);
                    
                }
                }
                >
                
                
                <h4>Select A Community</h4>
                <select className = "dropdown-form community" 
                        onChange = {(event) => setCommunityID(event.target.value)}
                        >
                    <option value="" disabled selected>{curr_community.name}</option>
                    {communities.map((community) => (
                        <option key={community._id} value={community._id}>{community.name}</option>))}
                </select>
                <div className = "error-message">
                    {!communityID && submitted && "community is required"}
                </div>
                
                
                <h4>Post Title</h4>
                <textarea type="text" defaultValue={post.title} className = "create-input title"
                            minLength = "1"
                            maxLength = "100"
                            onChange={(event) => setTitle(event.target.value)}/>
                <div className = "error-message">
                    {!title && submitted && "title is required"}
                </div>
                
                
                <h4>LinkFlair</h4>
                <select className = "dropdown-form"  onChange = {handleLinkFlairChange}>
                    <option value="" disabled selected>{curr_linkflair === null ? "No linkflair" : curr_linkflair.content}</option>
                    {model?.linkFlairs?.map((linkFlair) => 
                        linkFlair ? (
                            <option key={linkFlair._id} value={linkFlair._id}>{linkFlair.content}</option>
                            ) : null
                        )}
                    <option value = "Create LinkFlair">Create LinkFlair</option>
                    <option value = "No LinkFlair">No LinkFlair</option>
                </select>
                {selectedLF === null && submitted === true && errorMessage({post: null})}
                {selectedLF === "Create LinkFlair" &&
                    <div>
                        <h4>Create LinkFlair</h4>
                        <textarea type="text" placeholder="LinkFlair" className = "create-input linkflair"
                                    
                                    minLength = "1"
                                    maxLength="30"
                                    onChange={(event) => {
                                    setNewLF(event.target.value)}}/>
                    </div>

                }
                {selectedLF === "Create LinkFlair" && submitted === true && newLF === undefined && errorMessage({post: null})}
                <div className = "error-message">
                    {selectedLF === "Create LinkFlair" && !newLF && submitted && "linkflair is required"}
                </div>
                
                
                <h4>Post Content</h4>
                <textarea type="text" defaultValue={post.content} className = "create-input content"
                                
                                minLength = "1"
                                onChange={(event) => setContent(event.target.value)}/>
                {(content === null || content === "" || content.length === 0) && submitted === true && errorMessage({post: null})}
                {submitted === true && content != null && !validateLink(content) && errorMessageLink({post: null})}
                
                <button className = "standard-button">Submit Post</button>
            </form>
            <button className = "standard-button" onClick={() => handle_delete()}>Delete</button>
        </div>
    )
}

function handleDelete(postID, communityID, commentIDs, setView, setModel) {
    console.log("begin");
    console.log(postID);
    console.log(communityID);
    console.log(commentIDs);

    delete_post(postID, communityID, commentIDs)
        .then(() => {
            setModel((prevModel) => {
                return {
                    ...prevModel,
                    posts: prevModel.posts.filter(post => post._id !== postID),
                    
                    communities: prevModel.communities.map(community => {
                        if (community._id === communityID) {
                            return {
                                ...community,
                                postIDs: community.postIDs.filter(postId => postId._id !== postID)
                            };
                        }
                        return community;
                    }),
                    
                    comments: prevModel.comments.filter(comment => !commentIDs.includes(comment._id)),
                    
                    users: prevModel.users.map(user => ({
                        ...user,
                        posts: user.posts.filter((post) => post._id !== postID),
                        votes_post: user.votes_post.filter(vote => vote.post !== postID)
                    }))
                };
            });
            
            setView("home");
        })
        .catch(error => {
            console.error("Error deleting post:", error);
        });
}

function handleDeleteCommunity(community, setView, setModel, model, userView) {
    
    if (community.postIDs && community.postIDs.length > 0) {
        community.postIDs.forEach(postID => {
            console.log("NIHAO");
            console.log(postID);

            const post = model.posts.find(p => p._id === postID._id);
            
            if (post) {
                const dummy = () => {};
                handleDelete(post._id, community._id, Grab_all_comments(post.commentIDs, model), dummy, setModel);
            }
        });
    }

    console.log("look here");
    console.log(userView.communities);

    deleteCommunity(community._id).then(() => {
        setModel((prevModel) => {
            return{
                ...prevModel,
                users: prevModel.users.map((p) => {
                    if (p._id === userView._id){
                        console.log(p);
                        console.log(p.communities);
                        return {
                            ...p,
                            communities : p.communities.filter((c) => c._id !== community._id)
                        }
                    }
                    else{
                        return p
                    }
                }),
                communities: prevModel.communities.filter((c) => c !== null && c._id !== community._id),
            }
        })
    }).catch(error => {
        console.error("Error deleting community:", error);
    });
        
    
    setView("home");
    
}




function Grab_all_comments(commentIDs, model){
    let comments = [];

    // console.log("initial");
    // console.log(commentIDs);
    if (!commentIDs || commentIDs.length === 0){
        return comments;
    }

    commentIDs.forEach((id) => {
        let comment;
        model.comments.forEach((c) => id._id === c._id ? comment = c : console.log("do nothing"));
        // console.log("argument");
        // console.log(id);
        // console.log("commentID");
        // console.log(comment);
        // console.log(comment.commentIDs);
        if (comment){
            comments.push(comment._id);
            if (comment.commentIDs && comment.commentIDs.length > 0){
                let children = Grab_all_comments(comment.commentIDs,model);
                // console.log("children are");
                // console.log(children);
                comments = comments.concat(children);
            }
        }
    });

    // console.log("Comments at end");
    // console.log(comments);

    return comments;
}



function handleSubmitEdit(event, post, oldCommunityID, communityID, title, content, username, newLF, model, setView, setModel){
    event.preventDefault();
    if(title === null || content === null || username === null|| communityID === undefined || communityID === null || title.length === null || content === null || username === null || newLF === null || title.length < 1 || title.legnth >= 100 || content.length <1 || username.length < 1 || newLF.legnth < 1){
        console.log(title, content, username, newLF, communityID);
        return;
    }
    setView("home")

    console.log("HEREERE");
    console.log(communityID);
    let lf = {
        content : newLF
    };

    const foundLF = model.linkFlairs.find(linkFlair => linkFlair._id === newLF);


    if(newLF === "No LinkFlair"){
        lf = null;
    }
    else if(foundLF !== undefined){
        lf = foundLF;
    }
    
    if(foundLF === undefined && newLF !== "No LinkFlair"){
        addLinkFlair(lf).then((newLinkFlair) => {

            setModel((prevModel) => {
                return {
                    ...prevModel,
                    linkFlairs: [...prevModel.linkFlairs, newLinkFlair],
                };
            });
            editPost(post._id, title, content, newLinkFlair).then((newPost) => {
                changeCommunity(oldCommunityID, communityID, newPost._id);
        
                setModel((prevModel) => {
                    return {
                        ...prevModel,
                        posts: prevModel.posts.map((p) => {
                            if(p._id === newPost._id){
                                return { ...p, title: newPost.title, content: newPost.content, linkFlairID: newPost.linkFlairID, postedBy: newPost.postedBy, postedDate: newPost.postedDate, views: newPost.views, upVotes: newPost.upVotes, downVotes: newPost.downVotes, votes: newPost.votes};
                            }else{
                                return p;
                            }
                        }),
                        users: prevModel.users.map((p) => {
                            if (p._id === username._id){
                                return {
                                    ...p,
                                    posts: [...p.posts.filter((post) => post._id !== newPost._id), newPost],
                                }
                            }
                            else{
                                return p;
                            }
                        }),
                        communities: prevModel.communities.map((community) => {
                            if (community._id === communityID && communityID === oldCommunityID){
                                console.log("goes here");
                                return{
                                    ...community,
                                    postIDs: [...community.postIDs.filter(postId => postId._id !== newPost._id), newPost]
                                };
                            }
                            else if (community._id === communityID) {
                                return {
                                    ...community,
                                    postIDs: [...community.postIDs, newPost],
                                };
                            }
                            else if (community._id === oldCommunityID){
                                return {
                                    ...community,
                                    postIDs: community.postIDs.filter(postId => postId._id !== newPost._id),
                                };
                            }
                            return community;
                        })
                    };
                });
            }).catch((error) => {
                console.log("bruhhhhh");
            })


        });
    }else{
        // console.log("goes here");
        editPost(post._id, title, content, lf).then((newPost) => {
                changeCommunity(oldCommunityID, communityID, newPost._id);
        
                setModel((prevModel) => {
                    return {
                        ...prevModel,
                        posts: prevModel.posts.map((p) => {
                            if(p._id === newPost._id){
                                return { ...p, title: newPost.title, content: newPost.content, linkFlairID: newPost.linkFlairID, postedBy: newPost.postedBy, postedDate: newPost.postedDate, views: newPost.views, upVotes: newPost.upVotes, downVotes: newPost.downVotes, votes: newPost.votes};
                            }else{
                                return p;
                            }
                        }),
                        users: prevModel.users.map((p) => {
                            if (p._id === username._id){
                                return {
                                    ...p,
                                    posts: [...p.posts.filter((post) => post._id !== newPost._id), newPost],
                                }
                            }
                            else{
                                return p;
                            }
                        }),
                        communities: prevModel.communities.map((community) => {
                            if (community._id === communityID && communityID === oldCommunityID){
                                console.log("goes here");
                                return{
                                    ...community,
                                    postIDs: [...community.postIDs.filter(postId => postId._id !== newPost._id), newPost]
                                };
                            }
                            else if (community._id === communityID) {
                                return {
                                    ...community,
                                    postIDs: [...community.postIDs, newPost],
                                };
                            }
                            else if (community._id === oldCommunityID){
                                return {
                                    ...community,
                                    postIDs: community.postIDs.filter(postId => postId._id !== newPost._id),
                                };
                            }
                            return community;
                        })
                    };
                });
            }).catch((error) => {
                console.log("bruhhhhh");
            })
        
    }

}

function CreatePost({model, setView, setModel, userView}){
    const [submitted, setSubmitted] = useState(false);
    const [selectedLF, setSelectedLF] = useState(null);
    const [newLF, setNewLF] = useState(null);
    const [title, setTitle] = useState(null);
    const [content, setContent] = useState(null);
    // const [username, setUsername] = useState(null);
    const [communityID, setCommunityID] = useState(null);
    const communities = sort_comunities(model, userView);
    // console.log("boom");
    // console.log(communities);

    const handleLinkFlairChange = (event) => {
        setSelectedLF(event.target.value);
    }

    // const handleContentChange = (event) => {
    //     //const content = event.target.value;
    //     //const updatedContent = validateLink(content);
    //     setContent(event.target.value);
    // }

    return (
        <div className = "sub-content">
            <h3>Create Post</h3>
            <form className = "create-form" 
                onSubmit = { (event) => {
                    event.preventDefault();
                    setSubmitted(true);
                    if(content != null && !validateLink(content)){
                        return;
                    }
                    handleSubmit(event, communityID, title, content, userView, selectedLF === "Create LinkFlair" ? newLF : selectedLF, model, setView, setModel);
                    
                }
                }
                >
                
                
                <h4>Select A Community</h4>
                <select className = "dropdown-form community" 
                        onChange = {(event) => setCommunityID(event.target.value)}>
                    <option value="" disabled selected>Select...</option>
                    {communities.map((community) => (
                        <option key={community._id} value={community._id}>{community.name}</option>))}
                </select>
                <div className = "error-message">
                    {!communityID && submitted && "community is required"}
                </div>
                
                
                <h4>Post Title</h4>
                <textarea type="text" placeholder="Title" className = "create-input title"
                            minLength = "1"
                            maxLength = "100"
                            onChange={(event) => setTitle(event.target.value)}/>
                <div className = "error-message">
                    {!title && submitted && "title is required"}
                </div>
                
                
                <h4>LinkFlair</h4>
                <select className = "dropdown-form"  onChange = {handleLinkFlairChange}>
                    <option value="" disabled selected>Select...</option>
                    {model?.linkFlairs?.map((linkFlair) => 
                        linkFlair ? (
                            <option key={linkFlair._id} value={linkFlair._id}>{linkFlair.content}</option>
                            ) : null
                        )}
                    <option value = "Create LinkFlair">Create LinkFlair</option>
                    <option value = "No LinkFlair">No LinkFlair</option>
                </select>
                {selectedLF === null && submitted === true && errorMessage({post: null})}
                {selectedLF === "Create LinkFlair" &&
                    <div>
                        <h4>Create LinkFlair</h4>
                        <textarea type="text" placeholder="LinkFlair" className = "create-input linkflair"
                                    
                                    minLength = "1"
                                    maxLength="30"
                                    onChange={(event) => {
                                    setNewLF(event.target.value)}}/>
                    </div>

                }
                {selectedLF === "Create LinkFlair" && submitted === true && newLF === undefined && errorMessage({post: null})}
                <div className = "error-message">
                    {selectedLF === "Create LinkFlair" && !newLF && submitted && "linkflair is required"}
                </div>
                
                
                <h4>Post Content</h4>
                <textarea type="text" placeholder="Content" className = "create-input content"
                                
                                minLength = "1"
                                onChange={(event) => setContent(event.target.value)}/>
                {(content === null || content === "" || content.length === 0) && submitted === true && errorMessage({post: null})}
                {submitted === true && content != null && !validateLink(content) && errorMessageLink({post: null})}
                
                
                
                {/* <h4>UserName</h4>
                <textarea type="text" placeholder="UserName" className = "create-input username"
                            
                            minLength = "1"
                            onChange={(event) => setUsername(event.target.value)}/>
                <div className = "error-message">
                    {!username && submitted && "Username is required"}
                </div> */}
                
                <button className = "standard-button">Submit Post</button>
            </form>
        </div>
    )
}


function CreateNewCommunity({model, setView, setSelectedCommunityID, setModel, user, setUserView}){
    const [submitted, setSubmitted] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [nameError, nameSetError] = useState("");
    const [contentError, contentSetError] = useState("");

    console.log(submitted);
    console.log(title);
    console.log(content);

    
    const handleSubmitTemp = (event) => {

        event.preventDefault();
        setSubmitted(true);

        const newTitle = event.target.elements["title"].value.trim();
        const newContent = event.target.elements["content"].value.trim();

        const dupTitle = model.communities.filter((c) => c.name === newTitle);

        nameSetError("");
        contentSetError("");
        var bool = false;

        if (newTitle.length < 1 || newTitle.length >= 100) {
            nameSetError("Community name must be between 1 and 100 characters.");
            bool = true;
        }
    
        if (newContent.length < 1 || newContent.length > 500) {
            contentSetError("Description must be between 1 and 500 characters.");
            bool = true;
        }
    
        if (dupTitle.length > 0) {
            nameSetError("A community with that name already exists.");
            bool = true;
        }
    
        if (!validateLink(newContent)) {
            contentSetError("Description contains invalid links.");
            bool = true;
        }

        if(bool){
            return;
        }
    
        setTitle(newTitle);
        setContent(newContent);
        handleCreateCommunity(event, newTitle, newContent, user.username, model, setView, setSelectedCommunityID, setModel, user, setUserView);

    };

    return (
        <div className = "sub-content">
            <h3>Create Community</h3>
            <form className = "create-form" 
                onSubmit = { (event) => {handleSubmitTemp(event)}}
                >
                    <h5>Community Name</h5>
                    <textarea name="title" placeholder="Community Name" className="create-input title" 
                                minLength="1" maxLength="100" 
                                onChange={(event) => setTitle(event.target.value)}/>
                    {nameError && <div className="error-message">{nameError}</div>}

                    <h5>Community Description</h5>
                    <textarea name="content" placeholder="Community Description" className="create-input content" 
                            minLength="1" maxLength="500" 
                            onChange={(event) => setContent(event.target.value)}/>

                    {contentError && <div className="error-message">{contentError}</div>} 


                    <button className="standard-button">Engender Community</button>
                
                
            </form>
        </div>
    )
}

function EditCommunity({model, setView, setSelectedCommunityID, setModel, user, setUserView, edit}){
    const [submitted, setSubmitted] = useState(false);
    const [title, setTitle] = useState(edit.name);
    const [content, setContent] = useState(edit.description);
    const [nameError, nameSetError] = useState("");
    const [contentError, contentSetError] = useState("");

    console.log(submitted);
    console.log(title);
    console.log(content);
    // console.log("CHECK");
    // console.log(edit.name);

    const handle_delete = () => {
        if(window.confirm("Are you sure you want to delete this comment? This action cannot be undone.")){
            handleDeleteCommunity(edit, setView, setModel, model, user);
        }
    }
    
    const handleSubmitTemp = (event) => {

        event.preventDefault();
        setSubmitted(true);

        const newTitle = event.target.elements["title"].value.trim();
        const newContent = event.target.elements["content"].value.trim();

        // const dupTitle = model.communities.filter((c) => c.name === newTitle);

        nameSetError("");
        contentSetError("");
        var bool = false;

        if (newTitle.length < 1 || newTitle.length >= 100) {
            nameSetError("Community name must be between 1 and 100 characters.");
            bool = true;
        }
    
        if (newContent.length < 1 || newContent.length > 500) {
            contentSetError("Description must be between 1 and 500 characters.");
            bool = true;
        }
    
        // if (dupTitle.length > 0) {
        //     nameSetError("A community with that name already exists.");
        //     bool = true;
        // }
    
        if (!validateLink(newContent)) {
            contentSetError("Description contains invalid links.");
            bool = true;
        }

        if(bool){
            return;
        }
    
        setTitle(newTitle);
        setContent(newContent);
        handleEditCommunity(event, edit._id, newTitle, newContent, user, model, setView, setSelectedCommunityID, setModel, user, setUserView);

    };

    return (
        <div className = "sub-content">
            <h3>Create Community</h3>
            <form className = "create-form" 
                onSubmit = { (event) => {handleSubmitTemp(event)}}
                >
                    <h5>Community Name</h5>
                    <textarea name="title" defaultValue={edit.name} className="create-input title" 
                                minLength="1" maxLength="100" 
                                onChange={(event) => setTitle(event.target.value)}/>
                    {nameError && <div className="error-message">{nameError}</div>}

                    <h5>Community Description</h5>
                    <textarea name="content" defaultValue={edit.description} className="create-input content" 
                            minLength="1" maxLength="500" 
                            onChange={(event) => setContent(event.target.value)}/>

                    {contentError && <div className="error-message">{contentError}</div>} 


                    <button className="standard-button">Engender Community</button>
                
            </form>
            <button className = "standard-button" onClick={() => handle_delete()}>Delete</button>

        </div>
    );
}

async function handleEditCommunity(event, communityID, title, content, username, model, setView, setSelectedCommunityID, setModel, user, setUserView){
    event.preventDefault();
    if(title === null || content === null || username === null || title.length < 1 || title.legnth >= 100 || content.length <1 || content.length > 500 || username.length < 1){
        return;
    }

    try{
        const newCommunity = await editCommunity(communityID, title, content);
        setModel((prevModel) => {
            return {
                ...prevModel,
                communities: prevModel.communities.map((p) => {
                    if (p._id === newCommunity._id){
                        return { ...p, name: newCommunity.name, description: newCommunity.description};
                    }
                    else{
                        return p;
                    }
                }),
                users: prevModel.users.map((p) => {
                    if (p._id === username._id){
                        return {
                            ...p,
                            communities: [...p.communities.filter((commu) => commu._id !== communityID), newCommunity]
                        }
                    }
                    else{
                        return p
                    }
                }),
            }
        });

        // const newUser = await addNewCommunityToUser(user._id, newCommunity);
        // setUserView(newUser);
        
        console.log(model.communities);
        setView("community");
        setSelectedCommunityID(newCommunity._id);

 
    } catch (error){
        console.log(error);
    }
}

function validateLink(l, shortenedSub = false) {
    const regex = /\[([^\]]*)\]\(([^)]+)?\)/g
    let foundLink;
    let lastIndex = 0;
    let bool = true;
    let r = 0;
    
    const updatedContent = [];
    const shortContent = []
    while ((foundLink = regex.exec(l)) !== null) {
        updatedContent.push(l.slice(lastIndex, foundLink.index));
        shortContent.push(l.slice(lastIndex, foundLink.index));

        const textContent = foundLink[1];
        const link = foundLink[2];

        if (!textContent || !link || !link.trim() || (!link.startsWith("http://") && !link.startsWith("https://"))) {
            updatedContent.push(l.slice(foundLink.index, regex.lastIndex)); 
            return false;

        } else {
            shortContent.push(
                "replace"
            )
            updatedContent.push(
                <a key={lastIndex} href={link} target="_blank" rel="noopener noreferrer">
                    {textContent}
                </a>
            );
        }

        lastIndex = regex.lastIndex;
    }
    if(r === 0){
        <span className = "crafted-content">{l.substring(0, 80)}</span>
    }

    updatedContent.push(l.slice(lastIndex));
    shortContent.push(l.slice(lastIndex));

    if(shortenedSub){
        let counter = 0;
        let i = 0;
        let newUpdatedContent = [];
        let maxLength = 80;
        while (i < shortContent.length){
            if(counter + shortContent[i].length > 80){
                maxLength = 80 - counter;
                counter = 80;
            }else{
                counter = counter + shortContent[i].length;
            }
            let content = shortContent[i].substring(0, maxLength);


            if(shortContent[i] === "replace"){
                const originalElement = updatedContent[i];
                
                newUpdatedContent.push(
                    <a key={i} href={originalElement.props.href} target="_blank" rel="noopener noreferrer">
                        {originalElement.props.children.substring(0, maxLength)}
                    </a>
                );
            }else{
                newUpdatedContent.push(content);
            }
            i++;
            if (counter >= 80) break;
        }
        return <span className = "crafted-content">{newUpdatedContent}</span>;
    }

    if(bool){
        return <span className = "crafted-content">{updatedContent}</span>;
    }
    return false;
}

function handleSubmit(event, communityID, title, content, username, newLF, model, setView, setModel){
    event.preventDefault();
    if(title === null || content === null || username === null|| communityID === undefined || communityID === null || title.length === null || content === null || username === null || newLF === null || title.length < 1 || title.legnth >= 100 || content.length <1 || username.length < 1 || newLF.legnth < 1){
        console.log(title, content, username, newLF, communityID);
        return;
    }
    setView("home")

    let lf = {
        content : newLF
    };

    const foundLF = model.linkFlairs.find(linkFlair => linkFlair._id === newLF);


    if(newLF === "No LinkFlair"){
        lf = null;
    }
    else if(foundLF !== undefined){
        lf = foundLF;
    }

    if(foundLF === undefined && newLF !== "No LinkFlair"){
        addLinkFlair(lf).then((newLinkFlair) => {
            const post = {
                title: title,
                content: content,
                linkFlairID: lf === null ? null : newLinkFlair._id,
                postedBy: username,
                postedDate: new Date(),
                commentIDs: [],
                views: 0,
            }

            setModel((prevModel) => {
                return {
                    ...prevModel,
                    linkFlairs: [...prevModel.linkFlairs, newLinkFlair],
                };
            });
            addPost(post).then((newPost) => {
                addPostToCommunity(communityID, newPost._id);
        
                setModel((prevModel) => {
                    return {
                        ...prevModel,
                        posts: [...prevModel.posts, newPost],
                        communities: prevModel.communities.map((community) => {
                            if (community._id === communityID) {
                                return {
                                    ...community,
                                    postIDs: [...community.postIDs, newPost],
                                };
                            }
                            return community;
                        }),
                        users: prevModel.users.map((p) => {
                            if (p._id === username._id){
                                return {
                                    ...p,
                                    posts: [...p.posts, newPost],
                                }
                            }
                            else{
                                return p;
                            }
                        }),
                    };
                });
            }).catch((error) => {
                console.log("bruhhhhh");
            })

            
        });
    }else{
        const post = {
            title: title,
            content: content,
            linkFlairID: lf === null ? null : lf._id,
            postedBy: username,
            postedDate: new Date(),
            commentIDs: [],
            views: 0,
        }
        // console.log("goes here");
        addPost(post).then((newPost) => {
            console.log(communityID, newPost);
            addPostToCommunity(communityID, newPost._id);
    
            setModel((prevModel) => {
                return {
                    ...prevModel,
                    posts: [...prevModel.posts, newPost],
                    communities: prevModel.communities.map((community) => {
                        if (community._id === communityID) {
                            return {
                                ...community,
                                postIDs: [...community.postIDs, newPost],
                            };
                        }
                        return community;
                    }),
                    users: prevModel.users.map((p) => {
                        if (p._id === username._id){
                            return {
                                ...p,
                                posts: [...p.posts, newPost],
                            }
                        }
                        else{
                            return p;
                        }
                    }),
                };
            });
        }).catch((error) => {
            console.log("bruhhhhh");
        });
        
    }

}

async function handleCreateCommunity(event, title, content, username, model, setView, setSelectedCommunityID, setModel, user, setUserView){
    event.preventDefault();
    if(title === null || content === null || username === null || title.length < 1 || title.legnth >= 100 || content.length <1 || content.length > 500 || username.length < 1){
        return;
    }

    const community = {
        name: title,
        description: content,
        postIDs: [],
        startDate: new Date(),
        members: [user],
        createdBy: user
    }
    try{
        const newCommunity = await addCommunity(community);
        setModel((prevModel) => {
            return {
                ...prevModel,
                communities: [...prevModel.communities, newCommunity],
            }
        });

        const newUser = await addNewCommunityToUser(user._id, newCommunity);
        setUserView(newUser);
        
        console.log(model.communities);
        setView("community");
        setSelectedCommunityID(newCommunity._id);

 
    } catch (error){
        console.log(error);
    }



}

function errorMessage({post}){
    return(
        <div className = "error-message">
            <h5>*required</h5>
        </div>
    )
}

function errorMessageLink({post}){
    return(
        <div className = "error-message">
            <h5>*cannot be empty name or link</h5>
        </div>
    )
}


export {CreatePost, CreateNewCommunity, validateLink, delete_user, Addcomment, EditPost, EditCommunity, EditComment};