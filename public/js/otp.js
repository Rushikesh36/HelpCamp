const otpBtn = document.querySelector('.otpBtn');
const cnfOtp = document.querySelector('.cnfOtp');
const username = document.querySelector('.username');
const otpText = document.querySelector('.otpText');
const showText = document.querySelector('.showText');
const spaceshow = document.querySelector('.space');
const email = document.querySelector('.email');
const otp = Math.floor(100000 + Math.random() * 900000);
const registerBtn = document.querySelector('.registerBtn');
const p1 = document.querySelector('.p1');
const p2 = document.querySelector('.p2');
const checkPassword = document.querySelector('.passwordCheck');
let otp2 = 1;
let space = 0;

email.addEventListener('change',(e) => {
    e.preventDefault();
    if(email.value){
        otpBtn.style.display = 'block';        
    }
    else{
        otpBtn.style.display = 'none';
        cnfOtp.style.display = 'none';
    }   
     
})

otpBtn.addEventListener('click',(e)=>{
    e.preventDefault();
    const mail = document.querySelector('.email').value; 
  
    axios.post('/post/otp', {
       email : mail,
       otp : otp 
    })
        .then(function (response) {
            
            
        })
        .catch(function (error) {
            
        });
    otpText.innerText = "Otp Sent Successfully on your email.";
    otpText.style.color = "green";
    cnfOtp.style.display = 'block';    
})

cnfOtp.addEventListener('input',(e)=>{
    e.preventDefault();
    otp2 = cnfOtp.value;
    
    if(otp2 == otp){
        showText.innerText = "Email Verified !!" 
        showText.style.color = 'green';  
               
    }
    else{
        showText.innerText = "Wrong OTP !!";
        showText.style.color = 'red'; 
        
    }
    if((p1.value === p2.value) && (otp == otp2)){
       
        registerBtn.disabled = false;
        
    }else{
        registerBtn.disabled = true;
        
    }
})

p2.addEventListener('input',(e)=>{
    e.preventDefault();
    if(p1.value === p2.value){
        checkPassword.innerText = 'Passwords Match !!';
        checkPassword.style.color = 'green';       
    }else{
        checkPassword.innerText = 'Passwords does not match !!';
        checkPassword.style.color = 'red';        
    }
    if((p1.value === p2.value) && (otp == otp2)){
        registerBtn.disabled = false;
      
    }else{
        registerBtn.disabled = true;
        
    }
})







function validateMyForm()
{
  if(otp2 != otp)
  { 
    alert("OTP validation failed!!");
    returnToPreviousPage();
    return false;
  }  
  return true;
}
