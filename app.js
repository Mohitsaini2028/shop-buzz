const express = require('express');
const path = require('path');
const port = process.env.PORT || 3000;
require('dotenv').config()
const config = require('./config/database');
const session = require('express-session');
const expressValidator = require('express-validator');
const fileUpload = require('express-fileupload');
const passport = require('passport');
// const multer = require('multer');
// const storage = multer.diskStorage({
//     destination: cb(null, '')                                //callback function
// })


// Initialize app
const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

// Set global errors varaible
app.locals.errors = null;

// Get Page Model
const Page = require('./models/page');

// Get all pages to pass to header.ejs
Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
    if (err) {
        console.log(err);
    } else {
        app.locals.pages = pages;
    }
});

// Get Category Model
const Category = require('./models/category');

// Get all categories to pass to header.ejs
Category.find(function (err, categories) {
    if (err) {
        console.log(err);
    } else {
        app.locals.categories = categories;
    }
});

// Express fileUpload middleware  - getting file from 'form' because express or body-parser didn't handle it
app.use(fileUpload());                              


// parse application/x-www-form-urlencoded
app.use(express.urlencoded({extended: false}));
app.use(express.json());

// Session setup
app.use(session({
    secret: "asf5467dnma23n#kz@cnj2gaskj3cln",
    resave: true,
    saveUninitialized: true

}))

// Express Validator middleware
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
                , root = namespace.shift()
                , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    },
    customValidators: {
        isImage: function (value, filename) {
            var extension = (path.extname(filename)).toLowerCase();
            switch (extension) {
                case '.jpg':
                    return '.jpg';
                case '.jpeg':
                    return '.jpeg';
                case '.png':
                    return '.png';
                case '.webp':
                    return '.webp';
                case '.avif':
                    return '.avif';
                case '':
                    return '.jpg';
                default:
                    return false;
            }
        }
    }
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    return next();
});

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//  '*' is because we want it to available for everywhere. 
app.get('*', function(req,res,next) {
    res.locals.cart = req.session.cart;
    res.locals.user = req.user || null;
    next();
 });

// Set routes
const pages = require('./routes/pages.js');
const adminpages = require('./routes/admin_pages.js');
const adminCategories = require('./routes/admin_categories.js');
const adminProducts = require('./routes/admin_products.js');
const products = require('./routes/products.js');
const cart = require('./routes/cart.js');
const user = require('./routes/users.js');
const search = require('./routes/search.js');


app.use('/admin/pages', adminpages);
app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProducts);
app.use('/products', products);
app.use('/cart', cart);
app.use('/users', user);
app.use('/search', search);
app.use('/', pages);




// Start the server
const server = app.listen(port, ()=> {
    console.log(`Server Listening at http://localhost:${port}`)
})