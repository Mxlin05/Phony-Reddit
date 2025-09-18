// Community Document Schema
const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({

    name : { type : String, required : true, maxLength : 100 },
    description : { type : String, required : true, maxLength : 500 },
    postIDs : [{ type : mongoose.Schema.Types.ObjectId, ref : 'Post', required : false }],
    startDate : { type : Date, required : true, default : Date.now },
    members : [{type : mongoose.Schema.Types.ObjectId, ref: 'User', default: []}],
    createdBy : { type : mongoose.Schema.Types.ObjectId, ref : 'User', required : true }

},
{
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

communitySchema.virtual("url").get(function () {
    return "/community/" + this._id;
});

communitySchema.virtual("memberCount").get(function () {
    return this.members.length;
});

module.exports = mongoose.model("Community", communitySchema);
