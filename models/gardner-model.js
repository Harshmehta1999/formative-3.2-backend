var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// this will be our data base's data structure
var ChefsSchema = new Schema(
  {
    first_name: String,
    last_name: String,
    email: String,
    phone: String,
    address: String
  },
  {
    timestamps: true
  }
);

// singular capitalized name for the mongo collection
module.exports = mongoose.model("Gardner", ChefsSchema);

//https://mongoosejs.com/docs/models.html
