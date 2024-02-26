const usermodel = require('../model/user');
const transactionmodel = require('../model/transactionmodel');
const dataArray = [];
const jwt = require('jsonwebtoken');

require('dotenv').config();
const secretKey = process.env.secretKey;



exports.loginpage=(req, res) => {
    res.render('pages/login'); 
};

exports.loginwebserver=async (req, res) => {
    const { user, pwd } = req.body;
  
    try {
      const userOne = await usermodel.findOne({ user: user, pwd: pwd });
  
      if (!userOne) {
        // console.log(userOne);
        return res.redirect('/login');
      }
      const token = jwt.sign({ id: userOne._id }, secretKey);
      res.cookie('token', token, { httpOnly: true });
      res.redirect("/getdata");
    } catch (error) {
      res.render('pages/error');
    }
};

exports.loginUser = async (req, res) => {
    const {
        sDT, eDT, sLat, sLon, eLat, eLon, cost, distance, cardid, 
        busNum, admin, status, balance, discount, id, user, pwd
    } = req.query;  
  
    const parsedBusNum = !isNaN(busNum) ? parseInt(busNum) : busNum;
    
    try {
      const userOne = await usermodel.findOne({ user: user, pwd: pwd });
  
      if (!userOne) {
        return res.redirect('/login');
      }
      const token = jwt.sign({ id: userOne._id }, secretKey);
      res.cookie('token', token, { httpOnly: true });
  
        const existingData = await transactionmodel.findOne({ sDT });
  
        if (existingData) {
            existingData.set({
                eDT, sLat: parseFloat(sLat), sLon: parseFloat(sLon),
                eLat: parseFloat(eLat), eLon: parseFloat(eLon),
                cost: parseFloat(cost), distance: parseFloat(distance),
                cardid, busNum: parsedBusNum, admin, status, balance: parseFloat(balance),
                discount: parseFloat(discount), id:id
            });
            const updatedData = await existingData.save();
  
            res.json({
                code: 200,
                msg: 'Success',
                data: updatedData
            });
        } else {
            // Create a new document
            const savedData = await transactionmodel.create({
                sDT, eDT, sLat: parseFloat(sLat), sLon: parseFloat(sLon),
                eLat: parseFloat(eLat), eLon: parseFloat(eLon),
                cost: parseFloat(cost), distance: parseFloat(distance),
                cardid, busNum: parsedBusNum, admin, status, balance: parseFloat(balance), 
                discount: parseFloat(discount), id:id
            });
  
            dataArray.push(savedData);
  
            res.json({
                code: 200,
                msg: 'Success',
                data: savedData
            });
        }
    } catch (error) {
     console.error("Error saving data to database:", error);
     res.render('pages/error');
    }
  };