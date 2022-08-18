const express = require('express');
const router = express.Router();
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
var resizeImg = require('resize-img');
const auth = require('../config/auth');
var isAdmin = auth.isAdmin;
var path = require('path');
var publicPath = path.join(path.dirname(__dirname),'public');
// console.log("STATIC FOlder",express.static, publicPath,"dirname");
// Get Product model
const Product = require('../models/product');

// Get Category model
const Category = require('../models/category');

/*
 * GET products index
 */
router.get('/', function (req, res) {
    var count;

    Product.count(function (err, c) {
        count = c;
    });

    Product.find(function (err, products) {
        return res.render('admin/products', {
            products: products,
            count: count
        });
    });
});

/*
 * GET add product
 */
router.get('/add-product', function (req, res) {

    var title = "";
    var desc = "";
    var subCategory = "";
    var originalPrice = "";
    var discountedPrice = "";
    var inStock = "";

    Category.find(function (err, categories) {
        return res.render('admin/add_product', {
            title: title,
            desc: desc,
            categories: categories,
            subCategory: subCategory,
            originalPrice: originalPrice,
            discountedPrice: discountedPrice,
            inStock: inStock
        });
    });
});

/*
 * POST add product
 */
router.post('/add-product', function (req, res) {

    var imageFile =(req.files!=null && typeof req.files.image !== "undefined")? req.files.image.name : "";
    
    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value.').notEmpty();
    req.checkBody('subCategory', 'Sub category must have a value.').notEmpty();
    req.checkBody('originalPrice', 'originalPrice must have a value.').isDecimal(); 
    req.checkBody('discountedPrice', 'discountedPrice must have a value.').isDecimal(); 
    req.checkBody('inStock', 'In Stock must have a value.').isDecimal(); 
    req.checkBody('image', 'You must upload an image').isImage(imageFile);
    
    
    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var category = req.body.category;
    var subCategory = req.body.subCategory;
    var originalPrice = req.body.originalPrice;
    var discountedPrice = req.body.discountedPrice;
    var inStock = req.body.inStock;

    var errors = req.validationErrors();
    
    if (errors) {
        Category.find(function (err, categories) {
            return res.render('admin/add_product', {
                errors: errors,
                title: title,
                desc: desc,
                categories: categories,
                subCategory: subCategory,
                originalPrice: originalPrice,
                discountedPrice: discountedPrice,
                inStock: inStock
            });
        });
    } else {
        Product.findOne({slug: slug}, function (err, product) {
            if (product) {
                req.flash('danger', 'Product title exists, choose another.');
                Category.find(function (err, categories) {
                    return res.render('admin/add_product', {
                        errors: errors,
                        title: title,
                        desc: desc,
                        categories: categories,
                        subCategory: subCategory,
                        originalPrice: originalPrice,
                        discountedPrice: discountedPrice,
                        inStock: inStock
                    });
                });
            } else {

                var originalPrice2 = parseFloat(originalPrice).toFixed(2);
                var discountedPrice2 = parseFloat(discountedPrice).toFixed(2);
                var inStock2 = parseFloat(inStock).toFixed(2);
                
                var product = new Product({
                    title: title,
                    slug: slug,
                    desc: desc,
                    originalPrice: originalPrice2,
                    discountedPrice: discountedPrice2,
                    category: category,
                    subCategory: subCategory,
                    inStock: inStock2,
                    image: imageFile
                });

                // try{

                    product.save(function (err) {
                        if (err)
                        return console.log(err);
                //     console.log(" PRESENT 1");
                    // mkdirp('public/product_images/' + product._id, function (err) {
                    //     console.log("hi");
                    //     return console.log(err);
                    // });


                    mkdirp(publicPath + '/product_images/' + product._id).then(made =>{
                        console.log(`directory created ${made}`)

                        if (imageFile != "") {
                            var productImage = req.files.image;
                            
                            path = 'public/product_images/' + product._id + '/' + imageFile;
                            console.log("path ",path);
                            
                            productImage.mv(path, function (err) {
                                console.log("File not moved err");
    
                                return console.log(err);
                            });
                        }
                        
                    });
                    
                    mkdirp(publicPath + '/product_images/' + product._id + '/gallery').then(made =>
                        console.log(`directory created ${made}`));

                    mkdirp(publicPath + '/product_images/' + product._id + '/gallery/thumbs').then(made =>
                        console.log(`directory created ${made}`));

                        console.log("imageFile",imageFile);


                    //     // var path = publicPath + '/product_images/' + product._id + '/' + imageFile;
                    //     // var path = publicPath + '\\product_images\\' + product._id + '\\' + imageFile;
                    //     // var path = `D:/Mohit/nodejs/shop-buzz/public/product_images/${product._id}/${imageFile}`;
                    //     // var path = `D:/Mohit/nodejs/shop-buzz/public/product_images/${product._id}/${imageFile}`;
                    //     // var path = publicPath + '/product_images/' + product._id;
                    //     // var path = path.join(__dirname+ '/../public', 'product_images/')+imageFile;
                    //     // console.log(`path ${__dirname}/public/product_images/${imageFile}`);
                    //     path = 'public/product_images/' + product._id + '/' + imageFile;
                    
                    
                    
                    
                    req.flash('success', 'Product added!');
                    return res.redirect('/admin/products');
                });
            // }
            // catch(error)
            // {
                //     return console.log(error);
                //     req.flash('danger', 'Something went wrong!');
            //     Category.find(function (err, categories) {
                //         return res.render('admin/add_product', {
            //             errors: errors,
            //             title: title,
            //             desc: desc,
            //             categories: categories,
            //             subCategory: subCategory,
            //             originalPrice: originalPrice,
            //             discountedPrice: discountedPrice,
            //             inStock: inStock
            //         });
            //     });
            
            // }
            
            
            }
        });
    }
    
});

