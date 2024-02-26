const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const user = new mongoose.Schema({
    user: String,
    pwd: String, 
    id: String
})

const userList = mongoose.model("user", user)
module.exports = userList;