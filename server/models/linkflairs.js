// LinkFlair Document Schema

const mongoose = require('mongoose');

const LinkFlairSchema = new mongoose.Schema({


    content : { type : String, required : true, maxLength : 30 }
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


LinkFlairSchema.virtual("url").get(function () {
    return "/linkflairs/" + this._id;
});

module.exports = mongoose.model("LinkFlair", LinkFlairSchema);
