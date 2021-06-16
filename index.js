if(process.env.NODE_ENV !== "production"){
    require('dotenv').config()
}
const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const AppError = require('./utils/AppError');
const session = require('express-session');
const flash = require('connect-flash');
const postRoutes = require('./routes/post');
const userRoutes = require('./routes/user');
const helpRoutes = require('./routes/help');
const adminRoutes = require('./routes/admin');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const axios = require('axios');
const Subs = require('./models/subscribe');
const got = require('got');
const nodemailer = require('nodemailer');
const UserSubs = require('./models/userSubs');
const UserSubs2 = require('./models/userSubs2');
const UserSubs18 = require('./models/userSubs18');
const UserSubs182 = require('./models/userSubs182');
const Post = require('./models/post');
const Help = require('./models/ad');
const Comment = require('./models/comment');
const HelpComment = require('./models/adComment');
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const dburl = process.env.DB_URL
const  {google} = require('googleapis');
//process.env.DB_URL
const MongoStore = require('connect-mongo');
const { access } = require('fs');
const secret = process.env.secret


var currentTime = new Date();
var currentOffset = currentTime.getTimezoneOffset();
var ISTOffset = 330;   // IST offset UTC +5:30 
var today = new Date(currentTime.getTime() + (ISTOffset + currentOffset)*60000);
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();
today = dd + '-' + mm + '-' + yyyy;
console.log(today);
console.log(new Date());
// 'mongodb://localhost:27017/helpCamp'
mongoose.connect(dburl, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex : true,useFindAndModify : false})
    .then(() => {
        console.log("CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO MONGOOSE NOT CONNECTED!!!!");        
    })

    
app.set('views',path.join(__dirname, '/views'));
app.set('view engine','ejs');

app.use(mongoSanitize());
app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static('public'));
app.use(helmet({contentSecurityPolicy : false}));


const store = new MongoStore({
    mongoUrl : dburl,
    secret,
    touchAfter : 24 * 60 * 60
})

store.on("error",function(e){
    console.log(e);
})



const sessionConfig = {
    store,
    name : 'randomid',
    secret,
    resave: false,
    saveUninitialized : true,
    cookie: {
        httpOnly: true,
        //secure : true,
        expires : Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge : 1000 * 60 * 60 * 24 * 7
    }
    
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {    
    res.locals.loggedInUser = req.user;    
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');    
    next();
});


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

// let transporter = nodemailer.createTransport({
//     service: 'gmail',
//     pool : true,
//     auth: {
//       user: 'helpcamp2021@gmail.com',
//       pass: process.env.password
//     }
// });

var mailOptions = {
    from: 'helpcamp2021@gmail.com',
    to: 'abhishekwani619@gmail.com',
    subject: 'Test2',
    text: `Help this mail is from helpcamp`
};
  
app.get('/',(req, res) => {
    if(!req.user){
       
        res.render('home');
    }else{
        pin = req.user.pincode;
        
        res.render('home', { pin });
    }
   
        
});



let details = {
    data : "no data",   
}

let arr = [{}];


