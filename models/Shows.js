let mongoose = require('mongoose');

let showSchema = new mongoose.Schema({
    title: {
        type:String,
        required: true
    },
    category: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'category',
        required: true
    },
    img: {
        type:String,
        required: true
    },
    movie_description:{
        type:String
    },
    year:{
        type:Number,
        required: true
    },
    subscription:{
        type:Number,
        required: true
    }

})

module.exports = mongoose.model('shows', showSchema);