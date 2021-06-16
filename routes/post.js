const express = require('express');
const router = express.Router();
const User = require('../models/user');
const post = require('../models/post');
const Help = require('../models/ad');
const Comment = require('../models/comment');
const HelpComment = require('../models/adComment');
const wrapAsync = require('../utils/wrapAsync');
const AppError = require('../utils/AppError');
const mongoose = require('mongoose');
const { Schema } = mongoose; 
const {isLoggedIn} = require('../middleware');
const nodemailer = require('nodemailer');
const Subs = require('../models/subscribe');
const UserSubs = require('../models/userSubs');
const UserSubs2 = require('../models/userSubs2');
const UserSubs18 = require('../models/userSubs18');
const UserSubs182 = require('../models/userSubs182');
const axios = require('axios');
const Joi = require('joi')
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const  {google} = require('googleapis');

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

const validatePost = (req,res,next) => {
    const postContent = req.body;    
    const postSchema = Joi.object({
        categories : Joi.string().required(),
        requirement : Joi.string().required(),
        location : Joi.string().required(),
        pincode : Joi.number().required()
        }  
    )
    const {error} = postSchema.validate({categories : postContent.categories,requirement : postContent.requirement,location : postContent.location,pincode : postContent.pincode});
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        req.flash('error',msg);
    }
    next();
    
}

router.get('/',isLoggedIn,(req,res) => {
    res.render('post/post');
})

router.get('/sub',isLoggedIn,async(req,res)=>{  
    const user = req.user;
    const pins = await UserSubs.find({user}); 
    const pins2 = await UserSubs2.find({user});  
    const pins18 = await UserSubs18.find({user}); 
    const pins182 = await UserSubs182.find({user}); 
    res.render('user/subscribe',{pins,pins2,pins18,pins182});
})

router.get('/unsubscribe/:pin',async(req,res)=>{    
    const {pin} = req.params;
    const user = req.user
    
    await UserSubs.findOneAndDelete({ userpincode : { $in : pin},user})    
    req.flash('success',`Unsubscribed from pincode ${pin} for Dose 1`);
    res.redirect('/post/sub');
})



router.post('/subscribe',isLoggedIn,wrapAsync(async (req,res)=>{
   const {pincode} = req.body;  
   const user = req.user; 
   
   //subs
   let find = await Subs.find({ pincode : { $in : pincode }});    
  
   if(!find.length){
        await Subs.insertMany({pincode : pincode}); 
   }
   find = await Subs.find({});      

   //userSubs
    let userFind = await UserSubs.find({ userpincode : { $in : pincode },user}); 
    if(!userFind.length){
         await UserSubs.insertMany( {userpincode : pincode, user}); 
    }      
    userFind = await UserSubs.find({}); 
   
    res.redirect("/post/sub");    
}))


router.get('/unsubscribe2/:pin',async(req,res)=>{    
    const {pin} = req.params;
    const user = req.user
    
    await UserSubs2.findOneAndDelete({ userpincode : { $in : pin},user})    
    req.flash('success',`Unsubscribed from pincode ${pin} for Dose 2`);
    res.redirect('/post/sub');
})



router.post('/subscribe2',isLoggedIn,wrapAsync(async (req,res)=>{
   const {pincode} = req.body;  
   const user = req.user;    
   //subs
   let find = await Subs.find({ pincode : { $in : pincode }});    
  
   if(!find.length){
        await Subs.insertMany({pincode : pincode}); 
   }     

   //userSubs
    let userFind = await UserSubs2.find({ userpincode : { $in : pincode },user}); 
    if(!userFind.length){
         await UserSubs2.insertMany( {userpincode : pincode, user}); 
    }         
   
    res.redirect("/post/sub");    
}))


//18 1
router.post('/subscribe18',isLoggedIn,wrapAsync(async (req,res)=>{
    const {pincode} = req.body;  
    const user = req.user; 
    
    //subs
    let find = await Subs.find({ pincode : { $in : pincode }});    
   
    if(!find.length){
         await Subs.insertMany({pincode : pincode}); 
    }
    find = await Subs.find({});      
 
    //userSubs
     let userFind = await UserSubs18.find({ userpincode : { $in : pincode },user}); 
     if(!userFind.length){
          await UserSubs18.insertMany( {userpincode : pincode, user}); 
     }      
     userFind = await UserSubs18.find({}); 
    
     res.redirect("/post/sub");    
 }))

 router.get('/unsubscribe18/:pin',async(req,res)=>{    
    const {pin} = req.params;
    const user = req.user
    
    await UserSubs18.findOneAndDelete({ userpincode : { $in : pin},user})    
    req.flash('success',`Unsubscribed from pincode ${pin} for Dose 2`);
    res.redirect('/post/sub');
})

//18 2 
router.post('/subscribe182',isLoggedIn,wrapAsync(async (req,res)=>{
    const {pincode} = req.body;  
    const user = req.user; 
    
    //subs
    let find = await Subs.find({ pincode : { $in : pincode }});    
   
    if(!find.length){
         await Subs.insertMany({pincode : pincode}); 
    }
    find = await Subs.find({});      
 
    //userSubs
     let userFind = await UserSubs182.find({ userpincode : { $in : pincode },user}); 
     if(!userFind.length){
          await UserSubs182.insertMany( {userpincode : pincode, user}); 
     }      
     userFind = await UserSubs182.find({}); 
    
     res.redirect("/post/sub");    
 }))

 router.get('/unsubscribe182/:pin',async(req,res)=>{    
    const {pin} = req.params;
    const user = req.user
    
    await UserSubs182.findOneAndDelete({ userpincode : { $in : pin},user})    
    req.flash('success',`Unsubscribed from pincode ${pin} for Dose 2`);
    res.redirect('/post/sub');
})
 