const subs = async () => {
    const pin = await Subs.find({});  
    console.log("sub1")
    
    for(let i = 0; i < pin.length; i++){ 
              
        const p = pin[i].pincode[0];
              
        let index = arr.findIndex(x => x.pincode == p);    
        details.data = '';
        if(index == -1){ 
            
                         
            await axios.get('https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin',{
            params : {
                pincode : p,
                date : today
            }
            },headers = {
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
              })
            .then(function (response) {  
                          
                 details.data = ''; 
                    if(!response.data.centers.length){
                    
                    }
                else{
                                   
                    for(let s of response.data.centers){                
                        
                        for(let session of s.sessions){
                           
                            if(session.available_capacity_dose1!=0 && session.min_age_limit == 45){
                            index = arr.findIndex(x => x.pincode == p);
                               
                                if(index == -1){                                    
                                    arr.push({pincode : p, start : Date.now()});
                                }
                                if(s.fee_type == "Free"){      
                                    details.data +=
                                
`
Center : ${s.name}
Address : ${s.address}
Date : ${session.date}
Dose 1 : ${session.available_capacity_dose1}
Fees : Free
Vaccine : ${session.vaccine}
Min-Age-limit : ${session.min_age_limit}

`;
                                    
                                }else{
                                    
                                    details.data +=                  
`
Center : ${s.name}
Address : ${s.address}
Date : ${session.date}
Dose 1 : ${session.available_capacity_dose1}
Fees : ${s.vaccine_fees[0].fee}
Vaccine : ${session.vaccine}
Min-Age-limit : ${session.min_age_limit}

`;  
                                } 
                                
                        }else{
                          
                        }
                    }
                }
            }
                
               
            })
            .catch(function (error) {             
                                
                                       
         })
        
    }


    else if((Date.now()-arr[index].start) >= 3300000){
            console.log("second1")
            await axios.get('https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin',{
            params : {
                pincode : p,
                date : today
            }
            },headers = {
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
              })
            .then(function (response) {     
                     
                details.data = '';
                    if(!response.data.centers.length){
                       index = arr.findIndex(x => x.pincode == p);  
                       if(index != -1){
                            arr.splice(index, 1);
                       }
                    }
                else{
                                  
                    for(let s of response.data.centers){                
                        
                        for(let session of s.sessions){
                            
                            if(session.available_capacity_dose1!=0 && session.min_age_limit == 45){
                                index = arr.findIndex(x => x.pincode == p);  
                                if(index != -1){                                        
                                        arr[index].start = Date.now();
                                }                               
                                                                     
                                if(s.fee_type == "Free"){      
                                                        
                                    details.data +=
                                        `
Center : ${s.name}
Address : ${s.address}
Date : ${session.date}
Dose 1 : ${session.available_capacity_dose1}
Fees : Free
Vaccine : ${session.vaccine}
Min-Age-limit : ${session.min_age_limit}

`;
                                    
                                }else{
                                    
                                    details.data +=
                                        `
Center : ${s.name}
Address : ${s.address}
Date : ${session.date}
Dose 1 : ${session.available_capacity_dose1}
Fees : ${s.vaccine_fees[0].fee}
Vaccine : ${session.vaccine}
Min-Age-limit : ${session.min_age_limit}

`;
                                } 
                                
                        }
                        
                        
                    }
                }
            }
                
               
            })
            .catch(function (error) {
                
                details.del = 1;
            })
        
    }  
    else{
        console.log("third1")
        details.data = '';
    }
   
        const users = await UserSubs.find({userpincode : p});
        for(u of users){         
            const userdetails = await User.find({_id : u.user});          
                      
                if(details.data){                      
                    let final  = "List of available centres : " + details.data + `\nDeveloped by - Rushikesh Rajendra Wani\n`+
`Please Visit our website for more information`
                    mailOptions.to = userdetails[0].email;
                    mailOptions.subject = `Vaccine for Dose 1 found at ${p} for 45+`;            
                    mailOptions.text = final;     
                    
                    sendingMail(mailOptions)
                    .then((result) => console.log(`email sent to ${p}`))
                    .catch((error) => console.log(error.message));
                    
                  
                }                                    
        }
    }       
    console.log("Arr1 = ")
    console.log(arr);
}

setInterval(() => {
    subs();
},300000)


let details2 = {
    data : "no data",
    
  
}

let arr2 = [{}];


