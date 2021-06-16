const mongoose = require('mongoose');
const { Schema } = mongoose;

const usersubs2Schema = new Schema({
    userpincode : [Number],
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

const UserSubs2 = mongoose.model('UserSubs2', usersubs2Schema);

module.exports = UserSubs2;