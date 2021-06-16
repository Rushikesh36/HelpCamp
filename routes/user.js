const express = require('express');
const User = require('../models/user');
const Comment = require('../models/comment');
const post = require('../models/post');
const passport = require('passport');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const AppError = require('../utils/AppError');
const {isLoggedIn} = require('../middleware');
const passwordComplexity = require("joi-password-complexity");
const async = require('async');
const nodemailer = require('nodemailer')
let crypto = require('crypto');
const UserSubs = require('../models/userSubs');
const UserSubs2 = require('../models/userSubs2');
const UserSubs18 = require('../models/userSubs18');
const UserSubs182 = require('../models/userSubs182');
const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');
const Subs = require('../models/subscribe');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)

router.get('/register',(req,res) => {   
    form = req.session.message;
    
    res.render('user/filledRegister',{form});
})

router.get('/forget/username',(req,res) => {
    res.render('user/forgetUsername');
})

const validateUser = (req,res,next) =>{
    let f0=1,f1=1;
    const label = "Password"
  
    const user = req.body;
   
    const form = req.body;
    const userSchema = Joi.object({
        username : Joi.string().required().escapeHTML(),
        firstname : Joi.string().required().escapeHTML(),
        lastname : Joi.string().required().escapeHTML(),
        pincode : Joi.string().required().min(6).max(6).escapeHTML(),
        phone : Joi.string().required().min(10).max(10).escapeHTML(),
        email : Joi.string().required().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'in'] } }),   
        gender : Joi.string().required()
    })
    const error2 = passwordComplexity(undefined,label).validate(user.password);
    const {error} = userSchema.validate({username : user.username, firstname : user.firstname, lastname : user.lastname, pincode : user.pincode, phone : user.phone, email : user.email,gender : user.gender});
    if(error){
        f0=0;
        const msg = error.details.map(el => el.message).join(',')
        req.flash('error',msg);
        req.session.message = form;
        res.redirect('/user/register')
    }  
  
   
    if(error2.error){    
        f1=0;        
        const msg = error2.error.details.map(el => el.message).join(',');              
        req.flash('error',msg);
        req.session.message = form;
        res.redirect('/user/register')
    }
    if(f0 && f1){
        next();
    }
}

const validateUserProfile = (req,res,next) =>{    
   
    const user = req.body;
   
    const form = req.body;
    const userSchema = Joi.object({        
        firstname : Joi.string().required().escapeHTML(),
        lastname : Joi.string().required().escapeHTML(),
        pincode : Joi.string().required().min(6).max(6).escapeHTML(),
        phone : Joi.string().required().min(10).max(10).escapeHTML(),           
        gender : Joi.string().required().escapeHTML()
    })
    const {error} = userSchema.validate({ firstname : user.firstname, lastname : user.lastname, pincode : user.pincode, phone : user.phone,gender : user.gender});
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        req.flash('error',msg);
        req.session.message = form;
        res.redirect('/user/profile')
    }   
    else{
        next();
    }
}

router.post('/register',validateUser,wrapAsync(async (req,res,next) => {
    try{       
        
        let { email , firstname , lastname, username , password , gender , phone ,pincode} = req.body;
        username = username.replace(/\s/g, "").toLowerCase();
        
        const capitalize = (s) => {
            if (typeof s !== 'string') return ''
            return s.charAt(0).toUpperCase() + s.slice(1)
        }
        firstname = capitalize(firstname).replace(/\s/g, "");
        lastname = capitalize(lastname).replace(/\s/g, "");     
       
        const user = new User({email , firstname , lastname, username , gender , phone ,pincode});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if(err) return next(err);
            req.flash('success',"User Successfully registered");            
            res.redirect('/');
        })       
    }catch(e){   
        const form = req.body;     
        req.flash('error',e.message);
        req.session.message = form;        
        res.redirect('/user/register')
    }           
}));

router.get('/profile' ,isLoggedIn, async (req, res) => {   
    const user = req.user;     
    res.render('user/newProfile', { user });
})

router.get('/vaccine',isLoggedIn, async (req, res) => {
    const pin = req.user.pincode;
    res.render('user/vaccine',{pin});
})

router.patch('/edit/:userid/profile',isLoggedIn ,validateUserProfile, wrapAsync(async(req, res) => {    
    let {firstname, lastname, email , gender, phone,pincode} = req.body; 
    const capitalize = (s) => {
        if (typeof s !== 'string') return ''
        return s.charAt(0).toUpperCase() + s.slice(1)
    }
    firstname = capitalize(firstname).replace(/\s/g, "");
    lastname = capitalize(lastname).replace(/\s/g, "");  
    const {username} = req.user;   
    const updatedUser = await User.findOneAndUpdate({username : username}, {firstname, lastname, email , gender, phone,pincode});    
    req.flash('success','Successfully updated your profile!!');
    res.redirect('/post/show');
}))

router.get('/login',(req,res) => {   
    if(req.user){
        req.flash('error','Already Loggen In!');
        res.redirect('/post/show');
    }
    else{
        res.render('user/login');
    }    
})