const subs2 = async () => {
    const pin = await Subs.find({});
    console.log("sub2")
   
    for(let i = 0; i < pin.length; i++){ 
        details2.del = 0;         
        const p = pin[i].pincode[0];
        console.log(`for pin ${p}`)
        let index = arr2.findIndex(x => x.pincode == p);    
        details2.data = '';
        if(index == -1){   
              
            console.log("first2")
            await axios.get('https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin',{
            params : {
                pincode : p,
                date : today
            }
            },headers = {
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
              })
            .then(function (response) {  
                         
                 details2.data = ''; 
                    if(!response.data.centers.length){
                    
                    }
                else{
                                   
                    for(let s of response.data.centers){                
                        
                        for(let session of s.sessions){
                            
                            if(session.available_capacity_dose2!=0 && session.min_age_limit == 45){
                                index = arr2.findIndex(x => x.pincode == p);  
                                if(index == -1){                                  
                                    arr2.push({pincode : p, start : Date.now()});
                                }
                                if(s.fee_type == "Free"){      
                                    details2.data +=
                                
`
Center : ${s.name}
Address : ${s.address}
Date : ${session.date}
Dose 2 : ${session.available_capacity_dose2}
Fees : Free
Vaccine : ${session.vaccine}
Min-Age-limit : ${session.min_age_limit}

`;
                                    
                                }else{
                                    
                                    details2.data +=                  
`
Center : ${s.name}
Address : ${s.address}
Date : ${session.date}
Dose 2 : ${session.available_capacity_dose2}
Fees : ${s.vaccine_fees[0].fee}
Vaccine : ${session.vaccine}
Min-Age-limit : ${session.min_age_limit}

`;  
                                } 
                                
                        }
                    }
                }
            }
                
               
            })
            .catch(function (error) {
                
                
                details2.del = 1;          
                                       
         })
        
    }


    else if((Date.now()-arr2[index].start) >= 3300000){
        console.log("second2")
            await axios.get('https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin',{
            params : {
                pincode : p,
                date : today
            }
            },headers = {
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
              })
            .then(function (response) {     
                     
                details2.data = '';
                    if(!response.data.centers.length){
                       index = arr2.findIndex(x => x.pincode == p); 
                      
                       if(index != -1){
                            arr2.splice(index, 1);
                       }
                    }
                else{              
                                                                          
                    for(let s of response.data.centers){                
                        
                        for(let session of s.sessions){
                            
                            if(session.available_capacity_dose2!=0 && session.min_age_limit == 45){
                                index = arr2.findIndex(x => x.pincode == p);
                                if(index != -1){
                                    arr2[index].start = Date.now();
                                }
                                    
                                                               
                                if(s.fee_type == "Free"){      
                                                        
                                    details2.data +=
                                        `
Center : ${s.name}
Address : ${s.address}
Date : ${session.date}
Dose 2 : ${session.available_capacity_dose2}
Fees : Free
Vaccine : ${session.vaccine}
Min-Age-limit : ${session.min_age_limit}

`;
                                    
                                }else{
                                    
                                    details2.data +=
                                        `
Center : ${s.name}
Address : ${s.address}
Date : ${session.date}
Dose 2 : ${session.available_capacity_dose2}
Fees : ${s.vaccine_fees[0].fee}
Vaccine : ${session.vaccine}
Min-Age-limit : ${session.min_age_limit}

`;
                                } 
                                
                        }
                        
                        
                    }
                }
            }
                
               
            })
            .catch(function (error) {                
                
            })
        
    }  
    else{
        console.log("third2")
        details2.data = '';
    }
    
        const users = await UserSubs2.find({userpincode : p});
       
        for(u of users){         
            const userdetails = await User.find({_id : u.user});          
                      
                if(details2.data){                      
                    let final  = "List of available centres : " + details2.data + `\nDeveloped by - Rushikesh Rajendra Wani\n`+
`Please Visit our website for more information`
                    mailOptions.to = userdetails[0].email;
                    mailOptions.subject = `Vaccine for Dose 2 found at ${p} for 45+`;            
                    mailOptions.text = final;     
                  
                    sendingMail(mailOptions)
                    .then((result) => console.log(`email sent to ${p}`))
                    .catch((error) => console.log(error.message));
                  
                }                                    
        }
        

    }
    console.log("Arr2 = ") 
   console.log(arr2)
}

setTimeout(() =>{
setInterval(() => { 
        subs2();     
},300000)
},60000)


const bigArray = async() =>{
    let doseArray1 = []
    let doseArray2 = []
    const dose1 = await UserSubs.find({});
    const dose2 =await UserSubs2.find({});
    for(let i = 0; i < dose1.length; i++){
        doseArray1.push(dose1[i].userpincode[0])
    }
    for(let i = 0; i < dose2.length; i++){
        doseArray2.push(dose2[i].userpincode[0])
    }
    const pins = await Subs.find({});
    for(let i = 0; i < pins.length; i++){
            let p = pins[i].pincode[0]
            let index1 = doseArray1.indexOf(p);
            let index2 = doseArray2.indexOf(p);
            if((index1 == -1) && (index2 == -1)){
                console.log("deleted2")
                await Subs.findOneAndDelete({pincode : { $in : p}});
            }
    }
}

setInterval(() => {
    bigArray();
},900000)

//under 45 above 18
let details18 = {
    data : "no data",   
}

let arr18 = [{}];


