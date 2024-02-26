const express = require('express');
const app = express();
const port = 3600 || process.env.PORT;
const router = require("./routes/router");
const bodyparser = require("body-parser");
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
require("dotenv").config();

app.use(cookieParser());
app.use(session({
    secret:'cmxiuduieudur84fncdds',
    cookie: {maxAge: 60000},
    resave: false,
    saveUninitialized: false
}));

app.use(flash());

app.set('view engine', 'ejs');
try {
    require('mongoose').connect(process.env.DB);
} catch (error) {
    console.log(error);
}
app.use(require('cors')());
app.use(bodyparser.json());
app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended:true}));
app.use("/", router);
app.listen(port, ()=>console.log(`success`));
