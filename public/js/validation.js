(function() {
  'use strict';
  window.addEventListener('load', function() {
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.validated-form');
    // Loop over them and prevent submission
    var validation = Array.prototype.filter.call(forms, function(form) {
      form.addEventListener('submit', function(event) {
        if (form.checkValidity() === false) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add('was-validated');
      }, false);
    });
  }, false);
})();

function myFunction() {
  var x = document.getElementById("myInput");
  if (x.type === "password") {
    x.type = "text";
  } else {
    x.type = "password";
  }  
}

function cnfPassword() {
  var y = document.getElementById("cnf");
  if (y.type === "password") {
    y.type = "text";
  } else {
    y.type = "password";
  }  
}

function oldPassword() {
  var z = document.getElementById("old");
  if (z.type === "password") {
    z.type = "text";
  } else {
    z.type = "password";
  }  
}


