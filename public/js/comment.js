const add = document.querySelector('#add');
const cancel = document.querySelector('#cancel');
const submit = document.querySelector('#submit');
const form = document.querySelector('.form');

function textareaAppear(){     
    form.elements.comment.value = '';
    document.querySelector(".textarea").style.display="block"
}
function textareaDisappear(){ 
    document.querySelector(".textarea").style.display="none"
}

add.addEventListener('click',textareaAppear)

cancel.addEventListener('click',textareaDisappear)
