const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const fs = require('fs-extra');
const auth = require('../config/auth');
var isUser = auth.isUser;

// Get Page model
const Product = mongoose.model('Product')

// Get Category model
const Category = require('../models/category');

// Get Review model
const Review = require('../models/review');

/*
 * GET all products/
 */
router.get('/', function (req, res) {

    Product.find(function (err, products) {
        if (err)
            console.log(err);

        return res.render('products_view', {
            title: "All products",
            products: products
        });

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
            if (err){
                console.log(err);
                var products = null 
            }
                            
            return res.render('cat_products', {
                title: cat.title,
                products: products
            });
        });
    });
    }
    catch(err){
        console.log("category error", err);
        console.log(err);
        return res.render('404');
    }
    
});
 
/*
 * GET product view
 */

router.get('/:category/:product', function (req, res) {

    var galleryImages = null;
    var loggedIn = (req.isAuthenticated()) ? true : false;

    Product.findOne({slug: req.params.product}, function (err, product) {
        if (err) {
            console.log(err);
        } else {
            if(product===undefined || product===null){
                console.log("product not found");
                return res.render('404'); 
            }

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

/*
 * POST product review
 */


router.post('/review/:productId', async function (req, res) {

    var rating = parseInt(req.body.rating);
    var reviewText = req.body.review;
    var pId = req.params.productId;
    product = await Product.findById(pId);

    
    console.log(typeof rating);
    console.log((product.ratingCount*product.rating + rating));
    console.log((product.ratingCount + 1));
    console.log((product.ratingCount*product.rating + rating)/(product.ratingCount + 1));

    product.rating = ((product.ratingCount*product.rating + rating)/(product.ratingCount + 1)).toFixed(2);
    product.ratingCount += 1; 

    
    product.save(function (err) {
        if (err)
        return console.log(err);
    })  

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

    req.flash('success', 'Review Added!');    
    return res.redirect(`/products/${product.category}/${product.slug}`);

});


router.get('/delete-review/:id/:prodId', isUser,async function (req, res) {

    
    
    var product = await Product.findById(req.params.prodId);
    
    Review.findByIdAndRemove(req.params.id, function (err, review) {

        if (err){
            console.log(err);
            req.flash('danger', 'Something went wrong!');
            return res.redirect(`/products/${product.category}/${product.slug}`);
        }

        req.flash('success', 'Review deleted!');
        try{
            product.rating = ((product.ratingCount*product.rating - review.rating)/(product.ratingCount - 1)).toFixed(2);
            product.ratingCount -= 1
            product.save()
            return res.redirect(`/products/${product.category}/${product.slug}`);
        }
        catch(err){
            console.log(err);
            req.flash('danger', 'Something went wrong!');
            return res.redirect(`/products/${product.category}/${product.slug}`);
            }
    });

});

// Exports
module.exports = router;