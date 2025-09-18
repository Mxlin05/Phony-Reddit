import axios from "axios";


async function addPost(post) {
  try {
    // console.log("goes here");
    const response = await axios.post("http://localhost:8000/api/posts", post);
    return response.data;
  } catch (error) {
    console.error("Error adding post:", error);
    throw error;
  }
}

async function addCommunity(community) {
  try {
    const response = await axios.post("http://localhost:8000/api/community", community);
    return response.data;
  } catch (error) {
    console.error("Error adding community:", error);
    throw error;
  }
}

async function addLinkFlair(linkFlair) {
  try {
    const response = await axios.post("http://localhost:8000/api/linkFlairs", linkFlair);
    return response.data;
  } catch (error) {
    console.error("Error adding link flair:", error);
    throw error;
  }
}

async function addComment(comment) {
  try {
    const response = await axios.post("http://localhost:8000/api/comments", comment);
    return response.data;
  } catch (error) {
    console.error("Error adding link comment:", error);
    throw error;
  }
}

async function incrementView(postID){
  try {
    const response = await axios.put(`http://localhost:8000/api/posts/${postID}/view-increment`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function addCommentToComment(findCommentID, addCommentID) {
  try {
    const response = await axios.put("http://localhost:8000/api/comments/addComment", { findCommentID, addCommentID });
    return response.data;
  } catch (error) {
    console.error("Error adding comment to comment:", error);
    throw error;
  }
}

async function addCommentToPost(postID, commentID) {
  try {
    const response = await axios.put("http://localhost:8000/api/posts/addComment", { postID, commentID });
    return response.data;
  } catch (error) {
    console.error("Error adding comment to post:", error);
    throw error;
  }
}

async function addPostToCommunity(communityID, postID) {
  try {
    
    const response = await axios.put("http://localhost:8000/api/community/addPost", { communityID, postID });
    return response.data;
  } catch (error) {
    console.error("Error adding post to community:", error);
    throw error;
  }
}

async function getLinkFlairs() {
  try {
    const response = await axios.get("http://localhost:8000/api/linkFlairs");
    return response;
  } catch (error) {
    console.error("Error fetching link flairs:", error);
    throw error;
  }
}
async function getPosts() {
  try {
    const response = await axios.get("http://localhost:8000/api/posts");
    return response;
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
}
async function getCommunities() {
  try {
    const response = await axios.get("http://localhost:8000/api/community");
    return response;
  } catch (error) {
    console.error("Error fetching communities:", error);
    throw error;
  }
}
async function getComments() {
  try {
    const response = await axios.get("http://localhost:8000/api/comments");
    return response;
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
}

async function addUser(user){
  try {
    const response = await axios.post("http://localhost:8000/api/users", user);
    return response.data;    
  } catch (error){
    console.log(error);
    throw error;
  }
}

async function getUsers(){
  try {
    const response = await axios.get("http://localhost:8000/api/users");
    return response.data;
  } catch (error){
    console.log(error);
    throw error;
  }
}

async function checkPassword(user, password){
  try {
    const response = await axios.post("http://localhost:8000/api/users/auth", { user, password });
    return response.data;
  } catch (error){
    console.log(error);
    throw error;
  }
}

async function joinCommunity(community, userID){
  try {
    const response = await axios.post("http://localhost:8000/api/users/community/add", { userID, community });
    return response.data;
  } catch (error){
    console.log(error.response?.data || error.message);
    console.log(userID);
    throw error;
  }
}

async function leaveCommunity(communityID, userID){
  try {
    const response = await axios.post("http://localhost:8000/api/users/community/remove", { userID, communityID });
    return response.data;
  } catch (error){
    console.log(error);
    throw error;
  }
}

async function addUserToCommunity(communityID, user){
  try {
    const response = await axios.post("http://localhost:8000/api/community/addUser", { communityID, user });
    return response.data;
  } catch (error){
    console.log(error);
    throw error;
  }
}

async function removeUserFromCommunity(communityID, userID){
  try {
    const response = await axios.post("http://localhost:8000/api/community/removeUser", { communityID, userID });
    return response.data;
  } catch (error){
    console.log(error);
    throw error;
  }
}

async function editCommunity(communityID, name, description){
  try {
    const response = await axios.post("http://localhost:8000/api/community/edit/com", { communityID, name, description });
    return response.data;
  } catch (error){
    console.log(error);
    throw error;
  }
}

async function deleteCommunity(communityID){
  try {
    const response = await axios.post("http://localhost:8000/api/community/delete/com", { communityID });
    return response.data;
  } catch (error){
    console.log(error);
    throw error;
  }
}

async function editComment(commentID, description){
   try {
    const response = await axios.post("http://localhost:8000/api/comments/edit/comment", { commentID, description });
    return response.data;
  } catch (error){
    console.log(error);
    throw error;
  }
}
// async function upVoteUser(userID){
//   try {
//     const response = await axios.post("http://localhost:8000/api/users/rep/Inc", {userID});
//     return response.data;
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// }

// async function downVoteUser(userID){
//   try {
//     const response = await axios.post("http://localhost:8000/api/users/rep/Dec", {userID});
//     return response.data;
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// }

async function votePost(postID, userId, voteType){
  try {
    const response = await axios.post("http://localhost:8000/api/posts/Voteposts", {postID, userId, voteType});
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function voteComment(commentID, userId, voteType){
  try {
    const response = await axios.post("http://localhost:8000/api/comments/Votecomments", {commentID, userId, voteType});
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function userVotePosts(userID, postID, voteType){
  try {
    const response = await axios.post("http://localhost:8000/api/users/Vote/post", {userID, postID, voteType});
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function userVoteReputation(userID, ownerID, postID, voteType){
  try {
    const response = await axios.post("http://localhost:8000/api/users/Vote/reputation", { userID, ownerID, postID, voteType});
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function userVoteReputationCom(userID, ownerID, commentID, voteType){
  try {
    const response = await axios.post("http://localhost:8000/api/users/Vote/com/reputation", { userID, ownerID, commentID, voteType});
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function userVoteComments(userID, commentID, voteType){
  try {
    const response = await axios.post("http://localhost:8000/api/users/Vote/comment", {userID, commentID, voteType});
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function editPost(postID, title, content, linkFlairID){
  try {
    console.log("new here");
    if (linkFlairID !== null){
      linkFlairID = linkFlairID._id;
    }
    const response = await axios.post("http://localhost:8000/api/posts/edit", {postID, title, content, linkFlairID});
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function changeCommunity(oldCommunityID, newCommunityID, postID){
  try {
    const response = await axios.post("http://localhost:8000/api/community/edit", {oldCommunityID, newCommunityID, postID});
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function delete_post(postID, communityID, commentIDs){
  try {
    const response = await axios.post("http://localhost:8000/api/posts/delete", {postID, communityID, commentIDs});
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
// async function upVotePost(postID){
//   try {
//     const response = await axios.post("http://localhost:8000/api/posts/upVote/Inc", {postID});
//     return response.data;
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// }

// async function downVotePost(postID){
//   try {
//     const response = await axios.post("http://localhost:8000/api/posts/upVote/Dec", {postID});
//     return response.data;
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// }

async function upVoteComment(commentID){
  try {
    const response = await axios.post("http://localhost:8000/api/comments/upVote/Inc", {commentID});
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function deleteComment(commentID, allCom){
  try {
    const response = await axios.post("http://localhost:8000/api/comments/delete/comment", { commentID, allCom });
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function downVoteComment(commentID){
  try {
    const response = await axios.post("http://localhost:8000/api/comments/upVote/Dec", {commentID});
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function addNewCommunityToUser(userID, community){
  try{
    const response = await axios.put("http://localhost:8000/api/users/addCommunity", {userID, community});
    return response.data;
  } catch(error){
    console.log(error);
  }
}

async function logIn(username, password){
  try {
    console.log("gets here");
    const response = await axios.post("http://localhost:8000/api/users/login", {username, password},  { withCredentials: true });
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function switch_User(targetUserId){
  try {
    console.log("gets here");
    const response = await axios.post("http://localhost:8000/api/users/switch", { targetUserId },  { withCredentials: true });
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function logOut(){
  try {
    const response = await axios.post("http://localhost:8000/api/users/logout", {},  { withCredentials: true });
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function dellete_user(userID){
  try {
    const response = await axios.post("http://localhost:8000/api/users/delete/profile", {userID});
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export { logIn, logOut, editPost, dellete_user, changeCommunity, userVoteReputation,   deleteComment, userVoteReputationCom, editComment, switch_User, editCommunity, deleteCommunity, delete_post, addNewCommunityToUser, upVoteComment, downVoteComment, votePost, voteComment, userVotePosts, userVoteComments, joinCommunity, leaveCommunity, addUserToCommunity, removeUserFromCommunity, checkPassword, getUsers, addPost, incrementView, addCommunity, addLinkFlair, addComment, addCommentToComment, addCommentToPost, addPostToCommunity, getLinkFlairs, getPosts, getCommunities, getComments, addUser };
