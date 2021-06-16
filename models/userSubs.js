const mongoose = require('mongoose');
const { Schema } = mongoose;

const usersubsSchema = new Schema({
    userpincode : [Number],
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

const UserSubs = mongoose.model('UserSubs', usersubsSchema);

module.exports = UserSubs;