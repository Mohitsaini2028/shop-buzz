const mongoose = require('mongoose');
var Schema = mongoose.Schema;
    
// User Schema
const ReviewSchema = mongoose.Schema({
   
    product: { 
        type: Schema.Types.ObjectId, ref:'ProductSchema'
    },
    user: {
        type: Schema.Types.ObjectId, ref:'User'
    },
    rating: {
        type: Number,
        default: 0
    },
    review: {
        type: String,
        required: true
    }
    
},{ timestamps: true });

const User = module.exports = mongoose.model('Review', ReviewSchema);

