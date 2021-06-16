const express = require('express');
const router = express.Router();
const User = require('../models/user');
const post = require('../models/post');
const Help = require('../models/ad');
const Comment = require('../models/comment');
const HelpComment = require('../models/adComment');
const wrapAsync = require('../utils/wrapAsync');
const mongoose = require('mongoose');
const { Schema } = mongoose; 
const {isLoggedIn} = require('../middleware');
const nodemailer = require('nodemailer');
const  {google} = require('googleapis');

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendingMail(mailOptions) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: 'gmail',
      pool : true,
      auth: {
        type: 'OAuth2',
        user: 'helpcamp2021@gmail.com',
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
      tls: {rejectUnauthorized: false}
    });
    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    return error;
  }
}

var mailOptions = {
    from: 'helpcamp2021@gmail.com',
    to: 'abhishekwani619@gmail.com',
    subject: 'Test2',
    text: `Help this mail is from helpcamp`
};



router.post('/',isLoggedIn,wrapAsync(async (req,res) => {
    try{
        const postContent = req.body;
        const userId = req.user._id;
        postContent.user = userId;        
      
        var currentTime = new Date();
        var currentOffset = currentTime.getTimezoneOffset();
        var ISTOffset = 330;   // IST offset UTC +5:30 
        var today = new Date(currentTime.getTime() + (ISTOffset + currentOffset)*60000);
        var today1 = new Date(currentTime.getTime() + (ISTOffset + currentOffset)*60000);
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        today = dd + '-' + mm + '-' + yyyy;
        function formatAMPM(date) {
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0'+minutes : minutes;
            var strTime = hours + ':' + minutes + ' ' + ampm;
            return strTime;
        }       
    
        postContent.time = formatAMPM(today1).toUpperCase();
        postContent.date = today;
     
        await Help.insertMany(postContent);
        req.flash('success','Sucessfuly posted your Help');
        res.redirect('/help/show');
    }catch(e){
        req.flash('error',e.message);
        res.redirect('/help/show');
    }   
    
}))

router.get('/',isLoggedIn,(req,res) => {    
    res.render('post/ad');
})

//myads
router.get('/mypost',isLoggedIn,wrapAsync(async (req,res,next) =>{
    const user1 = req.user;
    const username = user1.username;
    let admin = {
        loggedIn : false
    }    
    const posts = await Help.find().populate('user');   
    const myposts = posts.filter(x => {
        if(x.user.username === username){
            return x;
        }        
    }) 
    if(!myposts.length){
        res.render('post/noadposts');
    }else{     
    res.render('post/myads', { myposts ,admin}); 
    }       
}))

router.get('/show',wrapAsync(async(req,res,next) => {
    const posts = await Help.find().populate('user');       
    if(!posts.length){
        res.render('post/noadposts');
    }else{     
    res.render('post/showad', { posts });
    }
}))


router.get('/:postid',wrapAsync(async (req,res,next) =>{
    const { postid } = req.params;
    const banner = await Help.findById(postid).populate('user'); 
    const comm = await HelpComment.find({post: postid}).populate('user');     
    const user = req.user;         
    res.render('post/commentAd', { banner, comm ,user});
}))



