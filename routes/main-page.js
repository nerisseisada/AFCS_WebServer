const usermodel = require('../model/user');
const transactionmodel = require('../model/transactionmodel');

exports.transactionAdmin = async (req, res) => {
    try {
        const userOne = req.user; 
  
        if (!userOne) {
            return res.redirect('/login');
        }
        
        const companyId = userOne.id; 
        const users = await usermodel.findOne({_id: companyId});
    
        if(companyId === '65b09332a76f8dfb1f182d2f'){
          const dataFromDB = await transactionmodel.find();
          res.render("pages/index",{
              data: dataFromDB
          })
        }
        else{
          const dataFromDB = await transactionmodel.find({ id: users.id });
  
          res.render("pages/client_page", {
              data: dataFromDB
          });
        }
        
  
    } catch (error) {
        console.error("Error retrieving data from the database:", error);
        res.render('pages/error');
    }
};
