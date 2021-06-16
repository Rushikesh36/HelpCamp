const mongoose = require('mongoose');
const { Schema } = mongoose;

const subsSchema = new Schema({
    pincode : [Number]
})

const Subs = mongoose.model('Subs', subsSchema);

module.exports = Subs;