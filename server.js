/**
*  WEB322 - Assignment 6
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy. 
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites and friends) or distributed to other students.
*  I understand that if caught doing so, I will receive zero on this assignment and possibly 
*  fail the entire course.
*
*  Name: Jasleen Kaur
*  Student ID: 170585210
*  Date: 2023-08-03
*  Cyclic Web App URL: https://poised-plum-jodhpurs.cyclic.app
*  GitHub Repository URL: https://github.com/Jasleen602/web322-app
**/

var authData = require("./auth-service.js");
var express = require("express");
var path = require("path");
var Initialize = require("./store-service.js");
var app = express();
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const upload = multer();
var storeService = require('./store-service.js');
const exphbs = require('express-handlebars');
const clientSessions = require("client-sessions");

cloudinary.config({
    cloud_name: 'dwqwa9tlp',
    api_key: '541754678276293',
    api_secret: 'ubxQ0NoNflgxDRhhl3re3a9lBNs',
    secure: true
});

app.use(express.static('public/css'));

app.use(clientSessions({
  cookieName: "session", // this is the object name that will be added to 'req'
  secret: "Assignment6_web322_Jasleen", // this should be a long un-guessable string.
  duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
  activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
}));

app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

app.engine('.hbs', exphbs.engine({ extname: '.hbs',
helpers: {
    navLink: function (url, options) {
      return (
        '<li calss="nav-item"><a ' +
        (url == app.locals.activeRoute ? ' class="nav-link active" ' : 'class="nav-link" ') +
        ' href="' +
        url +
        '">' +
        options.fn(this) +
        "</a></li>"
      );
    },
    equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
      
    },
}));
app.set('view engine', '.hbs');

var HTTP_PORT = process.env.PORT || 8080;

app.get("/", function (req, res) {
    res.redirect("/shop");
});

app.get("/about", function (req, res) {
    res.render(path.join(__dirname + "/views/about.hbs"));
});



app.get("/shop", async (req, res) => {
    // Declare an object to store properties for the view
    let viewData = {};
  
    try {
      // declare empty array to hold "post" objects
      let items = [];
  
      // if there's a "category" query, filter the returned posts by category
      if (req.query.category) {
        // Obtain the published "posts" by category
        items = await Initialize.getPublishedItemsByCategory(req.query.category);
      } else {
        // Obtain the published "items"
        items = await Initialize.getPublishedItems();
      }
  
      // sort the published items by postDate
      items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
  
      // get the latest post from the front of the list (element 0)
      let post = items[0];
  
      // store the "items" and "post" data in the viewData object (to be passed to the view)
      viewData.items = items;
      viewData.item = item;
    } catch (err) {
      viewData.message = "no results";
    }
  
    try {
      // Obtain the full list of "categories"
      let categories = await Initialize.getCategories();
  
      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
    } catch (err) {
      viewData.categoriesMessage = "no results";
    }
  
    // render the "shop" view with all of the data (viewData)
    res.render("shop", { data: viewData });
  });


  app.get('/shop/:id', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};
  
    try{
  
        // declare empty array to hold "item" objects
        let items = [];
  
        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            items = await Initialize.getPublishedItemsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            items = await Initialize.getPublishedItems();
        }
  
        // sort the published items by postDate
        items.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));
  
        // store the "items" and "item" data in the viewData object (to be passed to the view)
        viewData.items = items;
  
    }catch(err){
        viewData.message = "no results";
    }
  
    try{
        // Obtain the item by "id"
        viewData.item = await Initialize.getItemById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }
  
    try{
        // Obtain the full list of "categories"
        let categories = await Initialize.getCategories();
  
        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }
  
    // render the "shop" view with all of the data (viewData)
    res.render("shop", {data: viewData})
  });

  app.get("/items", ensureLogin, function (req, res) {
    Initialize.getPublishedItems()
        .then((data) => {
            if (data.length > 0) {
                res.render("items", { items: data });
            } else {
                res.render("items", { message: "no results" });
            }
        })
        .catch((err) => {
            res.render("items", { message: "no results" });
        });
});

