// Comment Document Schema
const mongoose = require('mongoose');


const commentSchema = new mongoose.Schema({

    content : { type : String, required : true, maxLength : 500 },
    commentIDs : [{ type : mongoose.Schema.Types.ObjectId, ref : "Comment", required : false, default : Date.now }],
    commentedBy : { type : mongoose.Schema.Types.ObjectId, ref: 'User', required : true },
    commentedDate : { type : Date, required : true, default : Date.now },
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

commentSchema.virtual("url").get(function() {
    return "/comments/" + this._id;
});

module.exports = mongoose.model("Comment", commentSchema);