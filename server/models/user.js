const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
    {
        firstName  : { type : String, required : true},
        secondName : { type : String, required : true},
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        createdAt: { type: Date, default: Date.now },
        communities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Community' }],
        posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
        comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
        reputation: { type: Number, required : true, default : 100 },
        votes_post: [{
                post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
                type: { type: String, enum: ['up', 'down'], required: true }
            }],
        votes_comment: [{
            comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', required: true },
            type: { type: String, enum: ['up', 'down'], required: true }
        }]
    },
    {
        toJSON: {
            virtuals: true,
            transform(doc, ret) {
                delete ret.__v;
                return ret;
            },
        },
        toObject: {
            virtuals: true,
            transform(doc, ret) {
                delete ret.__v;
                return ret;
            },
        },
    }
)

userSchema.virtual('url').get(function () {
    return '/users/' + this._id;
});


userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

userSchema.methods.isValidPassword = async function (inputPassword) {
    return bcrypt.compare(inputPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);