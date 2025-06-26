$(document).ready(function () {
  $("#login_form").submit(function (event) {
    event.preventDefault();
    $("#message").html(""); // Clear previous messages

    var form = $("#login_form")[0]; // Ensure we get the raw DOM element
    var formData = new FormData(form); // Correctly captures all inputs and files

    // Debugging: Check FormData contents
    for (let pair of formData.entries()) {
    //   console.log(pair[0] + ": " + pair[1]);
    }

    $.ajax({
      url: "/admin/login",
      type: "POST",
      data: formData,
      contentType: false, // Important for FormData
      processData: false, // Prevent jQuery from converting to a string
      dataType: "json",
      success: function (res) {
        // console.log(res);
        if (res.status === 401) {
          $("#message").html('<p class="error">Validation failed.</p>');
          res.errors.forEach((error) => {
            $("#" + error.path + "_error").text(error.msg);
          });
        } else if (res.status === 400) {
          ToastAlert("warning", res.message);
        } else if (res.status === 500) {
          ToastAlert("warning", res.message);
        } else {
          ToastAlert("success", res.message);
          setTimeout(function () {
            window.location.href = "/admin/dashboard";
          }, 1000);
        }
      },
      error: function (xhr) {
        let errorMessage = "An error occurred.";
        if (xhr.responseJSON && xhr.responseJSON.message) {
          errorMessage = xhr.responseJSON.message;
        }
        ToastAlert("warning", errorMessage);
      },
    });
  });
});
