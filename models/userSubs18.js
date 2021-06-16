const mongoose = require('mongoose');
const { Schema } = mongoose;

const usersubs18Schema = new Schema({
    userpincode : [Number],
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

const UserSubs18 = mongoose.model('UserSubs18', usersubs18Schema);

module.exports = UserSubs18;