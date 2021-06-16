const express = require('express');
const router = express.Router();
const post = require('../models/post');
const Help = require('../models/ad');
const AppError = require('../utils/AppError');


router.get('/error',(req, res, next) => {
    throw new AppError("No Page Found", 404);
})

router.get('/',async (req, res)=>{
    if(!req.user){
        res.redirect('/admin/error');
    }
    else if(req.user.username == 'admin'){
    res.render('admin/adminPanel')
    } else{
        res.redirect('/admin/error');
    }
})

router.get('/allposts',async (req, res) => {
    if(!req.user){
        res.redirect('/admin/error');
    }
    else if(req.user.username == 'admin'  && req.user){
        let admin = {
            loggedIn : true
        }
        const myposts = await post.find().populate('user');    
        if(!myposts.length){
            res.render('post/nopost');
        }else{    
            res.render('post/myposts', { myposts ,admin});   
        }     
    } else{
        res.redirect('/admin/error');
    }      
})

router.get('/allhelps',async (req, res) => {  
    if(!req.user){
        res.redirect('/admin/error');
    } 
    else if(req.user.username == 'admin' && req.user){
        let admin = {
            loggedIn : true
        }
        const myposts = await Help.find().populate('user');   
        
        if(!myposts.length){
            res.render('post/noadposts');
        }else{     
        res.render('post/myads', { myposts , admin}); 
        }     
    } else{
        res.redirect('/admin/error');
    }   
})



module.exports = router;