const usermodel = require('../model/user');
const transactionmodel = require('../model/transactionmodel');



exports.addUser = async (req,res)=>{
    res.render("pages/add_user", {
      notmatch:req.flash('notmatch'),
      error:req.flash('error'),
      success:req.flash('success')
    });
}

//form
exports.addUserForm = async(req,res)=>{
  try {
    //name should be the same as in the field in the front page
    const {pwd,cpwd,id} = req.body;

    //{name from the db:name of the req.body}
    const existingCompany = await usermodel.findOne({id:id});
    
    if(pwd !== cpwd){
      req.flash('notmatch', '*Password and confirm password are not match.');
      res.redirect("/adduser");
    } 
      else if (existingCompany){
      req.flash('error', '*Company Name should not be existing.');
      res.redirect("/adduser");
    }
    else{
      usermodel.create(req.body).then(data=>{
        req.flash('success', 'Successfully added a new user.');
        res.redirect('/adduser');

      })

      
    }
  } catch (error) {
    res.render('pages/error');
  }
};

//import

exports.import = async(req, res) => {
  try{
    res.render('pages/importregistrant',{
      error: req.flash('error'),
      skippedRows: req.flash('skippedRows'),
      success: req.flash('success')
    });
  }catch (error){
    // res.render('pages/error');
console.log(error);
  }
};

exports.upload = async (req, res) => {
  try {
    
    if (!req.file) {
      res.render('pages/error');
    }

    const allowedFileTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    
    if (!allowedFileTypes.includes(req.file.mimetype)) {
      req.flash('error', 'Invalid file type. Please upload a CSV or XLS file.');
      return res.redirect('/import-registrant');
    }
    const data = [];
    const skippedCompanyID = [];
    const existingCompanyID = new Set();

    const xlsx = require('xlsx');
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    for (let i = 2; ; i++) {
      const currentCell = sheet[`A${i}`];

      if (!currentCell || currentCell.v === undefined || currentCell.v === null) {
        // skippedRows.push(`Make sure you are following the sample format.`);
        break;
      }
      
      const companyid = sheet[`A${i}`]?.v.toUpperCase();;

      // id exists in excel
      if (existingCompanyID.has(companyid)) {
        console.warn(`Skipping duplicate companyID at Row ${i}: ${companyid}`);
        skippedCompanyID.push(`${companyid}`);
        continue;
      }

      const existingRecord = await usermodel.findOne({ id: companyid });


      if (existingRecord) {
          console.warn(`Skipping existing companyID at Row ${i}: ${companyid}`);
          skippedCompanyID.push(`${companyid}`);
          continue;
      }

      const item = {
        id: companyid,
        user: sheet[`B${i}`]?.v,
        pwd: sheet[`C${i}`]?.v
      };

      data.push(item);
      
      existingCompanyID.add(companyid);
    }
    
    await usermodel.insertMany(data);

    if (skippedCompanyID.length > 0) {
      const existingSkippedRows = req.flash('skippedCompanyID') || [];
      const allSkippedRows = existingSkippedRows.concat(skippedCompanyID);

      req.flash('skippedRows', allSkippedRows);
    }
    else{
      req.flash('success', 'Succesfully added new users.')
    }

    res.redirect('/import-registrant');

  } catch (error) {
    res.render('pages/error');
    console.log(error);
  }
};

//userlist
exports.userList = async(req,res)=>{
  const userlist = await usermodel.find();
  res.render("pages/user_list",{
    data:userlist
  }
  )
};

exports.editAdmin = (req, res) => {
  try {
      usermodel.findByIdAndUpdate(req.params.id, req.body).then(() => {
          usermodel.findById(req.params.id).then(data => {
              res.redirect("/userlist"); 
          })
      })
  } catch (error) {
      res.render('pages/error');
  }
};