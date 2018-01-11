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
    var mailToAnyoneOptions = {
        //填寫表單的人Email
        // sender: ' '+req.body.username+' ', 
        from:  '"趙子榮" <alanchao2305@gmail.com>',
        //我的Email
        to: ' '+ req.body.email +' ',
        subject: '聯絡我們： 趙子榮寄了一封信給你',
        //填寫表單的人想告訴我的話
        text: '您好！我們團隊已收到您的通知，兩天內會回覆您', 
    };

    var mailToMeOptions = {
        //填寫表單的人Email
        sender: ' '+req.body.username+' ', 
        from: ' '+req.body.username+' ',
        //我的Email
        to: 'alanchao2305@gmail.com',
        subject: '聯絡我們：' + req.body.username+'寄了一封信給你',
        //填寫表單的人想告訴我的話
        text: req.body.description, 
    };

    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.GMAIL_ACCOUNT,
            pass: process.env.GMAIL_PW
        }
    });
    transporter.sendMail(mailToAnyoneOptions, function(error,info){
        if (error) {
            return console.log(error);
        }
        res.redirect(`/review/`);
    })
    transporter.sendMail(mailToMeOptions, function(error,info){
        if (error) {
            return console.log(error);
        }
        res.redirect(`/review/`);
    })
});
module.exports = router;
