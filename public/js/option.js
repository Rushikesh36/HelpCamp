const select = document.querySelector('#search')
const pc = document.querySelector('.pc');
const city = document.querySelector('.city');

select.addEventListener('input',()=>{
    const option = select.value;
    if(option == 'pincode'){
        pc.style.display = 'block'
        city.style.display = 'none'
    }   
    if(option == 'city'){
        city.style.display = 'block'
        pc.style.display = 'none'
    } 
    if(option == 'Select Search Criteria'){
        city.style.display = 'none'
        pc.style.display = 'none'
    }
})