app.get('/items/category/:Ct', ensureLogin, (req, res) => {
    const category = req.params.Ct;
    storeService.getItemsByCategory(category)
        .then((items) => {
            if (items.length > 0) {
                res.json(items);
            } else {
                res.json({ message: "Error 404!" });
            }
        })
});

app.get("/items/minDate/:postDate", ensureLogin, function (req, res) {
    const minDateStr = req.params.postDate;
  
    Initialize.getItemsByMinDate(minDateStr)
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        res.json({ error:"Error 404!" });
      });
  });
  
  
  
  app.get("/item/:id", function (req, res) {
    const itemId = parseInt(req.params.id);
  
    Initialize.getItemById(itemId)
      .then((item) => {
        res.json(item);
      })
      .catch((err) => {
        res.json({ error: err.message });
      });
  });
  
  app.get("/categories", ensureLogin, function (req, res) {
    Initialize.getCategories()
        .then((data) => {
            if (data.length > 0) {
                res.render("categories", { categories: data });
            } else {
                res.render("categories", { message: "no results" });
            }
        })
        .catch((err) => {
            res.render("categories", { message: "no results" });
        });
});

app.get("/items/add", ensureLogin, (req, res) => {
    storeService.getCategories()
      .then((categories) => {
        res.render("addItem", { categories: categories });
      })
      .catch(() => {
        res.render("addItem", { categories: [] });
      });
  });

app.post('/Items/add', ensureLogin, upload.single("featureImage"), function (req, res, next) {
    if (req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );

                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }

        upload(req).then((uploaded) => {
            processItem(uploaded.url);
        });
        console.log("Uploaded")
    } else {
        processItem("");
    }

    function processItem(imageUrl) {
        req.body.featureImage = imageUrl;

        // TODO: Process the req.body and add it as a new Item before redirecting to /items
        storeService.addItem(req.body)
            .then((newItem) => {
                res.redirect('/items');
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Failed to add item.');
            });

    }

})

app.use(express.urlencoded({extended: true}));

app.get('/categories/add', ensureLogin, (req, res) => {
    res.render(path.join(__dirname + "/views/addCategories.hbs"));
});

app.post('/categories/add', ensureLogin, function (req, res, next) {
    storeService.addCategory(req.body)
      .then((newCategory) => {
        res.redirect('/categories');
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Failed to add category.');
      });
  });

  app.get("/categories/delete/:id", ensureLogin, (req, res) => {
    storeService.deleteCategoryById(req.params.id)
      .then(() => {res.redirect("/categories");
      })
      .catch(() => { res.status(500).send('Unable to Remove Category / Category not found)');
      });
  });

  app.get("/items/delete/:id", ensureLogin, (req, res) => {
    storeService.deleteItemById(req.params.id)
      .then(() => {
        res.redirect("/items");
      })
      .catch(() => {
        res.status(500).send('Failed to destroy item.');
      });
  });

  app.get("/login", (req, res) => {
    res.render("login");
  });

  app.get("/register", (req, res) => {
    res.render("register");
  });

  app.post("/register", (req, res) => {
    authData.registerUser(req.body)
    .then(() => {
      res.render('register', { successMessage: 'User created' });
    })
    .catch((err) => {
      res.render('register', { errorMessage: err, userName: req.body.userName });
    });
 });
 
 app.post("/login", (req, res) => {
  req.body.userAgent = req.get('User-Agent');
  authData.checkUser(req.body)
    .then((user) => {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory
      };
      res.redirect('/items');
    })
    .catch((err) => {
      res.render('login', {errorMessage: err, userName: req.body.userName});
    });
});

app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/");
});

app.get("/userHistory", ensureLogin, (req, res) => {
  res.render("userHistory");
});

app.use((req, res) => {
    res.status(404).render("404");
  });

Initialize.initialize()
  .then(authData.initialize)
  .then(function(){
      app.listen(HTTP_PORT, function(){
          console.log("app listening on: " + HTTP_PORT)
      });
  }).catch(function(err){
      console.log("unable to start server: " + err);
  });
  