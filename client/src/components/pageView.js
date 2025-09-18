import "../css/mainPage.css"; 
import React, { useState, useEffect } from "react";
import { CraftShortPost, TimeStamp } from "./craftPost";
import { validateLink, delete_user } from "./createPageView";
import  { Sort_comment_new_old, CountComments, CreateComments } from "./helper"
import { incrementView, joinCommunity, userVoteReputation, leaveCommunity, switch_User, addUserToCommunity, removeUserFromCommunity, votePost,userVotePosts} from "./asyncHelpers";

//show the community view on button cliclk
 function CommunityView({c, model, setView, set_selected_post_id, user, setModel, setUserView}){

    const [sort_Method, set_Sort_Method] = useState("newest");

    //instantiate the model and get the community data 

    const community = model.communities.find((community) => community._id === c);

    var posts = [];
    if(community.postIDs != null){
        community.postIDs.forEach((p) =>{
            posts.push(p);
        });
    }

    var sortPosts = [];
    if(community.postIDs != null){
        community.postIDs.forEach((p) =>{

            console.log(p._id);

            model.posts.forEach((post) => console.log(post._id));
            model.posts.forEach((post) => post._id === p._id ? sortPosts.push(post) : console.log("nope"));    
        });
    }

    console.log(sortPosts);

    const sorted_posts = () => {
        switch(sort_Method) {
            case "newest":
                console.log("newest");
                return [...sortPosts].sort((a,b) => new Date(b.postedDate) - new Date(a.postedDate));
            case "oldest":
                console.log("oldest");
                return [...sortPosts].sort((a,b) => new Date(a.postedDate) - new Date(b.postedDate));
            case "active":
                return Active_sort({posts: [...sortPosts], model: model});
            default:
        }
    };

    const default_sort = sorted_posts();
    const inCommunity = () => {
        if(user === null){
            return false;
        }else{
            return user.communities.some((c) => c === community._id);
        }
    }
    const joined = inCommunity();

    //THIS DOES NOT UPDATE THE MODEL CORRECTLY, IF THERE ISSUE WITH USERS IT IS HERE GUYSSSSSSSSSSS
    const handleJoinOrLeaveCommunity = async () => {
        try {
          if (!joined) {
            const newCommunity = await joinCommunity(community, user._id);
            setModel((prevModel) => {
                return {
                    ...prevModel, 
                    users: prevModel.users.map((u) => {
                        if(u._id === user._id){
                            setUserView(newCommunity);
                            return { ...u, communities : [...u.communities, newCommunity._id]};
                        }else{
                            return u;
                        }
                    })
                }
            });
            const newUser = await addUserToCommunity(community._id, user);
            setModel((prevModel) => {
                return {
                    ...prevModel,
                    communities: prevModel.communities.map((c) => {
                        if(c._id === community._id){
                            return { ...c, members : [...c.members, newUser._id]};
                        }else{
                            return c;
                        }
                    })
                }
            });

          } else {
            const newC = await leaveCommunity(community._id, user._id);
            setModel((prevModel) => {
                return {
                    ...prevModel,
                    users: prevModel.users.map((u) => {
                        if(u._id === user._id){
                            setUserView(newC);
                            return { ...u, communities : u.communities.filter((com) => com !== newC._id)}
                        }else{
                            return u;
                        }
                    })
                }
            });
            const newUser = await removeUserFromCommunity(community._id, user._id);
            setModel((prevModel) => {
                return {
                    ...prevModel,
                    communities: prevModel.communities.map((c) => {
                        if(c._id === community._id){
                            return { ...c, members : c.members.filter((m) => m !== newUser._id)};
                        }else{
                            return c;

                        }
                    })
                }
            });

          }

      
        } catch (error) {
          console.log(error);
        }
      };

    const userID = model.users.find((user) => user._id === community.createdBy);
    console.log(userID.username);

    return(
        //header for the community view
        <div className = "sub-content">
            {/*community view header -- grab stabdard meta data and make look semi decent*/}
            <div className = "page-view-header">
                <div>
                    <h3>{community.name}</h3>
                    <div className = "community-des">{validateLink(community.description)}</div>
                    <div className="community-stats">
                        <div className = "community-creation-date"><TimeStamp date = {community.startDate}></TimeStamp></div>
                        <span>•</span>
                        <div className = "community-creation-date">{userID.username}</div>
                    </div>
                    <div className="community-stats">
                        <div className="post-count">Post Count: {community.postIDs.length} post</div>
                        <span>•</span>
                        <div className="community-member-count">Members: {community.members.length} members</div>
                    </div>
                </div>
                <div className = "button-group">
                    <button className = "standard-button" onClick = {() => set_Sort_Method("newest")}>Newest</button>
                    <button className = "standard-button" onClick = {() => set_Sort_Method("oldest")}>Oldest</button>
                    <button className = "standard-button" onClick = {() => set_Sort_Method("active")}>Active</button>
                    {user !== null && !joined && <button className = "standard-button" onClick = {() => handleJoinOrLeaveCommunity()}>Join</button>}
                    {user !== null && joined && <button className = "standard-button" onClick = {() => handleJoinOrLeaveCommunity()}>Leave</button>}

                </div>
            </div>
            {/*/post listing for community view -- go into seperate function and make a list of every post*/}
            <div className = "divider"></div>
            <div className = "post-listing">
                {default_sort.map((post) => (
                    <CraftShortPost post={post} communityPost={true} model={model} setView={setView} set_select_post_id={set_selected_post_id}/>
                ))}
            </div>
        </div>
    )
 }

 function SearchPageResults({searchQuerry, model, setView, set_selected_post_id, user}){

    const [sort_Method, set_Sort_Method] = useState("newest");


    var tempSearchQuerry = searchQuerry.toLowerCase().replace(/^\W+|\W+(?=\s)|\W+$/g, "");
    var s = tempSearchQuerry.split(" ");

    //hash maps :))))))))
    const commentToPostMap = {};
    model.posts.forEach(post => {
        post.commentIDs.forEach(commentID => {
            commentToPostMap[commentID.commentID] = post;
        });
    });
    
    var posts = new Set();
    s.forEach(element => {
        var tempPosts = model.posts.filter((post) => post.title.toLowerCase().includes(element) || post.content.toLowerCase().includes(element));
        tempPosts.forEach(post => {
            posts.add(post); 
        });
        var tempComments = model.comments.filter((comment) => comment.content.toLowerCase().includes(element));
        tempComments.forEach(comment => {
            const p = commentToPostMap[comment.commentID];
            if (p) {
                posts.add(p);
            }
        });
    });

    posts.delete(undefined);

    var userPosts = [];
        
    if(user === null || user === undefined || user.posts === null || user.posts === undefined){
        userPosts = [];
    }else{
        for (let c in user.communities) {
            let community = model.communities.find((community) => community._id === user.communities[c]);
            if (community && community.postIDs){
                community.postIDs.forEach((p) => {
                    model.posts.forEach((post) => post._id === p._id ? userPosts.push(post) : console.log("nope"));    
                });
            }
        }
    }

    let missingPosts = model.posts.filter((post) => !userPosts.some((userPost) => userPost._id === post._id));
    const sorted_user_posts = () => {
        switch(sort_Method) {
            case "newest":
                return [...userPosts].sort((a,b) => new Date(b.postedDate) - new Date(a.postedDate));
            case "oldest":
                return [...userPosts].sort((a,b) => new Date(a.postedDate) - new Date(b.postedDate));
            case "active":
                return Active_sort({posts: [...userPosts], model: model});
            default:
        }
    };
    const sort_remaining_post = () => {
        switch(sort_Method) {
            case "newest":
                return [...missingPosts].sort((a,b) => new Date(b.postedDate) - new Date(a.postedDate));
            case "oldest":
                return [...missingPosts].sort((a,b) => new Date(a.postedDate) - new Date(b.postedDate));
            case "active":
                return Active_sort({posts: [...missingPosts], model: model});
            default:
        }
    };

    const default_sort_user = sorted_user_posts();
    const default_sort_remaining = sort_remaining_post();

    const default_sort = [...default_sort_user, ...default_sort_remaining];
    
    if(posts.size === 0){
        return(
            <div className = "sub-content">
                <div className = "page-view-header">
                <div style = {{display: "flex", flexDirection: "column"}}>
                    <h3>NO RESULTS FOR: {searchQuerry}</h3>
                    <div className = "post-count">Post Count: {posts.size}</div>
                </div>
                <div className = "button-group">
                <button className = "standard-button" onClick = {() => set_Sort_Method("newest")}>Newest</button>
                <button className = "standard-button" onClick = {() => set_Sort_Method("oldest")}>Oldest</button>
                <button className = "standard-button" onClick = {() => set_Sort_Method("active")}>Active</button>
                </div>
            </div>
        </div>
            )
    }
    return(
        <div className = "sub-content">
            <div className = "page-view-header">
                <div style = {{display: "flex", flexDirection: "column"}}>
                    <h3>RESULTS FOR: {searchQuerry}</h3>
                    <div className = "post-count">Post Count: {posts.size}</div>
                </div>
                <div className = "button-group">
                <button className = "standard-button" onClick = {() => set_Sort_Method("newest")}>Newest</button>
                <button className = "standard-button" onClick = {() => set_Sort_Method("oldest")}>Oldest</button>
                <button className = "standard-button" onClick = {() => set_Sort_Method("active")}>Active</button>
                </div>
            </div>
            <div className = "divider"></div>
            {(user === null || user === undefined) &&
                <div className = "post-listings">
                    {default_sort.map((post) => (
                        <CraftShortPost post={post} communityPost={false} model={model} setView={setView} set_select_post_id={set_selected_post_id}/>
                    ))}
                </div>
            }
            {(user !== null) &&
                <>
                <div className = "post-listings">
                {default_sort_user.map((post) => (
                    <CraftShortPost post={post} communityPost={false} model={model} setView={setView} set_select_post_id={set_selected_post_id}/>
                ))}
                </div>
                {(default_sort_user.length > 0) && <div className = "big-divider"></div>}

                <div className = "post-listings">
                    {default_sort_remaining.map((post) => (
                        <CraftShortPost post={post} communityPost={false} model={model} setView={setView} set_select_post_id={set_selected_post_id}/>
                    ))}
                </div>
                </>
                }
        </div>

    )
    }

    function HomeView({model, setView, set_selected_post_id, user}){
        const posts = model.posts;
        const [sort_Method, set_Sort_Method] = useState("newest");
        var userPosts = [];
        
        if(user === null || user === undefined || user.posts === null || user.posts === undefined){
            userPosts = [];
        }else{
            for (let c in user.communities) {
                let community = model.communities.find((community) => community._id === user.communities[c]);
                if (community && community.postIDs){
                    community.postIDs.forEach((p) => {
                        model.posts.forEach((post) => post._id === p._id ? userPosts.push(post) : console.log("nope"));    
                    });
                }
            }
        }

        console.log(userPosts);

        let missingPosts = model.posts.filter((post) => !userPosts.some((userPost) => userPost._id === post._id));
        const sorted_user_posts = () => {
            switch(sort_Method) {
                case "newest":
                    return [...userPosts].sort((a,b) => new Date(b.postedDate) - new Date(a.postedDate));
                case "oldest":
                    return [...userPosts].sort((a,b) => new Date(a.postedDate) - new Date(b.postedDate));
                case "active":
                    return Active_sort({posts: [...userPosts], model: model});
                default:
            }
        };
        const sort_remaining_post = () => {
            switch(sort_Method) {
                case "newest":
                    return [...missingPosts].sort((a,b) => new Date(b.postedDate) - new Date(a.postedDate));
                case "oldest":
                    return [...missingPosts].sort((a,b) => new Date(a.postedDate) - new Date(b.postedDate));
                case "active":
                    return Active_sort({posts: [...missingPosts], model: model});
                default:
            }
        };

        const default_sort_user = sorted_user_posts();
        const default_sort_remaining = sort_remaining_post();

        const default_sort = [...default_sort_user, ...default_sort_remaining];
        console.log(default_sort_user);
        return (
            <div className = "sub-content">
                <div className = "page-view-header">
                    <div> 
                        <h3>All Posts</h3>
                        <div>{posts.length} posts</div>
                    </div>
                    <div className = "button-group">
                        <button className = "standard-button" onClick = {() => set_Sort_Method("newest")}>Newest</button>
                        <button className = "standard-button" onClick = {() => set_Sort_Method("oldest")}>Oldest</button>
                        <button className = "standard-button" onClick = {() => set_Sort_Method("active")}>Active</button>
                    </div>
                </div>
                <div className = "divider"></div>
                {(user === null || user === undefined) &&
                <div className = "post-listings">
                    {default_sort.map((post) => (
                        <CraftShortPost post={post} communityPost={false} model={model} setView={setView} set_select_post_id={set_selected_post_id}/>
                    ))}
                </div>
                }
                {(user !== null) &&
                <>
                <div className = "post-listings">
                {default_sort_user.map((post) => (
                    <CraftShortPost post={post} communityPost={false} model={model} setView={setView} set_select_post_id={set_selected_post_id}/>
                ))}
                </div>

                {default_sort_user.length > 0 && <div className = "big-divider"></div>}

                <div className = "post-listings">
                    {default_sort_remaining.map((post) => (
                        <CraftShortPost post={post} communityPost={false} model={model} setView={setView} set_select_post_id={set_selected_post_id}/>
                    ))}
                </div>
                </>
                }
            </div>
        )
    }

    function Grab_all_comments({commentIDs, model}){
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
                comments.push(comment);
                if (comment.commentIDs && comment.commentIDs.length > 0){
                    let children = Grab_all_comments({commentIDs: comment.commentIDs,model: model});
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

    function Check_post({commentIDs, look_for, model}){
        // console.log("initial");
        // console.log(commentIDs);
        if (!commentIDs || commentIDs.length === 0){
            return false;
        }

        return commentIDs.some((id) => {
            let comment;
            model.comments.forEach((c) => id._id === c._id ? comment = c : console.log("do nothing"));

            // console.log("comment then look_for");

            if (comment){
                if (comment._id === look_for._id){
                    console.log("true");
                    console.log(look_for._id);
                    return true
                }
                else if (comment.commentIDs && comment.commentIDs.length > 0){
                    if (Check_post({commentIDs: comment.commentIDs, look_for: look_for, model: model})){
                        console.log("true");
                        console.log(look_for._id);
                        return true;
                    }
                    // console.log("children are");
                    // console.log(children);
                }
            }
            return false;
        });
        // console.log("Comments at end");
        // console.log(comments);
    }

    function Active_sort({posts, model}){

        // console.log(posts);
        let arr = posts.map(post => {
            // console.log(post.commentIDs);
            console.log("post is");
            console.log(post);
            const pool = Grab_all_comments({commentIDs: post.commentIDs, model: model});
            // console.log("pool is: ");
            // console.log(pool);
            const sortedComments = Sort_comment_new_old({comment_ids: pool, model: model});
            // console.log("sorted is");
            // console.log(sortedComments);
            return sortedComments.length > 0 ? sortedComments[0] : null;
        }).filter(Boolean);

        // console.log("before sort");
        // console.log(arr);

        // arr.forEach((comment) => console.log(comment.commentedDate));
        arr.sort((a,b) => new Date(b.commentedDate) - new Date(a.commentedDate));
        let noComments = posts.filter(post => !post.commentIDs || post.commentIDs.length === 0);
        let hasComments = posts.filter(post => post.commentIDs || post.commentIDs.length > 0);
        noComments.sort((a,b) => new Date(b.postedDate) - new Date(a.postedDate));

        let result = [];
        arr.forEach((comment) => {
            // console.log("Comment:" + comment._id)
            hasComments.forEach((po) => {
                if (po.commentIDs.length === 0){
                }
                else{
                    // (p.commentIDs.forEach((commentID) => comment._id.toString() === commentID._id.toString() ? result.push(p) : console.log("do nothing")));
                    // console.log(p.commentIDs);
                    if (Check_post({commentIDs: po.commentIDs, look_for: comment, model: model})){
                        result.push(po);
                    }
                }
            });
        });
        
        result.push(...noComments);
        console.log("active sort done");
        return result;
    }


    function Postpageview({model, postID, setView, setModel, set_selected_post_comment, set_selected_post_id, user, setUserView}){
        // console.log("Gets to here");

        useEffect(() => {
            incrementView(postID).then((newPost) => {
                setModel((prevModel) => {
                    return {
                        ...prevModel,
                        posts: prevModel.posts.map((post) => {
                            if (post._id === postID) {
                                return { ...post, views: newPost.views };
                            }
                            return post;
                        })
                    };
                });
            }).catch(error => {
                console.log(error);
            });
        }, [postID, setModel]);

        console.log(model.posts);
        let post = model.posts.find((post) => post._id === postID);
        var community;
        model.communities.forEach((c) =>{
            c.postIDs.find((p) => p._id === postID ? community = c : null);
        });
        var linkFlair;
        if(post.linkFlairID != null){
            linkFlair = model.linkFlairs.find(linkFlair => linkFlair._id === post.linkFlairID);
        }else{
            linkFlair = "";
        }
        console.log("running post view");

        const handle_add_comment = () => {
            setView("add-comment")
            set_selected_post_id(postID)
            set_selected_post_comment(postID)
        }

        const handle_add_comment_reply = (commentID) => {
            setView("add-comment")
            set_selected_post_id(postID)
            set_selected_post_comment(commentID)
        }

        const handleUpVote = async () => {
            try{
                const newPost = await votePost(post._id, user._id, 'up');
                console.log(newPost);
                setModel((prevModel) => {
                    return{
                        ...prevModel,
                        posts: prevModel.posts.map((p) => {
                            if(p._id === newPost._id){
                                return { ...p, upVotes: newPost.upVotes, downVotes: newPost.downVotes, votes : newPost.votes };
                            }else{
                                return p;
                            }
                        })
                    }
                });

                const newRep = await userVoteReputation( user._id, post.postedBy, post._id, 'up');
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
    
                const newUser = await userVotePosts(user._id, post._id, 'up');
                setModel((prevModel) => {
                    return{
                        ...prevModel,
                        users: prevModel.users.map((u) => {
                            if(u._id === newUser._id){
                                return { ...u, votes_post : newUser.votes_post};
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

        console.log(post.postedBy);
        
        const handleDownVote = async () => {
            try {
                const newPost = await votePost(post._id, user._id, 'down');
                setModel((prevModel) => {
                    return{
                        ...prevModel,
                        posts: prevModel.posts.map((p) => {
                            if(p._id === newPost._id){
                                return { ...p, downVotes : newPost.downVotes, upVotes : newPost.upVotes, votes : newPost.votes };
                            }else{
                                return p;
                            }
                        })
                    }
                });

                const newRep = await userVoteReputation(user._id, post.postedBy, post._id, 'down');
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
                                    reputation : newRep.reputation
                                }
                            }
                            else{
                                return p
                            }
                        })
                    }
                });

                const newUser = await userVotePosts(user._id, post._id, 'down');
                setModel((prevModel) => {
                    return{
                        ...prevModel,
                        users: prevModel.users.map((u) => {
                            if(u._id === newUser._id){
                                return { ...u, votes_post : newUser.votes_post };
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
        // console.log("PostID: " + postID)
        // console.log("Post is: " + postID)
        // console.log("before: " + post.views);
        // console.log("Community is: " + community.name);
        // console.log("after: " + post.views);
        // console.log(Sort_comment_new_old({comment_ids: post.commentIDs, model: model}))

        return (
            <div className = "sub-content">
                <div className = "post-view-header">
                    <div className = "post-meta-data">
                        <h2>{community.name}</h2>
                        <span>•</span>
                        <div><TimeStamp date = {post.postedDate}/></div>
                    </div>
                    <div className = "community-creation-date">{model.users.find((user) => user._id === post.postedBy).username}</div>
                    <h3 className = "community-des">{post.title}</h3>
                    <div className = "post-flair">{linkFlair !== "" ? linkFlair.content : ""}</div>
                    <div className = "post-content">{validateLink(post.content)}</div>
                    <div className = "community-stats">
                        <div className = "post-count">{post.views} Views</div>
                        <span>•</span>
                        <div className = "post-count"><CountComments post_ID = {postID} model = {model}/> Comments</div>
                        <span>•</span>
                        {user !== null && user.reputation >= 50 && <button
                        onClick = {() => handleUpVote()}>
                            ▲ Up Vote {post.upVotes}
                        </button>}
                        <span>•</span>
                        {user !== null && user.reputation >= 50 && <button
                        onClick = {() => handleDownVote()}> 
                            ▼ down votes: {post.downVotes}
                        </button>} 
                    </div>
                    <button className = "standard-button" 
                    onClick={() => { if (user !== null) { handle_add_comment(); } }}
                    disabled={user === null}
                    >Add Comment</button>
                    <div className = "divider"></div>
                </div>
                <div>
                    <CreateComments setModel={setModel} user={user}comment_ids = {post.commentIDs} indent = {0} model = {model} handler={handle_add_comment_reply}/>
                </div>
            </div>
        )
    }

function ProfileView({model, setModel, userView, setView, setEdit, admin, setUserView}){
    const all_users = model.users;
    const user_posts = model.posts.filter((post) => post.postedBy.toString() === userView._id.toString());
    const user_communities = model.communities.filter((community) => community.createdBy.toString() === userView._id.toString());
    const user_comments = model.comments.filter((comment) => comment.commentedBy.toString() === userView._id.toString());

    console.log("I'm HERE");
    if (admin === true){
        console.log("OK");
    }
    else{
        console.log("not ok");
    }

    const [tab, setTab] = useState(admin !== null ? "Users" : "Posts");
    console.log(user_posts);
    console.log("___________________");
    console.log(user_communities);
    console.log("___________________");
    console.log(user_comments);

    console.log("LOOK HERE");
    console.log(tab);

    const handle_return_to_admin = () => {
        switch_User(admin._id).then((new_user) => {
            setUserView(new_user);
            setView("profile");
        })
    }

    return (
        <div className="sub-content">
            <div className="post-view-header">
                <div className = "post-meta-data">
                    <h2>{userView.username}</h2>
                    <span>•</span>
                    <div>{userView.email}</div>
                </div>
                <div>Member since: <TimeStamp date = {userView.createdAt}/></div>
                <div>Reputation: {userView.reputation}</div>
            </div>
            
            <div className="divider"></div>
            <div>
                <div>
                    {admin !== null && userView._id === admin._id && (<button className={`${tab === "Users" ? 'selected' : 'standard-button'}`} onClick={() => setTab("Users")}>Users</button>)}
                    <button className={`${tab === "Posts" ? 'selected' : 'standard-button'}`} onClick={() => setTab("Posts")}>Posts</button>
                    <button className={`${tab === "Communities" ? 'selected' : 'standard-button'}`} onClick={() => setTab("Communities")}>Communities</button>
                    <button className={`${tab === "Comments" ? 'selected' : 'standard-button'}`} onClick={() => setTab("Comments")}>Comments</button>
                    {admin !== null && (
                    <div className="admin-controls">
                        <button className="standard-button" onClick={handle_return_to_admin}>
                            Return to Admin Profile
                        </button>
                    </div>)}
                </div>
            </div>
            <div className="divider"></div>
            <div style = {{width: "100%"}}>
                {tab === "Users" && userView._id === admin._id && <ProfileUsers model = {model} setModel={setModel} userView={userView} all_users={all_users} setView={setView} setEdit={setEdit} setUserView={setUserView} admin={admin}/>}
                {tab === "Posts" && <ProfilePosts model = {model} setModel={setModel} userView={userView} user_posts={user_posts} setView={setView} setEdit={setEdit}/>}
                {tab === "Communities" && <ProfileCommunities model = {model} setModel={setModel} userView={userView} user_communities={user_communities} setView={setView} setEdit={setEdit}/>}
                {tab === "Comments" && <ProfileComments model = {model} setModel={setModel} userView={userView} user_comments={user_comments} setView = {setView} setEdit = {setEdit}/>}
            </div>
        </div>
    );
}

function ProfileUsers({model, setModel, userView, all_users, setView, setEdit, setUserView, admin}){
    const handle_select_user = (user) => {
        switch_User(user._id).then((new_user) => {
            setUserView(new_user); 
            setView("profile");
        })
    }; 
    
    const handle_delete_button = (user) => {
        if(window.confirm("Are you sure you want to delete this comment? This action cannot be undone.")){
            delete_user(model, setModel, setView, user);
        }
    };

    console.log("I AM HERE");
    console.log(all_users);
    return (
        <div className="profile-posts">      
            {all_users.length === 0 ? (
                <p className="no-posts-message">No Users On Phreddit.</p>
            ) : (
                <div className="post-links-container">
                    {all_users.filter((user) => admin._id !== null && user._id !== admin._id).map(user => (
                        <div key={user._id} className="post-item">
                            <div className="user-info-container" style={{ display: 'flex', alignItems: 'center' }}>
                                <a href="#" className="post-title-link" 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handle_select_user(user);
                                    }}
                                >
                                    {user.username}
                                </a>
                                <button className="action-button" style={{ marginLeft: '10px', padding: '2px 8px',fontSize: '0.8rem',borderRadius: '4px'}} onClick={(e) => handle_delete_button(user)}>delete
                                </button>
                            </div>
                            <div className="post-meta">
                                <span className="user-email">Email: {user.email}</span>
                                <span className="user-reputation">• Reputation: {user.reputation}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}




function ProfilePosts({model, setModel, userView, user_posts, setView, setEdit}){
    
    const handle_select_post = (post) => {setEdit(post); setView("post-edit")}; 

    return (
    <div className="profile-posts">      
      {user_posts.length === 0 ? (<p className="no-posts-message">No posts created yet.</p>) : 
      (<div className="post-links-container">
          {user_posts.map(post => (
            <div key={post._id} className="post-item">
              <a href="#" className="post-title-link" 
                onClick={(e) => {
                  e.preventDefault();
                  handle_select_post(post);
                }}> {post.title}
              </a>
              <div className="post-meta">
                <span className="post-date">Posted: {new Date(post.postedDate).toLocaleDateString()}</span>
                <span className="post-stats">
                  • {post.views} views • {post.upVotes} upvotes • {post.downVotes} downvotes
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfileCommunities({model, setModel, userView, user_communities, setView, setEdit}){
    console.log(user_communities);
    const handle_select_community = (community) => {setEdit(community); setView("community-edit")}; 

    return (
    <div className="profile-posts">      
      {user_communities.length === 0 ? (<p className="no-posts-message">No communities created yet.</p>) : 
      (<div className="post-links-container">
          {user_communities.map(community => (
            <div key={community._id} className="post-item">
              <a href="#" className="post-title-link" 
                onClick={(e) => {
                  e.preventDefault();
                  handle_select_community(community);
                }}> {community.name}
              </a>
              <div className="post-meta">
                <span className="post-date">Made: {new Date(community.startDate).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Grab_all_comments2(commentIDs, model){
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
                    let children = Grab_all_comments2(comment.commentIDs, model);
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

function grab_post(model, comment){
    let post = null;
    model.posts.forEach((postt) => {
        const commentIDs = Grab_all_comments2(postt.commentIDs, model);
        console.log("LOOK HERE");
        console.log(commentIDs);
        if (commentIDs.includes(comment)){
            post = postt;
        }
    });
    return post;
}

function ProfileComments({model, setModel, userView, user_comments, setView, setEdit}){
    const handle_select_comment = (comment) => {
        if (comment) {setEdit(comment); setView("comment-edit");}
    }; 

    return (
        <div className="profile-posts">      
            {user_comments.length === 0 ? (<p className="no-posts-message">No comments created yet.</p>) : 
                (<div className="post-links-container">
                    {user_comments.map(comment => {
                        const post = grab_post(model, comment._id);
                        const commentPreview = comment.content.length > 20 ? comment.content.substring(0, 20) + "..." : comment.content;
                            
                        return (
                            <div key={comment._id} className="post-item">
                                <a href="#" className="post-title-link" 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handle_select_comment(comment);
                                    }}>{post ? post.title : "Unknown Post"}: "{commentPreview}"
                                </a>
                                <div className="post-meta">
                                    <span className="post-date">Commented: {new Date(comment.commentedDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}


 export {CommunityView, SearchPageResults, HomeView, Postpageview, CountComments, ProfileView, grab_post} ;