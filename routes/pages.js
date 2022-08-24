const express = require('express');
const router = express.Router();

// Get Page model
const Page = require('../models/page');

/*
 * GET /
 */
router.get('/', function (req, res) {


    Page.findOne({slug: 'home'}, function (err, page) {

        return res.render('home', {
            title: "Home",
        });
    });
    
});


router.get('/products', function (req, res) {

        return res.render('product_view', {
            title: "products",
        });

    
});

/*
 * GET a page
 */
router.get('/:slug', function (req, res) {

    var slug = req.params.slug;

    Page.findOne({slug: slug}, function (err, page) {
        if (err){
            console.log(err);
            // res.render('404');
        }
        
        // if not is not present then redirect it to home.
        if (!page) {
            console.log('slug');
            return res.render('404');
        } else {
            return res.render('index', {
                title: page.title,
                content: page.content
            });
        }
    });

    
});

// Exports
module.exports = router;


