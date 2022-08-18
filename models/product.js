const mongoose = require('mongoose');

// Product Schema
const ProductSchema = mongoose.Schema({
   
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String
    },
    desc: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    subCategory: {
        type: String,
        required: true
    },
    originalPrice:{
        type: Number,
        required: true
    },
    discountedPrice:{
        type: Number,
        required: true
    },
    image: {
        type: String
    },
    rating: {
        type: Number,
        default: 0
    },
    ratingCount: {
        type: Number,
        default: 0
    },
    inStock: {
        type: Number,
        default: 0
    }
    
});

const Product = module.exports = mongoose.model('Product', ProductSchema);

