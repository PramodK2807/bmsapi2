let mongoose = require('mongoose');

let categorySchema = new mongoose.Schema({
    name: {
        type:String,
        required: true,
        unique: true
    }
})


module.exports = mongoose.model('categories', categorySchema)