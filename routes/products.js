var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var fs = require('fs-extra');

// Get Page model
// var Product = require('../models/Product');
var Product = mongoose.model('Product')

// Get Category model
var Category = require('../models/category');

/*
 * GET /
 */
router.get('/', function (req, res) {

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
    // var loggedIn = (req.isAuthenticated()) ? true : false;
    var loggedIn = true;

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


