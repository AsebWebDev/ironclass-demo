// require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const User = require("../models/User");
const Class = require("../models/Class");
const bcryptRounds = 10;

mongoose
  .connect("mongodb://heroku_h78624gb:ib53a1a65fpjp2mbq5ud2mup0a@ds253104.mlab.com:53104/heroku_h78624gb", { useNewUrlParser: true })
  // .connect("mongodb://localhost/ironclass", { useNewUrlParser: true })
  // .connect(process.env.MONGODB_URI, { useNewUrlParser: true })
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`);
  })
  .catch(err => {
    console.error("Error connecting to mongo", err);
  });

const salt = bcrypt.genSaltSync(bcryptRounds);
const hashPass = bcrypt.hashSync("test", salt); // FIXME: error on process.env.password


let demoClass = 
  {
    name: "WebDev Jan-Feb 2021",
    city: "Berlin",
    password: hashPass,
  };

let newUsersArr = [];

let admins = [
  {
    firstName: "Andre",
    lastName: "Admin",
    username: ("Andre" + "Admin").toLowerCase(),
    password: bcrypt.hashSync("hireme!", bcrypt.genSaltSync(bcryptRounds)),
    role: "Student",
    admin: true
  },
  {
    firstName: "Malte",
    lastName: "Admin",
    username: ("Malte" + "Admin").toLowerCase(),
    password: bcrypt.hashSync("hireme!", bcrypt.genSaltSync(bcryptRounds)),
    role: "Student",
    admin: true
  }
];

let guest = {
  firstName: "IronGuest",
  lastName: "Teacher",
  username: ("IronGuest" + "Teacher").toLowerCase(),
  password: bcrypt.hashSync("hireme!", bcrypt.genSaltSync(bcryptRounds)),
  role: "Teacher",
  admin: true
};


axios.get('https://randomuser.me/api/?results=25')
  .then((response) => {
    for (let i = 0; i < response.data.results.length; i++){
      let newObj;
      let firstName = response.data.results[i].name.first;
      let lastName = response.data.results[i].name.last;
      let imgUrl = response.data.results[i].picture.thumbnail;
      let username = (firstName + lastName).replace(/\s/g,'').toLowerCase();
      firstName = capitalizeFirstLetter(firstName);
      lastName = capitalizeFirstLetter(lastName);

      newObj = {
        firstName,
        lastName,
        username,
        imgUrl,
        role: "Student"
      };      
      newUsersArr.push(newObj);
    }
  })
  .then(() => {
    let classId, guestId;
    Promise.all([User.deleteMany(), Class.deleteMany()])
    .then (() => User.create(guest))
    .then ((createdGuest) => {
      guestId = createdGuest._id;
      demoClass._teacher = mongoose.Types.ObjectId(guestId);
      Class.create(demoClass)
      .then ((oneClass) => {
        classId = oneClass._id;
        newUsersArr.forEach(item => item._class = mongoose.Types.ObjectId(classId));
        newUsersArr.forEach(item => item.password = oneClass.password);
        newUsersArr[Math.floor(1+Math.random()*newUsersArr.length)].role = "TA";
        admins.forEach(item => newUsersArr.push(item));
      })
      .then(() => User.findByIdAndUpdate(guestId, {_class: mongoose.Types.ObjectId(classId)}))
      .then(() => User.create(newUsersArr))
      .then(() => User.find({role: "TA"}))
      .then((user) => Class.update({_id: user[0]._class}, {$push: { _TA: mongoose.Types.ObjectId(user[0]._id) }}, {safe: true, upsert: true}))
      .then(() => mongoose.disconnect())
      .catch(err => {
        mongoose.disconnect();
        throw err;
      });
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
    
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);

}
