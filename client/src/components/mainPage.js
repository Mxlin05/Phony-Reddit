import "../css/mainPage.css"; 
import React from "react";
import { CommunityView, SearchPageResults, HomeView, Postpageview, ProfileView} from "./pageView";
import { useState, useEffect } from "react";
import { CreatePost, CreateNewCommunity, Addcomment, EditPost, EditCommunity, EditComment} from "./createPageView";
import { getCommunities, getComments, getPosts, getLinkFlairs, getUsers, logOut } from "./asyncHelpers";
import { LoginPage, SignUp, WelcomePage } from './loginPage.js';



// import axios from 'axios'; 

//NOTES 
// need to make phreadit take back to home page
//need to make create post button stay organe when in create post page and need to make it send to page
//need to make search work when enter

//need to make community buyttson stay collor and workj, same with hjomoe button and create community



//makes the banner component
function Banner({view, setView, setSearchQuerry, setUserView, userView, admin, setAdmin}) {

  return (
    //class name
    <div className="banner">
      <button className = "app-name"
      onClick = {() => {if(userView !== null) {logOut(); setUserView(null);}setView("welcome");}}
      style = {{outline: "none", border: "none", cursor: "pointer", background: "transparent"}}
      >Phreddit</button>
      <input type="text" placeholder="Search Phreddit..." className="search-box" 
      onKeyDown={(event) =>{
        if(event.key === "Enter"){
          setSearchQuerry(event.target.value);
          setView("search");
        }
      }}/>
      <div className = "button-group" >        
        {userView !== null && <button className = "standard-button"
          onClick = {() => {setView("welcome"); setUserView(null); setAdmin(null); logOut();}}
        > Log Out</button>}
        <button 
          onClick={() => {if(userView !== null){setView("create post")}}}
          disabled={userView === null}
          className={`${view === "create post" ? 'selected' : 'standard-button'}`}
          style = {{cursor: "pointer"}}
        >Create Post</button>
        <button onClick = {() => {if(userView !== null) {setView("profile")} }} className = 'profile-button'>{userView === null ? "Guest" : userView.username}</button>
      </div>

    </div>
  );
}