const subs18 = async () => {
    const pin = await Subs.find({});  
    console.log("sub18")
    
    for(let i = 0; i < pin.length; i++){ 
              
        const p = pin[i].pincode[0];
        console.log(`for pin ${p}`)        
        let index = arr18.findIndex(x => x.pincode == p);    
        details18.data = '';
        if(index == -1){ 
            
            console.log("first18")                
            await axios.get('https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin',{
            params : {
                pincode : p,
                date : today
            }
            },headers = {
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
              })
            .then(function (response) {  
                          
                 details18.data = ''; 
                    if(!response.data.centers.length){
                        console.log(`no data for ${p}`)
                    }
                else{
                                   
                    for(let s of response.data.centers){                
                        
                        for(let session of s.sessions){
                            
                            if(session.available_capacity_dose1!=0 && session.min_age_limit == 18){
                            index = arr18.findIndex(x => x.pincode == p);
                           
                                if(index == -1){                                    
                                    arr18.push({pincode : p, start : Date.now()});
                                }
                                if(s.fee_type == "Free"){      
                                    details18.data +=
                                
`
Center : ${s.name}
Address : ${s.address}
Date : ${session.date}
Dose 1 : ${session.available_capacity_dose1}
Fees : Free
Vaccine : ${session.vaccine}
Min-Age-limit : ${session.min_age_limit}

`;
                                    
                                }else{
                                    
                                    details18.data +=                  
`
Center : ${s.name}
Address : ${s.address}
Date : ${session.date}
Dose 1 : ${session.available_capacity_dose1}
Fees : ${s.vaccine_fees[0].fee}
Vaccine : ${session.vaccine}
Min-Age-limit : ${session.min_age_limit}

`;  
                                } 
                                
                        }else{
                          
                        }
                    }
                }
            }
                
               
            })
            .catch(function (error) {             
                                
                                       
         })
        
    }


    else if((Date.now()-arr18[index].start) >= 3300000){
            console.log("second18")
            await axios.get('https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin',{
            params : {
                pincode : p,
                date : today
            }
            },headers = {
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
              })
            .then(function (response) {     
                     
                details.data = '';
                    if(!response.data.centers.length){
                       index = arr18.findIndex(x => x.pincode == p);  
                       if(index != -1){
                            arr18.splice(index, 1);
                       }
                    }
                else{
                                  
                    for(let s of response.data.centers){                
                        
                        for(let session of s.sessions){
                            
                            if(session.available_capacity_dose1!=0 && session.min_age_limit == 18){
                                index = arr18.findIndex(x => x.pincode == p);  
                                if(index != -1){                                        
                                        arr18[index].start = Date.now();
                                }                               
                                                                     
                                if(s.fee_type == "Free"){      
                                                        
                                    details18.data +=
                                        `
Center : ${s.name}
Address : ${s.address}
Date : ${session.date}
Dose 1 : ${session.available_capacity_dose1}
Fees : Free
Vaccine : ${session.vaccine}
Min-Age-limit : ${session.min_age_limit}

`;
                                    
                                }else{
                                    
                                    details18.data +=
                                        `
Center : ${s.name}
Address : ${s.address}
Date : ${session.date}
Dose 1 : ${session.available_capacity_dose1}
Fees : ${s.vaccine_fees[0].fee}
Vaccine : ${session.vaccine}
Min-Age-limit : ${session.min_age_limit}

`;
                                } 
                                
                        }
                        
                        
                    }
                }
            }
                
               
            })
            .catch(function (error) {
                
                
            })
        
    }  
    else{
        console.log("third1")
        details18.data = '';
    }
   
        const users = await UserSubs18.find({userpincode : p});
        for(u of users){         
            const userdetails = await User.find({_id : u.user});          
                      
                if(details18.data){                      
                    let final  = "List of available centres : " + details18.data + `\nDeveloped by - Rushikesh Rajendra Wani\n`+
`Please Visit our website for more information`
                    mailOptions.to = userdetails[0].email;
                    mailOptions.subject = `Vaccine for Dose 1 found at ${p} for 18+`;            
                    mailOptions.text = final;     
                
                    sendingMail(mailOptions)
                    .then((result) => console.log(`email sent to ${p}`))
                    .catch((error) => console.log(error.message)); 
                                        
                  
                }                                    
        }
    }       
    console.log("Arr18 = ")
    console.log(arr18);
}

setTimeout(() =>{
setInterval(() => {    
        subs18();    
}, 300000)
},120000)


let details182 = {
    data : "no data",
    
  
}

let arr182 = [{}];


