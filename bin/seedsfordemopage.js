// To execute this seed, run from the root of the project
// $ node bin/seeds.js

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Class = require("../models/Class");

const bcryptSalt = 10;

mongoose
  .connect("mongodb://heroku_h78624gb:ib53a1a65fpjp2mbq5ud2mup0a@ds253104.mlab.com:53104/heroku_h78624gb", { useNewUrlParser: true })
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`);
  })
  .catch(err => {
    console.error("Error connecting to mongo", err);
  });

let users = [
  {
    firstName: "Andre",
    lastName: "Admin",
    username: ("Andre" + "Admin").toLowerCase(),
    password: bcrypt.hashSync("hp-lenovo", bcrypt.genSaltSync(bcryptSalt)),
    role: "Student",
    admin: true
  },
  {
    firstName: "Malte",
    lastName: "Admin",
    username: ("Malte" + "Admin").toLowerCase(),
    password: bcrypt.hashSync("hp-lenovo", bcrypt.genSaltSync(bcryptSalt)),
    role: "Student",
    admin: true
  }
];

let classes = [];

Promise.all([User.deleteMany(), Class.deleteMany()])
  .then(() => {
    Promise.all([User.create(users), Class.create(classes)])
      .then(values => {
        console.log(`${values[0].length} users created with the following id:`);
        console.log(values[0].map(u => u._id));
        mongoose.disconnect();
      })
      .catch(err => {
        mongoose.disconnect();
        throw err;
      });
  })
  .catch(err => {
    mongoose.disconnect();
    throw err;
  });
