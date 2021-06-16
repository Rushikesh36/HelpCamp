const mongoose = require('mongoose');
const { Schema } = mongoose;

const usersubs182Schema = new Schema({
    userpincode : [Number],
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

const UserSubs182 = mongoose.model('UserSubs182', usersubs182Schema);

module.exports = UserSubs182;