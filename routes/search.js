const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');


// Get Page model
const Product = mongoose.model('Product')

// Get Category model
const Category = require('../models/category');
const product = require('../models/product');



router.post('/', async function (req, res) {

    var searchTerm = req.body.search;
    searchTerm = searchTerm.trim();

    console.log(searchTerm);
    const products = [];

    var productCat = await Product.find({$or: [{title: {$regex: searchTerm, $options : "i"} }, {subCategory: {$regex: searchTerm, $options : "i"}}, {category: {$regex: searchTerm, $options : "i"}}]}); 


    
    for (const p of productCat) { 
        products.push(p);
    }
 

    console.log("product length", products.size, products);

            return res.render('search_product', {
                title: "Search Result",
                products: products,
                searchTerm: searchTerm,
            });
     
 

});

router.get('/:slug', function(req, res){
    res.render('404.ejs');
});

// Exports
module.exports = router;