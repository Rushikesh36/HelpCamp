const mongoose = require('mongoose');
const { Schema } = mongoose;

const adcommentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    post:{
        type: Schema.Types.ObjectId,
        ref: 'Help'
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

const HelpComment = mongoose.model('HelpComment', adcommentSchema);
module.exports = HelpComment;