/*
 * GET edit product
*/
router.get('/edit-product/:id', function (req, res) {

    var errors;

    if (req.session.errors)
    errors = req.session.errors;
    req.session.errors = null;
    
    Category.find(function (err, categories) {

        Product.findById(req.params.id, function (err, p) {
            if (err) {
                console.log(err);
                return res.redirect('/admin/products');
            } else {
                var galleryDir = 'public/product_images/' + p._id + '/gallery';
                var galleryImages = null;

                fs.readdir(galleryDir, function (err, files) {
                    if (err) {
                        console.log(err);
                    } else {
                        galleryImages = files;
                        
                        return res.render('admin/edit_product', {
                            title: p.title,
                            errors: errors,
                            desc: p.desc,
                            categories: categories,
                            subCategory: p.subCategory,
                            category: p.category.replace(/\s+/g, '-').toLowerCase(),
                            originalPrice: parseFloat(p.originalPrice).toFixed(2),
                            discountedPrice: parseFloat(p.discountedPrice).toFixed(2),
                            inStock: parseFloat(p.inStock).toFixed(2),
                            image: p.image,
                            galleryImages: galleryImages,
                            id: p._id
                        });
                    }
                });
            }
        });

    });

});

/*
 * POST edit product
*/
router.post('/edit-product/:id', function (req, res) {
    
    var imageFile =(req.files!=null && typeof req.files.image !== "undefined")? req.files.image.name : "";

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value.').notEmpty();
    req.checkBody('subCategory', 'Sub category must have a value.').notEmpty();
    req.checkBody('originalPrice', 'Price must have a value.').isDecimal(); 
    req.checkBody('discountedPrice', 'Price must have a value.').isDecimal(); 
    req.checkBody('inStock', 'In Stock must have a value.').isDecimal(); 
    req.checkBody('image', 'You must upload an image').isImage(imageFile);
    
    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var category = req.body.category;
    var subCategory = req.body.subCategory;
    var originalPrice = req.body.originalPrice;
    var discountedPrice = req.body.discountedPrice;
    var inStock = req.body.inStock;
    var pimage = req.body.pimage;
    var id = req.params.id;
    
    var errors = req.validationErrors();

    if (errors) {
        req.session.errors = errors;
        return res.redirect('/admin/products/edit-product/' + id);
    } else {
        Product.findOne({slug: slug, _id: {'$ne': id}}, function (err, p) {
            if (err)
                console.log(err);

            if (p) {
                req.flash('danger', 'Product title exists, choose another.');
                return res.redirect('/admin/products/edit-product/' + id);
            } else {
                Product.findById(id, function (err, p) {
                    if (err)
                        console.log(err);

                    p.title = title;
                    p.slug = slug;
                    p.desc = desc;
                    p.subCategory = subCategory;
                    p.originalPrice = parseFloat(originalPrice).toFixed(2);
                    p.discountedPrice = parseFloat(discountedPrice).toFixed(2);
                    p.inStock = parseFloat(inStock).toFixed(2);
                    p.category = category;
                    if (imageFile != "") {
                        p.image = imageFile;
                    }

                    p.save(function (err) {
                        if (err)
                            console.log(err);

                        if (imageFile != "") {
                            if (pimage != "") {
                                fs.remove('public/product_images/' + id + '/' + pimage, function (err) {
                                    if (err)
                                        console.log(err);
                                });
                            }

                            var productImage = req.files.image;
                            var path = 'public/product_images/' + id + '/' + imageFile;

                            productImage.mv(path, function (err) {
                                return console.log(err);
                            });

                        }

                        req.flash('success', 'Product edited!');
                        return res.redirect('/admin/products/edit-product/' + id);
                    });

                });
            }
        });
    }

});

/*
 * POST product gallery
 */
router.post('/product-gallery/:id', function (req, res) {

    var productImage = req.files.file;
    var id = req.params.id;
    var path = 'public/product_images/' + id + '/gallery/' + req.files.file.name;
    var thumbsPath = 'public/product_images/' + id + '/gallery/thumbs/' + req.files.file.name;

    productImage.mv(path, function (err) {
        if (err)
            console.log(err);
        try{

            resizeImg(fs.readFileSync(path), {width: 100, height: 100}).then(function (buf) {
                fs.writeFileSync(thumbsPath, buf);
            });
        }
        catch(error){
            console.log(error);
        }
    });

    return res.sendStatus(200);

});

/*
 * GET delete image
 */
router.get('/delete-image/:image', function (req, res) {

    var originalImage = 'public/product_images/' + req.query.id + '/gallery/' + req.params.image;
    var thumbImage = 'public/product_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;

    fs.remove(originalImage, function (err) {
        if (err) {
            console.log(err);
        } else {
            fs.remove(thumbImage, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    req.flash('success', 'Image deleted!');
                    return res.redirect('/admin/products/edit-product/' + req.query.id);
                }
            });
        }
    });
});

/*
 * GET delete product
 */
router.get('/delete-product/:id', function (req, res) {

    var id = req.params.id;
    var path = 'public/product_images/' + id;

    fs.remove(path, function (err) {
        if (err) {
            console.log(err);
        } else {
            Product.findByIdAndRemove(id, function (err) {
                console.log(err);
            });
            
            req.flash('success', 'Product deleted!');
            return res.redirect('/admin/products');
        }
    });

});

// Exports
module.exports = router;


