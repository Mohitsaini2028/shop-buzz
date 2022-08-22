const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const fs = require('fs-extra');
const auth = require('../config/auth');
var isUser = auth.isUser;

// Get Page model
// var Product = require('../models/Product');
const Product = mongoose.model('Product')

// Get Category model
const Category = require('../models/category');
const Review = require('../models/review');
const review = require('../models/review');

/*
 * GET all products/
 */
router.get('/', function (req, res) {
// router.get('/', isUser, function (req, res) {
    console.log(req.query.max, req.query.min);
    Product.find(function (err, products) {
        if (err)
            console.log(err);

        return res.render('products_view', {
            title: "All products",
            products: products
        });
        // res.render('all_products', {
        //     title: "All products",
        //     products: products
        // });
    });
    
});


/*
 * GET products by category
 */
router.get('/:category', function (req, res) {

    var categorySlug = req.params.category;

    try{

        Category.findOne({slug: categorySlug}, function (err, cat) {
            if (err || cat==undefined){
                console.log("category not found", err);
                return res.render('404');
            }
        Product.find({category: categorySlug}, function (err, products) {
            if (err)
                return res.render('404');
            
            return res.render('cat_products', {
                title: cat.title,
                products: products
            });
        });
    });
    }
    catch(err){
        console.log("category error", err);
        return res.render('404');
    }
    
});
 
router.get('/:category/:product', function (req, res) {

    var galleryImages = null;
    var loggedIn = (req.isAuthenticated()) ? true : false;
    // var loggedIn = true;

    Product.findOne({slug: req.params.product}, function (err, product) {
        if (err) {
            console.log(err);
        } else {
            var galleryDir = 'public/product_images/' + product._id + '/gallery';

            fs.readdir(galleryDir,async function (err, files) {
                if (err) {
                    console.log(err);
                } else {
                    galleryImages = files;

                    var reviews = await Review.find({product: product._id}).populate("user");
                    res.render('product', {
                        title: product.title,
                        p: product,
                        galleryImages: galleryImages,
                        loggedIn: loggedIn,
                        reviews: reviews
                    });
                }
            });
        }
    });

});


router.post('/review/:productId', async function (req, res) {

    var rating = parseInt(req.body.rating);
    var reviewText = req.body.review;
    var pId = req.params.productId;
    product = await Product.findById(pId);

    
    console.log(typeof rating);
    console.log((product.ratingCount*product.rating + rating));
    console.log((product.ratingCount + 1));
    console.log((product.ratingCount*product.rating + rating)/(product.ratingCount + 1));
    // 
    product.rating = ((product.ratingCount*product.rating + rating)/(product.ratingCount + 1)).toFixed(2);
    product.ratingCount += 1; 

    
    product.save(function (err) {
        if (err)
        return console.log(err);
    })  


    // 2*4 + 4.5 /  2 + 1

    var review = new Review({
        product: product._id ,
        user: req.user,
        rating: rating,
        review: reviewText
    });

    review.save(function (err) {
        if (err)
        return console.log(err);
    })  
        

    return res.redirect('/products/');
    // console.log(req.body.rating, req.body.review, req.params.productId);
    // return res.json();

});

// Exports
module.exports = router;