router.post('/',isLoggedIn,validatePost,wrapAsync(async (req,res) => {
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
        
        await post.insertMany(postContent);
        req.flash('success','Sucessfuly posted');
        res.redirect('/post/show');
    }catch(e){
        req.flash('error',e.message);
        res.redirect('/post/show');
    }   
    
}))



router.post('/forget/username',wrapAsync(async(req,res) => {
    const {email} = req.body;    
    const data = await User.find({email : email}); 
   
    if(!data.length){
        req.flash('error','Email not found in the database, Please Try again!!')
        res.redirect('/user/forget/username')
    }else{  
    mailOptions.to = email;
    mailOptions.subject = `Forget Username Response`;
    mailOptions.text = `Your username is : ${data[0].username}


Developed by - Rushikesh Rajendra Wani`;
        sendingMail(mailOptions)
        .then((result) => console.log(`email sent`))
        .catch((error) => console.log(error.message));
            res.redirect('/post/done');
    }
}))

router.get('/done',(req,res) => {
    req.flash('success','Check email to get your username!!');
    res.redirect('/user/login');
})

router.post('/otp', (req, res) => {
    const {email , otp} = req.body;    
    console.log(email)    
    mailOptions.to = email;
    mailOptions.subject = `Otp for Registration from HelpCamp`;
    mailOptions.text = `Your otp is: ${otp}
    
Developed by - Rushikesh Rajendra Wani
`;
        sendingMail(mailOptions)
        .then((result) => console.log(`email otp sent`))
        .catch((error) => console.log(error.message));
})

router.get('/mypost',isLoggedIn,wrapAsync(async (req,res,next) =>{
    const user1 = req.user;
    const username = user1.username;    
    const posts = await post.find().populate('user');   
    const myposts = posts.filter(x => {
        if(x.user.username === username){
            return x;
        }        
    }) 
    let admin = {
        loggedIn : false
    }
    if(!myposts.length){
        res.render('post/nopost');
    }else{    
    res.render('post/myposts', { myposts , admin});   
    }     
}))


router.get('/show',wrapAsync(async(req,res,next) => {   
    const posts = await post.find().populate('user');       
    if(!posts.length){
        res.render('post/nopost');
    } else{
        res.render('post/showPosts', { posts });
    }    
    
}))

router.get('/:postid', wrapAsync(async (req, res, next) => {
    const { postid } = req.params;
    const banner = await post.findById(postid).populate('user');
    const comm = await Comment.find({ post: postid }).populate('user');
    const user = req.user;
   
    res.render('post/comment', { banner, comm, user });
}))

router.get('/show/:category',wrapAsync(async (req,res,next) => {
    const { category } = req.params;
    const posts = await post.find({categories : category}).populate('user');   
    if(!posts.length){
        res.render('post/nopost');
    }else{ 
    res.render('post/show',{ posts , category});
    }
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
 
    const freshComment = await Comment.insertMany({comment: comment, post : postid, user,date : today , time : formatAMPM(today1).toUpperCase()}); 
    
    const owner = await post.findById(postid).populate('user');      
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
            
    res.redirect(`/post/${postid}`);    
}))

router.get('/filter/pc/:pc',wrapAsync (async (req,res)=>{
    const { pc } = req.params;
    const search = await post.find({pincode : pc}).populate('user');
    
    res.render('post/search',{ search })
}))

router.post('/filter/pc',wrapAsync(async (req,res)=>{
    const { pc } = req.body;
      
    res.redirect(`/post/filter/pc/${pc}`);    
}))


router.get('/filter/city/:city',wrapAsync (async (req,res)=>{
    const { city } = req.params;
    const search = await post.find({ location : new RegExp(`^${city}$`, 'i') }).populate('user');
    
    res.render('post/search',{ search })
}))

router.post('/filter/city',wrapAsync(async (req,res)=>{
    const { city } = req.body;
       
    res.redirect(`/post/filter/city/${city}`);    
}))

router.get('/edit/:postid',wrapAsync (async(req,res) =>{
    const { postid } = req.params;
    const banner = await post.findById(postid).populate('user');
    if(banner.length){
        res.render('post/nopost');
    }   
    res.render('post/edit_post', { banner });    
}))

router.post('/edit/:postid',wrapAsync(async (req,res)=>{
    const { postid } = req.params;  
    const { categories, requirement, location , pincode} = req.body; 
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
    const updatedPost = await post.findByIdAndUpdate(postid, {categories: categories, requirement: requirement, location: location, pincode : pincode, date : today, time : formatAMPM(today1).toUpperCase()});  
    req.flash('success','Sucessfuly updated your Post!!');
    res.redirect('/post/mypost');

}))

router.post('/delete/:postid',wrapAsync(async (req,res)=>{
    const { postid } = req.params;  
    await Comment.deleteMany({post : postid});
    await post.findByIdAndDelete(postid);
    req.flash('success','Sucessfuly deleted your Post!!');
    res.redirect('/post/mypost');
}))

router.post('/comment/edit/:postid/:commentid',wrapAsync(async (req,res)=>{
    const { commentid, postid } = req.params;
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

    await Comment.findByIdAndUpdate(commentid,{comment,date : today, time : formatAMPM(today1).toUpperCase()});


    const owner = await post.findById(postid).populate('user');
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
            res.redirect(`/post/${postid}`);
}))

router.post('/delete/comment/:postid/:commentid',wrapAsync(async (req,res)=>{
    const { commentid, postid } = req.params;  
    await Comment.findByIdAndDelete(commentid);
    req.flash('success','Sucessfuly deleted your Comment!!');
    res.redirect(`/post/${postid}`);
}))




module.exports = router;