const subs182 = async () => {
    const pin = await Subs.find({});
    console.log("sub182")
    
    for(let i = 0; i < pin.length; i++){ 
        details182.del = 0;         
        const p = pin[i].pincode[0];
        console.log(`for pin ${p}`)
        let index = arr182.findIndex(x => x.pincode == p);    
        details182.data = '';
        if(index == -1){   
              
            console.log("first182")
            await axios.get('https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin',{
            params : {
                pincode : p,
                date : today
            }
            },headers = {
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
              })
            .then(function (response) {  
                         
                 details182.data = ''; 
                    if(!response.data.centers.length){
                    
                    }
                else{
                                   
                    for(let s of response.data.centers){                
                        
                        for(let session of s.sessions){
                            
                            if(session.available_capacity_dose2!=0 && session.min_age_limit == 18){
                                index = arr182.findIndex(x => x.pincode == p);  
                                if(index == -1){                                  
                                    arr182.push({pincode : p, start : Date.now()});
                                }
                                if(s.fee_type == "Free"){      
                                    details182.data +=
                                
`
Center : ${s.name}
Address : ${s.address}
Date : ${session.date}
Dose 2 : ${session.available_capacity_dose2}
Fees : Free
Vaccine : ${session.vaccine}
Min-Age-limit : ${session.min_age_limit}

`;
                                    
                                }else{
                                    
                                    details182.data +=                  
`
Center : ${s.name}
Address : ${s.address}
Date : ${session.date}
Dose 2 : ${session.available_capacity_dose2}
Fees : ${s.vaccine_fees[0].fee}
Vaccine : ${session.vaccine}
Min-Age-limit : ${session.min_age_limit}

`;  
                                } 
                                
                        }
                    }
                }
            }
                
               
            })
            .catch(function (error) {
                
                
                      
                                       
         })
        
    }


    else if((Date.now()-arr182[index].start) >= 3300000){
        console.log("second182")
            await axios.get('https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin',{
            params : {
                pincode : p,
                date : today
            }
            },headers = {
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
              })
            .then(function (response) {     
                     
                details182.data = '';
                    if(!response.data.centers.length){
                       index = arr182.findIndex(x => x.pincode == p); 
                      
                       if(index != -1){
                            arr182.splice(index, 1);
                       }
                    }
                else{              
                                                                          
                    for(let s of response.data.centers){                
                        
                        for(let session of s.sessions){
                            
                            if(session.available_capacity_dose2!=0){
                                index = arr182.findIndex(x => x.pincode == p);
                                if(index != -1){
                                    arr182[index].start = Date.now();
                                }
                                    
                                                               
                                if(s.fee_type == "Free"){      
                                                        
                                    details182.data +=
                                        `
Center : ${s.name}
Address : ${s.address}
Date : ${session.date}
Dose 2 : ${session.available_capacity_dose2}
Fees : Free
Vaccine : ${session.vaccine}
Min-Age-limit : ${session.min_age_limit}

`;
                                    
                                }else{
                                    
                                    details182.data +=
                                        `
Center : ${s.name}
Address : ${s.address}
Date : ${session.date}
Dose 2 : ${session.available_capacity_dose2}
Fees : ${s.vaccine_fees[0].fee}
Vaccine : ${session.vaccine}
Min-Age-limit : ${session.min_age_limit}

`;
                                } 
                                
                        }
                        
                        
                    }
                }
            }
                
               
            })
            .catch(function (error) {                
                
            })
        
    }  
    else{
        console.log("third182")
        details182.data = '';
    }
    
        const users = await UserSubs182.find({userpincode : p});
       
        for(u of users){         
            const userdetails = await User.find({_id : u.user});          
                      
                if(details182.data){                      
                    let final  = "List of available centres : " + details182.data + `\nDeveloped by - Rushikesh Rajendra Wani\n`+
`Please Visit our website for more information`
                    mailOptions.to = userdetails[0].email;
                    mailOptions.subject = `Vaccine for Dose 2 found at ${p} for 18+`;            
                    mailOptions.text = final;     
                  
                    sendingMail(mailOptions)
                    .then((result) => console.log(`email sent to ${p}`))
                    .catch((error) => console.log(error.message));
                  
                }                                    
        }
        

    }
    console.log("Arr182 = ") 
   console.log(arr182)
}


setTimeout(() =>{
setInterval(() => {      
        subs182();   
}, 300000)
},180000)  

setInterval(() =>{
    console.log("test");
},60000);

app.get('/donate',(req, res)=>{
    res.render('payment');
})

app.use('/user',userRoutes);
app.use('/post',postRoutes);
app.use('/help',helpRoutes);
app.use('/admin',adminRoutes);

app.all('*',(req, res, next) => {
    throw new AppError("No Page Found", 404);
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;    
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

const port = process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`listening on port ${port}`)
});