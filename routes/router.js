const express = require("express").Router();
const transactionmodel = require('../model/transactionmodel');
const usermodel = require("../model/user");
const jwt = require('jsonwebtoken');
require('dotenv').config();
const secretKey = process.env.secretKey;


//upload
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });



//authenticateToken

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.redirect('/login');

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.redirect('/login');

    req.user = user;
    next();
  });
};

//restrict page for admin only
async function isAdmin(req, res, next) {
  const companyId = req.user.id;

  try {

    const user = await usermodel.findOne({ _id: companyId });

    if (user && companyId === '65b09332a76f8dfb1f182d2f') {
      return next();
    } else {
      res.render('pages/pagenotfound');
    }
  } catch (error) {
    console.error('Error in isAdmin middleware:', error);
    res.render('pages/error');
  }
}

//general features

express.post('/user', authenticateToken, isAdmin, (req,res,next)=>{
  usermodel.create(req.body).then(data=>{
      res.send("Successfully created: " + data)
  })
})

express.get('/user', authenticateToken, isAdmin, (req,res,next)=>{
usermodel.find().then((data)=>{
  res.send(data)})
})

express.delete('/deleteuser', async(req, res)=>{
  await usermodel.deleteMany().then(()=>{
      res.send("Successfully deleted")
  })
})

express.post('/deleteusers', authenticateToken, isAdmin, async (req, res, next) => {
try {
  const idsToDelete = req.body.ids; // Assuming req.body.ids is an array of user IDs
  for (const id of idsToDelete) {
    await usermodel.findByIdAndDelete(id).exec();
  }
  res.json({ success: true, redirectUrl: '/userlist' });
} catch (error) {
  res.status(500).json({ success: false, message: 'Error deleting users.' });
}
});

express.get('/search', async (req, res) => {
  try {
    const searchTerm = req.query.search;

    const filteredData = await transactionmodel.find({
      $or: [
        { id: { $regex: searchTerm, $options: 'i' } },
        { cardid: { $regex: searchTerm, $options: 'i' } },
        { busNum: { $regex: searchTerm, $options: 'i' } },
        { admin: { $regex: searchTerm, $options: 'i' } } 
      ]
    });

    res.render('pages/index', { data: filteredData });
  } catch (error) {
    console.error("Error searching data:", error);
      res.render('pages/error');
  }
});

express.get('/searchuser', authenticateToken, isAdmin, async(req,res)=>{

  try {

    const searchTerm = req.query.search;

    const filteredData = await usermodel.find({
      $or: [
        { id: { $regex: searchTerm, $options: 'i' } },
        { user: { $regex: searchTerm, $options: 'i' } },
        { pwd: { $regex: searchTerm, $options: 'i' } }
      ]
    });

    res.render('pages/user_list', { data: filteredData });
    
  } catch (error) {
    res.render('pages/error');
  }
});

express.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});



// ------------------------ login --------------------------------

const loginController = require('./login');
express.get('/login', loginController.loginpage);

// credentials check from the website
express.post('/loginwebserver', loginController.loginwebserver);

// credentials check from the app
express.get('/loginuser', loginController.loginUser);


//-------------------- main page ---------------------------

const adminTransacController = require('./main-page');
express.get('/getdata', authenticateToken, adminTransacController.transactionAdmin);

//-------------------- admin page ---------------------------


//add user
const adminSettingsController = require('./admin-settings');
express.get('/adduser', authenticateToken, isAdmin, adminSettingsController.addUser);
express.post('/adduserform', authenticateToken, adminSettingsController.addUserForm);
express.get('/import-registrant',authenticateToken, isAdmin, adminSettingsController.import);
express.post('/upload',authenticateToken, isAdmin, upload.single('file'), adminSettingsController.upload)
//user list
express.get('/userlist', authenticateToken, isAdmin, adminSettingsController.userList); 
express.post('/admin/:id', authenticateToken, isAdmin, adminSettingsController.editAdmin);





// ------------ page not found -----------------------
express.use((req, res, next) => {
  res.status(404).render('pages/pagenotfound');
});
module.exports = express;
