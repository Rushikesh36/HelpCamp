const slotData = document.querySelector('.slotData');
const title = document.querySelector('.title');
const add = document.querySelector('.add');
const add2 = document.querySelector('.add2');
const add3 = document.querySelector('.add3');
const noSlot = document.querySelector('.noSlot');
const titlebox = document.querySelector('.titlebox');
const getDetails = document.querySelector('.getDetails');
const pin = parseInt(document.querySelector('.pin').innerText);
const pc = document.querySelector('.pc');

var currentTime = new Date();
var currentOffset = currentTime.getTimezoneOffset();
var ISTOffset = 330;   // IST offset UTC +5:30 
var today = new Date(currentTime.getTime() + (ISTOffset + currentOffset)*60000);
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();
var tog = 0;
today = dd + '-' + mm + '-' + yyyy;

const showVaccineSlots = (p) => {
    titlebox.style.display = "block";   
    let text1 = document.createElement('p');   
    add.innerHTML = '';
    add2.innerHTML = ''; 
    add3.innerHTML = '';    
    noSlot.innerHTML = '';      
    window.scrollTo(0,slotData.scrollHeight);
    slotData.innerHTML = " ";
    axios.get('https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin',{
        params : {
            pincode : p,
            date : today
        }
    })
    .then(function (response) {   
     add2.innerHTML = ''; 
     add3.innerHTML = '';
     tog = 0;
     add.innerHTML = `<b>Trying to find Available Vaccines for your pincode : ${p}</b>`;
     
      if(!response.data.centers.length){     
            add2.innerHTML = `<b>No slots available right now</b>`;                
      }
     else{
         
         add2.innerHTML = '';
         for(s of response.data.centers){
            let newSlotName = document.createElement('p');               
            let disappear = document.createElement('button');
            newSlotName.innerHTML = `<b>${s.name}</b>`;
            for(session of s.sessions){              
                let newSlotDetails = document.createElement('span');
                newSlotName.classList.add('card','slotName');
                newSlotDetails.classList.add('card','slotDetails','text-center');              
                if(session.available_capacity!=0){
                    if(s.fee_type == "Free"){
                        tog = 1;
                    newSlotDetails.innerText = `  Date : ${session.date}
                      Dose 1 : ${session.available_capacity_dose1}
                      Dose 2 : ${session.available_capacity_dose2}
                      Fees : Free
                      Vaccine : ${session.vaccine}
                      Min-Age-limit : ${session.min_age_limit}`;  
                    }else{
                        tog=1;
                        newSlotDetails.innerText = `Date : ${session.date}
                        Dose 1 : ${session.available_capacity_dose1}
                        Dose 2 : ${session.available_capacity_dose2}
                        Fees : ${s.vaccine_fees[0].fee}
                        Vaccine : ${session.vaccine}
                        Min-Age-limit : ${session.min_age_limit}`;  
                    } 
                    newSlotDetails.setAttribute("style","display:none");                        
                disappear.classList.add("btn","btn-danger");
                disappear.innerText = "hide";                
                disappear.style.display = "none";
                newSlotName.addEventListener('click',(e)=>{
                    e.preventDefault();
                    newSlotDetails.style.display = "block";                    
                    disappear.style.display = "inline";
                }) 
                disappear.addEventListener('click',(e)=>{
                    e.preventDefault();
                    e.stopPropagation()
                    newSlotDetails.style.display = "none";                    
                    disappear.style.display = "none";
                }) 
                slotData.append(newSlotName);                   
                newSlotName.append(newSlotDetails,disappear);                                   
                }else{
                    if(tog == 0){
                        add3.innerHTML = `<b>No slots available right now!!</b>`;    
                    }else{
                        add3.innerHTML = '';
                    }
                                
                }
            }                      
         }
     }
     
    })
    .catch(function (error) {    
      add.innerHTML = `<b>Trying to find Available Vaccines for your pincode : ${p}</b>`;      
      noSlot.innerHTML = `<b>Invalid Pincode</b>`;          
    })
}



pc.addEventListener('change',()=>{
    const p = pc.value;
    titlebox.style.display = 'block';
    title.style.display = 'block';
    slotData.style.display = 'block';
    showVaccineSlots(p);
})

const dropdown = document.querySelector('#dropdown');

dropdown.addEventListener('input',()=>{
    const option = dropdown.value;
    
    if(option == "first"){       
        pc.style.display = 'none'
        titlebox.style.display = 'block';
        title.style.display = 'block';
        slotData.style.display = 'block';
        showVaccineSlots(pin);  
    }   
    if(option == "second"){
        pc.style.display = 'block' 
        title.innerText = '';
        slotData.innerText = '';
        add.innerHTML = '';      
        titlebox.style.display = 'none';
        title.style.display = 'none';
        slotData.style.display = 'none';
    } 
    if(option == "default"){        
        pc.style.display = 'none'
        titlebox.style.display = 'none';
        title.style.display = 'none';
        slotData.style.display = 'none';
    }
})