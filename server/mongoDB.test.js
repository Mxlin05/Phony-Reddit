global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;


const mongoose = require('mongoose');
const Post = require('./models/posts');
const Comment = require('./models/comments');

async function Grab_all_comments(commentIDs){
    let comments = [];

    if (!commentIDs || commentIDs.length === 0){
        return comments;
    }

    for (const id of commentIDs) {
        const comId = id._id || id;
        const comment = await Comment.findById(comId);
        console.log(comment);
        console.log(comment.commentIDs);

        if (comment){
            comments.push(comment._id);
            if (comment.commentIDs && comment.commentIDs.length > 0){
                const children = await Grab_all_comments(comment.commentIDs);
                comments = comments.concat(children);
            }
        }
    }

    return comments;
}


const { delete_post } = require('./routes/posts');

describe('Post Deletion', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/phreddit_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });
  
  afterEach(async () => {
    await Post.deleteMany({});
    await Comment.deleteMany({});
  });
  
  afterAll(async () => {
    await mongoose.disconnect();
  });
  
  test('delete post', async () => {
    const userId = new mongoose.Types.ObjectId();
    const post = new Post({
      title: 'Test',
      content: 'Test',
      postedBy: userId,
      postedDate: new Date()
    });
    await post.save();
    
    const comment1 = new Comment({
      content: 'Comment 1',
      commentedBy: userId,
      commentedDate: new Date()
    });
    await comment1.save();
    
    const comment2 = new Comment({
      content: 'Comment 2',
      commentedBy: userId,
      commentedDate: new Date()
    });
    await comment2.save();
    
    const comment3 = new Comment({
      content: 'Comment 3',
      commentedBy: userId,
      commentedDate: new Date()
    });
    await comment3.save();

    const comment4 = new Comment({
        content: 'Comment 4',
        commentedBy: userId,
        commentedDate: new Date()
    });
    await comment4.save();

    const comment5 = new Comment({
        content: 'Comment 5',
        commentedBy: userId,
        commentedDate: new Date()
    });
    await comment5.save();
    
    comment3.commentIDs = [comment5._id];
    await comment3.save();

    comment1.commentIDs = [comment3._id, comment4._id];
    await comment1.save();
    
    post.commentIDs = [comment1._id, comment2._id];
    await post.save();
    
    const allCommentIds = await Grab_all_comments(post.commentIDs);
    expect(allCommentIds.length).toBe(5);
    
    await delete_post(post._id, null, allCommentIds);
    
    const deletedPost = await Post.findById(post._id);
    expect(deletedPost).toBeNull();
    
    for (const comID of allCommentIds) {
        const deletedComment = await Comment.findById(comID);
        expect(deletedComment).toBeNull();
    }
  });
});