router.post('/comment/:postid/:userid',wrapAsync(async (req,res,next) =>{
    const {postid , userid} = req.params;
    const { comment } = req.body;       
    const user = req.user;

    var currentTime = new Date();
    var currentOffset = currentTime.getTimezoneOffset();
    var ISTOffset = 330;   // IST offset UTC +5:30 
    var today = new Date(currentTime.getTime() + (ISTOffset + currentOffset)*60000);
    var today1 = new Date(currentTime.getTime() + (ISTOffset + currentOffset)*60000);
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = dd + '-' + mm + '-' + yyyy;
    function formatAMPM(date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0'+minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    }       
 
    const freshComment = await HelpComment.insertMany({comment: comment, post : postid, user,date : today , time : formatAMPM(today1).toUpperCase()}); 
    const owner = await Help.findById(postid).populate('user');      
    mailOptions.to = owner.user.email;
    mailOptions.subject = `You have got a request from ${user.firstname} ${user.lastname}`;
    mailOptions.text = `The requested person's details are as follows : 
    Name : ${user.firstname} ${user.lastname}
    Email : ${user.email}
    Phone Number : ${user.phone}
    Comment on Your post : ${comment}
    Please visit our website for more details!!`   
    sendingMail(mailOptions)
        .then((result) => console.log(`email sent`))
        .catch((error) => console.log(error.message));
    
    res.redirect(`/help/${postid}`);    
}))


//edit post
router.get('/edit/:postid',wrapAsync (async(req,res) =>{
    const { postid } = req.params;
    const banner = await Help.findById(postid).populate('user');    
    
    if(banner.length){
        res.render('post/noadposts');
    }else{   
    res.render('post/adEdit', { banner }); 
    }   
}))

router.post('/edit/:postid',wrapAsync(async (req,res)=>{
    const { postid } = req.params;  
    const { categories, requirement, location , pincode } = req.body;    

        var currentTime = new Date();
        var currentOffset = currentTime.getTimezoneOffset();
        var ISTOffset = 330;   // IST offset UTC +5:30 
        var today = new Date(currentTime.getTime() + (ISTOffset + currentOffset)*60000);
        var today1 = new Date(currentTime.getTime() + (ISTOffset + currentOffset)*60000);
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        today = dd + '-' + mm + '-' + yyyy;
        function formatAMPM(date) {
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0'+minutes : minutes;
            var strTime = hours + ':' + minutes + ' ' + ampm;
            return strTime;
        }       
     
    const updatedPost = await Help.findByIdAndUpdate(postid, {categories: categories, requirement: requirement, location: location, pincode : pincode, date : today , time : formatAMPM(today1).toUpperCase()});  
    req.flash('success','Sucessfuly updated your Post!!');
    res.redirect('/help/mypost');

}))
//delete post
router.post('/delete/:postid',wrapAsync(async (req,res)=>{
    const { postid } = req.params;  
    await HelpComment.deleteMany({post : postid});
    await Help.findByIdAndDelete(postid);
    req.flash('success','Sucessfuly deleted your Post!!');
    res.redirect('/help/mypost');
}))
//edit comment
router.post('/comment/edit/:postid/:commentid',wrapAsync(async (req,res)=>{
    const { commentid, postid } = req.params;
    const { comment } = req.body;

    var currentTime = new Date();
    var currentOffset = currentTime.getTimezoneOffset();
    var ISTOffset = 330;   // IST offset UTC +5:30 
    var today = new Date(currentTime.getTime() + (ISTOffset + currentOffset)*60000);
    var today1 = new Date(currentTime.getTime() + (ISTOffset + currentOffset)*60000);
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = dd + '-' + mm + '-' + yyyy;
    function formatAMPM(date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0'+minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    }    
   
    await HelpComment.findByIdAndUpdate(commentid,{commentdate : today , time : formatAMPM(today1).toUpperCase()});  


    const owner = await Help.findById(postid).populate('user');
    mailOptions.to = owner.user.email;
    mailOptions.subject = `You have got a help from ${user.firstname} ${user.lastname}`;
    mailOptions.text = `The helper details are as follows : 
    Name : ${user.firstname} ${user.lastname}
    Email : ${user.email}
    Phone Number : ${user.phone}
    Comment on Your post : ${comment}
   
    
Developed by - Rushikesh Rajendra Wani
Please Visit our website for more information`
        sendingMail(mailOptions)
        .then((result) => console.log(`email sent`))
        .catch((error) => console.log(error.message));
           
    req.flash('success','Successfuly Updated your Comment!!');
    res.redirect(`/help/${postid}`);
}))

//delete comment
router.post('/delete/comment/:postid/:commentid',wrapAsync(async (req,res)=>{
    const { commentid, postid } = req.params;  
    await HelpComment.findByIdAndDelete(commentid);
    req.flash('success','Sucessfuly deleted your Comment!!');
    res.redirect(`/help/${postid}`);
}))

router.get('/filter/pc/:pc',wrapAsync (async (req,res)=>{
    const { pc } = req.params;
    const search = await Help.find({pincode : pc}).populate('user');
    
    res.render('post/searchad',{ search })
}))

router.post('/filter/pc',wrapAsync(async (req,res)=>{
    const { pc } = req.body;
    
    res.redirect(`/help/filter/pc/${pc}`);    
}))


router.get('/filter/city/:city',wrapAsync (async (req,res)=>{
    const { city } = req.params;
    const search = await Help.find({ location : new RegExp(`^${city}$`, 'i') }).populate('user');    
    res.render('post/searchad',{ search })
}))

router.post('/filter/city',wrapAsync(async (req,res)=>{
    const { city } = req.body;   
    res.redirect(`/help/filter/city/${city}`);    
}))



module.exports = router;