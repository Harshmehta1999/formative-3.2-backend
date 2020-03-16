// Day 5, full CRUD for chef collection - only

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fileUpload = require ("express-fileupload");
const bodyParser = require("body-parser");
// import db login details
const myconn = require("./connection");

// every single collection will need a model
const Chef = require("./models/chef-model");
const Gardner = require("./models/gardner-model");

// init express
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload())
app.use(express.static("public"));
// end init express

// init database stuff
//setup database connection
mongoose.connect(myconn.atlas, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("connected", e => {
  console.log("Mongoose connected");
});

db.on("error", () => console.log("Database error"));
// end database stuff

// for now we have nothing on the top level
app.get("/", function(req, res) {
  return res.json({ result: false });
});
//end top level

// start of routes
const router = express.Router();
app.use("/api", router);

// find and return a single Chef based upon _id

router.get("/chef/:id", (req, res) => {
  Chef.findOne({ _id: req.params.id }, function(err, objFromDB) {
    //exit now if any kind of error

    if (err) return res.json({ result: false });

    res.send(objFromDB);
  });
});

// define CRUD api routes:
// CREATE
router.post("/chef", (req, res) => {
  var chefModel = new Chef();

  var data = req.body;
  console.log("++++ ", data);

  Object.assign(chefModel, data);

  chefModel.save().then(
    chef => {
      return res.json({ result: true });
      //OR
      // return res.json(chefModel);
    },
    () => {
      return res.json({ result: false });
    }
  );
});

// READ
router.get("/chef", (req, res) => {
  Chef.find().then(
    chefFromDataBase => {
      console.table(chefFromDataBase);
      return res.json(chefFromDataBase);
    },
    error => {
      console.log("error of some kind");
    }
  );
});

//UPDATE
router.put("/chef/:id", (req, res) => {
  Chef.findOne({ _id: req.params.id }, function(err, objFromDB) {
    if (err) return res.json({ result: false });
    var data = req.body;
    Object.assign(objFromDB, data);
    objFromDB.save();
    return res.json({ result: true });
    //OR
    // return res.send(objFromDB);
  });
});

// DELETE
router.delete("/chef/:id", (req, res) => {
  // as a promise
  Chef.deleteOne({ _id: req.params.id }).then(
    () => {
      return res.json({ result: true });
    },
    () => {
      return res.json({ result: false });
    }
  );
});

// deal with any unhandled urls on the api endpoint - place at end
router.get("/*", (req, res) => {
  return res.json({ result: "not a valid endpoint" });
});

// ditto for app route
app.get("/*", (req, res) => {
  return res.json({ result: "not a valid endpoint" });
});

// and finally,  lets listen
const port = 3002;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});


// my functions
function updateAfterFileUpload(req, res, objFromDB, fileName) {
  // form data from frontend is stored in the req.body
  var data = req.body;
  Object.assign(objFromDB, data);
  // if fileName param is null use default.jpg
  objFromDB.profile_image = fileName || "default.jpg";

  objFromDB.save().then(
    response => {
      res.json({
        result: true
      });
    },
    error => {
      res.json({
        result: false
      });
    }
  );
}
// end  my functions

// 3 new routes to deal with image uploads
// 1. update for chef with form image
router.put("/chef/with-form-image/:id", (req, res) => {
  Chef.findOne({ _id: req.params.id }, function(err, objFromDB) {
    if (err)
      return res.json({
        result: false
      });

    if (req.files) {
      var files = Object.values(req.files);
      var uploadedFileObject = files[0];
      var uploadedFileName = uploadedFileObject.name;
      var nowTime = Date.now();
      var newFileName = `${nowTime}_${uploadedFileName}`;

      uploadedFileObject.mv(`public/${newFileName}`).then(
        params => {
          updateAfterFileUpload(req, res, objFromDB, newFileName);
        },
        params => {
          updateAfterFileUpload(req, res, objFromDB);
        }
      );
    } else {
      updateAfterFileUpload(req, res, objFromDB);
    }

    /////////
  });
});


// 2. update for chef with form image
router.post("/chef/with-form-image/", (req, res) => {
  console.log("hello");
  var chef = new Chef()
 

    if (req.files) {
      var files = Object.values(req.files);
      var uploadedFileObject = files[0];
      var uploadedFileName = uploadedFileObject.name;
      var nowTime = Date.now();
      var newFileName = `${nowTime}_${uploadedFileName}`;

      uploadedFileObject.mv(`public/${newFileName}`).then(
        params => {
          updateAfterFileUpload(req, res, chef, newFileName);
        },
        params => {
          updateAfterFileUpload(req, res, chef);
        }
      );
    } else {
      updateAfterFileUpload(req, res, chef);
    }

    /////////

});



// 3 add single image to express - return filename, does not write to mongodb
router.put("/chef/upload", (req, res) => {
  if (req.files) {
    var files = Object.values(req.files);
    var uploadedFileObject = files[0];
    var uploadedFileName = uploadedFileObject.name;
    var nowTime = Date.now();
    var newFileName = `${nowTime}_${uploadedFileName}`;

    uploadedFileObject.mv(`public/${newFileName}`, function() {
      // update app
      res.json({ filename: newFileName, result: true });
    });
  } else {
    res.json({ result: false });
  }
});