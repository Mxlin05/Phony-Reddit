// Post Document Schema
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({

    title : { type : String, required : true, maxLength : 100},
    content : { type : String, required : true },
    linkFlairID : { type : mongoose.Schema.Types.ObjectId, ref : 'LinkFlair', required : false },
    postedBy : { type : mongoose.Schema.Types.ObjectId, ref: 'User', required : true },
    postedDate : { type : Date, required : true, default : Date.now },
    commentIDs : [{ type : mongoose.Schema.Types.ObjectId, ref : 'Comment', required : false }],
    views : { type : Number, required : true, default : 0 },
    upVotes : { type : Number, required : true, default : 0},
    downVotes : { type : Number, required : true, default : 0 },
    votes: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        type: { type: String, enum: ['up', 'down'], required: true }
    }]
},{
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            delete ret.__v;
            return ret;
        }
    },
    toObject: {
        virtuals: true,
        transform: function (doc, ret) {
            delete ret.__v;
            return ret;
        }
    }
});

postSchema.virtual("url").get(function() {
    return "/posts/" + this._id;
});

module.exports = mongoose.model("Post", postSchema);
