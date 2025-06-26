$(function () {
  getOrganisationsForDrop("export_org_id");
  getStandardsForDropById("export_standard");

  getOrganisationsForDrop("import_org_id");
  getStandardsForDropById("import_standard");

  new SlimSelect({ select: "#export_section" });
  new SlimSelect({ select: "#import_section" });

  $("#export_create_form").on("submit", function (e) {
    e.preventDefault();

    const formData = $(this).serialize();

    $.ajax({
      url: "/admin/students/export",
      method: "POST",
      data: formData,
      xhrFields: {
        responseType: "blob",
      },
      success: function (data, status, xhr) {
        const blob = new Blob([data], {
          type: xhr.getResponseHeader("Content-Type"),
        });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = "students_export.xlsx";
        link.click();
      },
      error: function (err) {
        alert("Error during export.");
        console.error(err);
      },
    });
  });

  $("#import_create_form").submit(function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    $.ajax({
      url: "/admin/students/import",
      method: "POST",
      data: formData,
      contentType: false,
      processData: false,
      success: function (res) {
        if (res.status === 200) {
          ToastAlert("success", res.message);
        } else if (res.status === 401) {
          res.errors.forEach((error) => {
            $("#" + error.path + "_error").text(error.msg);
          });
        } else if (res.status === 400) {
          ToastAlert("warning", res.message);
        } else if (res.status === 500) {
          ToastAlert("warning", res.message);
        } else {
          ToastAlert("warning", res.message);
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
