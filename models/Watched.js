const mongoose = require('mongoose');

const watchedSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users',
        required: true
    },
    movie:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'movies',
        required: true
    }
  
}, {timestamps:true})


module.exports = mongoose.model("watched", watchedSchema);