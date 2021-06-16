const age = document.querySelector('.age')
const dose = document.querySelector('.dose');
const f1 = document.querySelector('.f1');
const f2 = document.querySelector('.f2');
const f3 = document.querySelector('.f3');
const f4 = document.querySelector('.f4');
f1.style.display = 'none';
f2.style.display = 'none';
f3.style.display = 'none';
f4.style.display = 'none';
let option1;
let option2;

age.addEventListener('input',()=>{
    option1 = age.value;
    if(option1 == 'age1' && option2 == 'd1'){
        f1.style.display = 'block';
        f2.style.display = 'none';
        f3.style.display = 'none';
        f4.style.display = 'none';
    }   
    else if(option1 == 'age1' && option2 == 'd2'){
        f2.style.display = 'block';
        f1.style.display = 'none';
        f3.style.display = 'none';
        f4.style.display = 'none';
    } 
    else if(option1 == 'age2' && option2 == 'd1'){
        f3.style.display = 'block';
        f2.style.display = 'none';
        f1.style.display = 'none';
        f4.style.display = 'none';
    } 
    else if(option1 == 'age2' && option2 == 'd2'){
        f4.style.display = 'block';
        f2.style.display = 'none';
        f3.style.display = 'none';
        f1.style.display = 'none';
    } 
    if(option1 == 'default1' || option2 == 'default2'){
        f4.style.display = 'none';
        f2.style.display = 'none';
        f3.style.display = 'none';
        f1.style.display = 'none';
    }
})

dose.addEventListener('input',()=>{
    option2 = dose.value;
    if(option1 == 'age1' && option2 == 'd1'){
        f1.style.display = 'block';
        f2.style.display = 'none';
        f3.style.display = 'none';
        f4.style.display = 'none';
    }   
    else if(option1 == 'age1' && option2 == 'd2'){
        f2.style.display = 'block';
        f1.style.display = 'none';
        f3.style.display = 'none';
        f4.style.display = 'none';
    } 
    else if(option1 == 'age2' && option2 == 'd1'){
        f3.style.display = 'block';
        f2.style.display = 'none';
        f1.style.display = 'none';
        f4.style.display = 'none';
    } 
    else if(option1 == 'age2' && option2 == 'd2'){
        f4.style.display = 'block';
        f2.style.display = 'none';
        f3.style.display = 'none';
        f1.style.display = 'none';
    } 
    if(option1 == 'default1' || option2 == 'default2'){
        f4.style.display = 'none';
        f2.style.display = 'none';
        f3.style.display = 'none';
        f1.style.display = 'none';
    }
})