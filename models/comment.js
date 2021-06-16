const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    post:{
        type: Schema.Types.ObjectId,
        ref: 'Post'
    },
    comment: {
        type: String,
        required: [true, "Please Enter a Comment"]
    },
    time : { 
        type : String        
    },
    date : { 
        type : String
    }
});

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;