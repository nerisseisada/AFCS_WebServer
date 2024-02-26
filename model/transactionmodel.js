const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionmodel = new mongoose.Schema({
    sDT: {type:String, unique: true}, 
    eDT: String, 
    sLat: Number, 
    sLon: Number, 
    eLat: Number, 
    eLon: Number, 
    cost: Number, 
    distance: Number, 
    cardid: String, 
    busNum: Schema.Types.Mixed,
    admin: String, 
    status: String, 
    balance: Number,
    discount: Number,
    id: String
})

const transactionlist = mongoose.model("transactionmodel", transactionmodel);
module.exports = transactionlist;