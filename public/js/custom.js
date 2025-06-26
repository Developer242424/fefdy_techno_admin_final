$(function () {
  $(".form-control").on("keyup keydown focusout change", function () {
    $(this).next(".validate_error").text("");
  });
});

function ToastAlert(icon, message) {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });
  Toast.fire({
    icon: icon,
    title: message,
  });
}

$("button.close, button.cancel").on("click", function () {
  $(this).closest('.modal').removeClass('show')
  $(this).closest('.modal').css('display', 'none');
});

function OpenModal(modal_id) {
  const modal = document.querySelector('#'+modal_id);
  modal.style.display = "block";
  setTimeout(() => modal.classList.add("show"), 0);
}

function LoadStart(){
  $('.form-submit-button').text('Submitting...')
}

function LoadStop(){
  $('.form-submit-button').text('Submit')
}
