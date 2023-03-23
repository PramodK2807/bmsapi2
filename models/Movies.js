let mongoose = require('mongoose');

let movieSchema = new mongoose.Schema({
    title: {
        type:String,
        required: true
    },
    category: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'categories',
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

module.exports = mongoose.model('movies', movieSchema);