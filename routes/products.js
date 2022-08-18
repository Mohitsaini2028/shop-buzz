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

/*
 * GET all products/
 */
router.get('/', isUser, function (req, res) {

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

    Category.findOne({slug: categorySlug}, function (err, cat) {
        Product.find({category: categorySlug}, function (err, products) {
            if (err)
                console.log(err);

            return res.render('cat_products', {
                title: cat.title,
                products: products
            });
        });
    });

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

            fs.readdir(galleryDir, function (err, files) {
                if (err) {
                    console.log(err);
                } else {
                    galleryImages = files;

                    res.render('product', {
                        title: product.title,
                        p: product,
                        galleryImages: galleryImages,
                        loggedIn: loggedIn
                    });
                }
            });
        }
    });

});


// Exports
module.exports = router;