router.post('/login',passport.authenticate('local', { failureFlash : true, failureRedirect: '/user/login' }),(req,res) => {       
    const redirectUrl = req.session.returnTo || '/';
    delete req.session.returnTo;    
    req.flash('success', 'Welcome Back!!');
    res.redirect(redirectUrl);    
})


router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success',"Logged you out, Goodbye !!");
    res.redirect('/');
})

router.delete('/delete',isLoggedIn,async (req, res) => {    
    await post.deleteMany({user : req.user._id});
    await Comment.deleteMany({user : req.user._id});
    await UserSubs.deleteMany({user : req.user._id});
    await UserSubs2.deleteMany({user : req.user._id}); 
    await UserSubs18.deleteMany({user : req.user._id}); 
    await UserSubs182.deleteMany({user : req.user._id});                 
    await User.findByIdAndDelete(req.user._id);    
    req.flash('error',`${req.user.username} , Your account is successfully removed!!`)
    res.redirect('/post/show');
})

// forgot password
router.get('/forgot', function (req, res) {
    res.render('user/forgot');
});

router.get('/resetpassword', isLoggedIn, async (req, res) => {
    res.render('user/changepass');
})

router.post('/forgot', function (req, res, next) {
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function (token, done) {
            User.findOne({ email: req.body.email }, function (err, user) {
            
                if (!user) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/user/forgot');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function (err) {
                    done(err, token, user);
                });
            });
        },
        function (token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'helpcamp2021@gmail.com',
                    pass: process.env.password
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'helpcamp2021@gmail.com',
                subject: 'Helpcamp Password Reset',
                text: 
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/user/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n\n'+
                    'Developed by - Rushikesh Rajendra Wani\n'+
                    'Please Visit our website for more information'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
               
                req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], function (err) {
        if (err) return next(err);
        res.redirect('/user/forgot');
    });
    
});

router.get('/reset/:token', function (req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
        }
        res.render('user/reset', { token: req.params.token });
    });
});

router.post('/reset/:token', function (req, res) {
    const {password} = req.body;
    const label = "Password";
    const error2 = passwordComplexity(undefined, label).validate(password);
   
    async.waterfall([
        function (done) {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
                if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }
                if (error2.error) {
                    const msg = error2.error.details.map(el => el.message).join(',')
                    req.flash('error', msg);
                    return res.redirect('back');
                }
                if (req.body.password === req.body.confirm) {
                    user.setPassword(req.body.password, function (err) {
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;

                        user.save(function (err) {
                            req.logIn(user, function (err) {
                                done(err, user);
                            });
                        });
                    })
                } else {
                    req.flash("error", "Passwords do not match.");
                    return res.redirect('back');
                }
            });
        },
        function (user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'helpcamp2021@gmail.com',
                    pass: process.env.password
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'helpcamp2021@gmail.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n\n'+
                    'Developed by - Rushikesh Rajendra Wani\n'+
                    'Please Visit our website for more information'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                req.flash('success', 'Success! Your password has been changed.');
                done(err);
            });
        }
    ], function (err) {
        res.redirect('/');
    });
});


router.post('/resetpass',isLoggedIn, async (req, res)=> {
    const { newpassword } = req.body;
    const label = "New Password";
    const error2 = passwordComplexity(undefined, label).validate(newpassword);
    const user1 = req.user
    
    await User.findOne({ username: user1.username }, function (err, user){
        if (req.body.newpassword != req.body.confirmnewpassword) {
            req.flash('error', "New Passwords do not match.");
            res.redirect('/user/resetpassword');
        }
        if (error2.error) {
            const msg = error2.error.details.map(el => el.message).join(',')
            req.flash('error', msg);
            res.redirect('/user/resetpassword');
        }
        if (req.body.password === req.body.confirm) {
           user.changePassword(req.body.oldpassword,req.body.newpassword, function (err) {
               
               if(err){
                   
                   req.flash("error", "Old Password is Wrong!!");
                   res.redirect('/user/resetpassword');
               }
                user.save(function (err) {
                    req.logIn(user, function (err) {
                        
                    });
                });
                var smtpTransport = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        user: 'helpcamp2021@gmail.com',
                        pass: "helpcamp@12#"
                    }
                });
                var mailOptions = {
                    to: user.email,
                    from: 'helpcamp2021@gmail.com',
                    subject: 'Your password has been changed',
                    text: 'Hello,\n\n' +
                        'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n\n'+
                        'Developed by - Rushikesh Rajendra Wani\n'+
                        'Please Visit our website for more information'
                };
                smtpTransport.sendMail(mailOptions, function (err) {
                    
                });
               req.flash("success", "Password Changed Sucessfully!!");
               res.redirect('/user/profile');
            })
            
        } else {
            req.flash("error", "Passwords do not match.");
            res.redirect('/user/resetpassword');
        }
        
        
    })
  
   
});


module.exports = router;