const editBtn = document.querySelectorAll('.editBtn');
const cancelBtn = document.querySelectorAll('#cancelBtn');
const submitBtn = document.querySelectorAll('.submitBtn');
const deleteBtn = document.querySelectorAll('.deleteBtn');
const editComment = document.querySelectorAll('.editComment');
let c = document.querySelector('.count').innerText;
const count = parseInt(c);

for(let i = 0; i < count; i++){
    function textareaAppear(){         
        editComment[i].style.display="block";
        editBtn[i].style.display = "none";
        deleteBtn[i].style.display = "none";
    }
    function textareaDisappear(){ 
        editComment[i].style.display="none";
        editBtn[i].style.display = "inline";
        deleteBtn[i].style.display = "inline";
    }    
    
    editBtn[i].addEventListener('click',textareaAppear);
    
    cancelBtn[i].addEventListener('click',textareaDisappear);    

}

