const mongoose = require('mongoose');
const { Schema } = mongoose;

const adSchema = new Schema({
    categories: {
        type: ['hospital','medicines','blood'],
        required: [true, "Categories are required"]
    },
    requirement: {
        type: String,
        required: [true, "Please Specify your Help"]
    },
    location: {
        type: String,
        required: [true, "Location is required"]
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    time : { 
        type : String        
    },
    date : { 
        type : String
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    },
    pincode: {
        type: Number,
        required: [true, "Please Enter a Valid Pincode"]
    }
})

const Help = mongoose.model('Help',adSchema);

module.exports = Help;