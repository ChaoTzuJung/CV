var express = require('express');
var router = express.Router();
var csrf = require('csurf');
require('dotenv').config(); 
// CSRF Token
var csrfProtection = csrf();
router.use(csrfProtection);
// Mailer
var path = require('path');
var nodemailer = require('nodemailer');
// 聯絡我們的頁面
router.get('/', csrfProtection, function(req, res) {
    req.session.date = new Date();
    res.render('home', {
        csrfToken: req.csrfToken(),
        errors: req.flash('errors'),
        date: req.session.date
    });
});
router.get('/contactname', function(req, res) {
    res.render('contactname', {
        date: req.session.date
    });
});
// 查看 Contact
router.get('/review/', function(req, res) {
    res.render('contactReview');
});
router.post('/post', csrfProtection, function(req, res) {
    var data = req.body;
    console.log(req.checkBody);
    req.checkBody('username', '姓名不可為空').notEmpty();
    req.checkBody('email', 'Email不可為空').isEmail();
    req.checkBody('tel', '電話不可為空').notEmpty();
    req.checkBody('description', '訊息不可為空').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function(error) {
           messages.push(error.msg);
        });
        req.flash('errors',messages);
        return res.redirect('/');
    }
    var mailOptions = {
        from: req.body.email, 
        to: 's110319022@gmail.com', 
        subject: '聯絡我們：' + req.body.username+'寄了一封信給你',
        text: req.body.description, 
    };
    console.log(req.body.email)
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.gmailUser,
            pass: process.env.gmailPass,
        }
    });
    transporter.sendMail(mailOptions,function(error,info){
        if (error) {
            return console.log(error);
        }
        res.redirect(`/review/`);
    })
});
module.exports = router;