function MainPage({setView, searchQuerry, view, selectedCommunityID, setSelectedCommunityID, userView, setUserView, admin, setAdmin}) {
  //gets communities data from the model
  const [model, setModel] = useState({
    communities: [],
    posts: [],
    comments: [],
    linkFlairs: [],
  });

  
  const [communities, setCommunities] = useState([]);
  const [post, setPost] = useState([]);
  const [comments, setComments] = useState([]);
  const [users, setUsers] = useState([]);
  const [linkFlairs, setlinkFlairs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);



  //set communities
  useEffect(() => {

    let mounted = false;

    const fetch = () => {
      if(!mounted){
        getCommunities()
          .then((response) => {
            const communityData = response.data;
            const parsedCommunities = communityData.map((community) => ({
              _id: community._id,
              name: community.name,
              description: community.description,
              postIDs: community.postIDs,
              startDate: community.startDate,
              members: community.members,
              createdBy : community.createdBy,
            }));
            console.log("Fetched communities:", parsedCommunities);
            setCommunities(parsedCommunities);
          })
          .catch((error) => {
            console.log("there was an error");
            console.error(error);
          });
      }
  }
    fetch();
    return () => {
      mounted = true;
    };
  }, []);


  //set posts
  useEffect(() => {

    let mounted = false;

    const fetch = () => {
      if(!mounted){
        getPosts()
        .then((response) => {
          const postData = response.data;
          const posts = postData.map((post) => {
            return {
              _id : post._id,
              title : post.title,
              content : post.content,
              linkFlairID : post.linkFlairID === null ? null : post.linkFlairID._id,
              postedBy : post.postedBy,
              postedDate : post.postedDate,
              views : post.views,
              commentIDs : post.commentIDs,
              upVotes : post.upVotes,
              downVotes : post.downVotes,
              votes : post.votes
            };
          });
          setPost(posts);
        })
        .catch((error) => {
          console.log("there was an error");
          console.error(error);
        });
      }
  }
    fetch();
    return () => {
      mounted = true;
    };
  }, []);

  //set linkFlairs
  useEffect(() => {

    let mounted = false;

    const fetch = () => {
      if(!mounted){
        getLinkFlairs()
        .then((response) => {
          const linkFlairData = response.data;
          const linkFlairs = linkFlairData.map((linkFlair) => {
            return {
              _id : linkFlair._id,
              content : linkFlair.content,
            };
          });
          setlinkFlairs(linkFlairs);
        })
        .catch((error) => {
          console.log("there was an error");
          console.error(error);
        });
      }
  }
    fetch();
    return () => {
      mounted = true;
    };
  }, []);

  //set comments
  useEffect(() => {

    let mounted = false;

    const fetch = () => {
      if(!mounted){
        getComments()
        .then((response) => {
          const commentData = response.data;
          const comments = commentData.map((comment) => {
            return {
              _id : comment._id,
              content : comment.content,
              commentIDs : comment.commentIDs,
              commentedBy : comment.commentedBy,
              commentedDate : comment.commentedDate, 
              upVotes : comment.upVotes,
              downVotes : comment.downVotes,
              votes : comment.votes
            };
          });
          setComments(comments);
        })
        .catch((error) => {
          console.log("there was an error");
          console.error(error);
        });
      }
  }
    fetch();
    return () => {
      mounted = true;
    };
  }, []);

  useEffect(() => {

    let mounted = false;

    const fetch = () => {
      if(!mounted){
        getUsers().then((response) => {
          const userData = response
            const users = userData.map((user) => {
              return {
                _id : user._id,
                username : user.username,
                email : user.email,
                password : user.password,
                createdAt : user.createdAt,
                communities : user.communities,
                posts : user.posts,
                comments : user.comments,
                reputation : user.reputation,
                votes_post : user.votes_post,
                votes_comment : user.votes_comment
              };
            });
            setUsers(users);
        })
        .catch((error) => {
          console.log("there was an error");
          console.log(error);
        })
      }
    }
    fetch();
    return () => {
      mounted = true;
    };
  }, []);

  
  useEffect(() => {
    setModel({
      communities: communities,
      posts: post,
      comments: comments,
      linkFlairs: linkFlairs,
      users: users,
    }
  );
  setIsLoading(false);}, [communities, post, comments, linkFlairs, users]);

  // console.log("OVER HERE");
  // console.log(admin);

  const [selected_post_comment, set_selected_post_comment] = useState(null);
  const [selected_post_id, set_selected_post_id] = useState(null);
  const [edit, setEdit] = useState(null);
  // const [post_order, set_post_order] = useState([]);

  const handleCommunityClick = (communityID) => {
    setSelectedCommunityID(communityID); 
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  //makes the htm
  return (
    <div className="main-container">
    <div className="left-nav-bar">
      <button
      className = {`${view === "home" ? 'selected' : 'standard-button'}`}
      onClick = {() => {
        setView("home");
      }}>Home</button>

      <span className = "divider"></span>

      <h3>Communities</h3>
      <button
      className={`${view === "create community" ? 'selected' : 'standard-button'}`}
      onClick={() => { if(userView !== null){setView("create community");}
      }}
      disabled={userView===null}>Create Community</button>
      <ul className="community-list">
        {
          (() => {
            var allCommunities = [];
            if (userView === null || userView.communities === null || userView.communities.length === 0) {
              allCommunities = model.communities;
            } else {
              const communities = userView.communities.map((communityID) => {
                const community = model.communities.find((community) => community._id === communityID);
                return community ? community : console.log("do nothing");
              }).filter(Boolean);


              if (communities === null){
                console.log("this");
              }

              if (model.communities === null){
                console.log("this2");
              }
              
              console.log("this3");
              console.log(model.communities);
              console.log(communities);
              const missingCommunities = model.communities.filter((community) => {
                // Skip null community objects
                if (!community) return false;
                
                return community._id !== null &&
                  !communities.some((userCommunity) => {
                    // Skip null userCommunity objects
                    return userCommunity && 
                          userCommunity._id !== null && 
                          userCommunity._id.toString() === community._id.toString();
                  });
              });
              allCommunities = [...communities, ...missingCommunities];
            }

            if (allCommunities.length === 0) {
              return <li>No Communities</li>;
            }
            return allCommunities.map((community) => (
              <li key={community._id} className="community-item">
                <button
                  onClick={() => {
                    handleCommunityClick(community._id);
                    setView("community");
                  }}
                  className={`${selectedCommunityID === community._id && view === "community" ? 'selected' : 'standard-button'}`}
                >
                  {community.name}
                </button>
              </li>
            ));
          })()
        }
      </ul>
    </div>
    <div style = {{width: "100%"}}>
    {view === "home" && <HomeView model = {model} setView={setView} set_selected_post_id={set_selected_post_id} user={userView}/>}
    {view === "community" && <CommunityView user={userView} c={selectedCommunityID} model={model} setView={setView} set_selected_post_id={set_selected_post_id} setModel={setModel} setUserView={setUserView}/>}
    {view === "search" && <SearchPageResults user = {userView} searchQuerry={searchQuerry} model={model} setView={setView} set_selected_post_id={set_selected_post_id}/>}
    {view === "create community" && <CreateNewCommunity user={userView} setUserView={setUserView} model={model} setView={setView} setSelectedCommunityID={setSelectedCommunityID} setModel={setModel}/>}
    {view === "create post" && <CreatePost model={model} setView={setView} setModel={setModel} userView={userView}/>}
    {view === "add-comment" && <Addcomment model = {model} postID = {selected_post_id} post_comment = {selected_post_comment} setView={setView} set_selected_post_id={set_selected_post_id} setModel={setModel} userView={userView}/>} 
    {view === "post" && <Postpageview setUserView= {setUserView} user={userView} model = {model} postID={selected_post_id} setView = {setView} setModel={setModel} set_selected_post_id={set_selected_post_id} set_selected_post_comment={set_selected_post_comment}/>}
    {view === "login" && <LoginPage setLogin={setView} setUserView={setUserView} model = {model} setAdmin={setAdmin}/>}
    {view === "signup" && <SignUp model = {model} setLogin={setView} setModel={setModel} setUserView={setUserView}/>}
    {view === "profile" && <ProfileView setUserView = {setUserView} model = {model} setModel = {setModel} userView = {userView} setView = {setView} setEdit = {setEdit} admin={admin}/>}
    {view === "post-edit" && <EditPost model = {model} setModel = {setModel} userView = {userView} setView = {setView} post = {edit}/>}
    {view === "community-edit" && <EditCommunity model = {model} setView = {setView} setSelectedCommunityID = {setSelectedCommunityID} setModel = {setModel} user = {userView} setUserView = {setUserView} edit = {edit}/>}
    {view === "comment-edit" && <EditComment model = {model} comment = {edit} setModel = {setModel} setView = {setView} userView = {userView} set_selected_post_id = {set_selected_post_id}/>}
    {view === 'welcome' && <WelcomePage setLogin={setView}/>}


    </div>
  </div>
  );
}


/*
      {view == "home" && <HomeView model = {model} setView={setView} set_selected_post_id={set_selected_post_id}/>}
      


      */



export {Banner, MainPage};