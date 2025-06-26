$(function () {
  LoadTableData();
  getOrganisationsForDrop("org_id");
  getStandardsForDropById("standard");
  new SlimSelect({
    select: document.querySelector(".section-dropdown"),
  });

  getSubjectForDropMultiple("individual_subject");
  new SlimSelect({
    select: "#individual_level",
  });

  $("#users_create_form").submit(function (e) {
    e.preventDefault();
    LoadStart();
    const formData = new FormData(this);
    $.ajax({
      url: "/admin/users/create",
      method: "POST",
      data: formData,
      contentType: false,
      processData: false,
      success: function (res) {
        LoadStop();
        if (res.status === 200) {
          ToastAlert("success", res.message);
          LoadTableData();
          $("#users_create_form")[0].reset();
          $("#users_create_modal .close").click();
          orgIndex = 0;
          editOrgIndex = 0;
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

  $("#users_edit_form").on("submit", function (e) {
    e.preventDefault();
    LoadStart();

    const formData = new FormData(this);

    $.ajax({
      url: "/admin/users/update",
      method: "POST",
      data: formData,
      contentType: false,
      processData: false,
      success: function (res) {
        LoadStop();
        if (res.status === 200) {
          ToastAlert("success", res.message);
          LoadTableData();
          $("#users_edit_form")[0].reset();
          $("#users_edit_modal .close").click();
          orgIndex = 0;
          editOrgIndex = 0;
        } else if (res.status === 401) {
          res.errors.forEach((error) => {
            $("#" + error.path + "_error").text(error.msg);
          });
        } else {
          ToastAlert("warning", res.message);
        }
      },
      error: function (xhr) {
        LoadStop();
        const errorMessage = xhr.responseJSON?.message || "An error occurred.";
        ToastAlert("warning", errorMessage);
      },
    });
  });

  $("#individual_create_form").submit(function (e) {
    e.preventDefault();
    LoadStart();
    const formData = new FormData(this);
    $.ajax({
      url: "/admin/individualuser/create",
      method: "POST",
      data: formData,
      contentType: false,
      processData: false,
      success: function (res) {
        LoadStop();
        if (res.status === 200) {
          ToastAlert("success", res.message);
          LoadTableData();
          $("#individual_create_form")[0].reset();
          $("#individual_create_modal .close").click();
          orgIndex = 0;
          editOrgIndex = 0;
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

  $("#individual_edit_form").submit(function (e) {
    e.preventDefault();
    LoadStart();
    const formData = new FormData(this);
    $.ajax({
      url: "/admin/individualuser/update",
      method: "POST",
      data: formData,
      contentType: false,
      processData: false,
      success: function (res) {
        LoadStop();
        if (res.status === 200) {
          ToastAlert("success", res.message);
          LoadTableData();
          $("#individual_edit_form")[0].reset();
          $("#individual_edit_modal .close").click();
          orgIndex = 0;
          editOrgIndex = 0;
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

function LoadTableData() {
  $.ajax({
    url: "/admin/users/list",
    method: "POST",
    contentType: false,
    processData: false,
    success: function (res) {
      if (res.status === 200) {
        renderTable("loginusers-table", res.data);
      } else if (res.status === 401) {
        res.errors.forEach((error) => {
          $("#" + error.path + "_error").text(error.msg);
        });
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
}

function renderTable(id, data = []) {
  EasyTable(id, data, {
    columns: [
      {
        key: "org_name",
        label: "Organisation/School Name",
        orderable: true,
        type: "text",
      },
      { key: "name", label: "Student Name", orderable: true, type: "text" },
      { key: "mobile", label: "Phone Number", orderable: true, type: "text" },
      { key: "email", label: "Email", orderable: false, type: "text" },
      { key: "subject_name", label: "Subjects", orderable: true },
      { key: "type", label: "Type", orderable: true, type: "text" },
      { key: "profile_image", label: "Image", orderable: true },
      { key: "action", label: "Actions", orderable: false },
    ],
    showEntries: ["5", "10", "20", "All"],
    search: true,
  });
}

async function OpenEditModal(id) {
  try {
    $.ajax({
      url: "/admin/users/data",
      type: "POST",
      data: { id },
      success: async function (res) {
        if (res.status === 200) {
          const data = res.data;

          const selectOrganise = await getOrganisationsForDrop(
            "edit_org_id",
            JSON.parse(data.org_id)
          );
          const selectStandard = await getStandardsForDropById(
            "edit_standard",
            JSON.parse(data.standard)
          );

          setTimeout(() => {
            const sectionSelectElement = document.querySelector(
              ".edit_section-dropdown"
            );
            if (sectionSelectElement) {
              if (sectionSelectElement.slim) {
                sectionSelectElement.slim.destroy();
              }

              const editSectionSelect = new SlimSelect({
                select: ".edit_section-dropdown",
              });
              editSectionSelect.setSelected(data.section);
            }
          }, 0);

          $("#edit_id").val(data.id);
          $("#edit_name").val(data.name);
          $("#edit_mobile").val(data.mobile);
          $("#edit_email").val(data.email);
          $("#edit_username").val(data.username);
          $("#edit_profile_image")
            .closest(".form-group")
            .find("a")
            .attr("href", `../${data.profile_image}`);

          OpenModal("users_edit_modal");
        } else if (res.status === 401) {
          res.errors.forEach((error) => {
            $("#" + error.path + "_error").text(error.msg);
          });
        } else {
          ToastAlert("warning", res.message);
        }
      },
      error: function (xhr, status, error) {
        ToastAlert("error", "Error: " + error, "error");
      },
    });
  } catch (err) {
    ToastAlert("error", err);
  }
}

function DeleteData(id) {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, Delete it!",
    cancelButtonText: "No, cancel!",
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: "/admin/users/destroy",
        type: "POST",
        data: {
          id: id,
        },
        success: function (res) {
          if (res.status === 200) {
            ToastAlert("success", res.message);
            LoadTableData();
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
        error: function (xhr, status, error) {
          ToastAlert("error", "Error: " + error, "error");
        },
      });
    }
  });
}

async function IndividualOpenEditModal(id) {
  try {
    $.ajax({
      url: "/admin/users/data",
      type: "POST",
      data: { id },
      success: async function (res) {
        if (res.status === 200) {
          const data = res.data;

          const selectSubject = await getSubjectForDropMultiple(
            "edit_individual_subject",
            JSON.parse(data.subject)
          );

          setTimeout(() => {
            const sectionSelectElement = document.querySelector(
              "#edit_individual_level"
            );
            if (sectionSelectElement) {
              if (sectionSelectElement.slim) {
                sectionSelectElement.slim.destroy();
              }

              const editSectionSelect = new SlimSelect({
                select: "#edit_individual_level",
              });
              editSectionSelect.setSelected(data.level);
            }
          }, 0);

          $("#edit_individual_id").val(data.id);
          $("#edit_individual_name").val(data.name);
          $("#edit_individual_phone").val(data.mobile);
          $("#edit_individual_email").val(data.email);
          $("#edit_individual_username").val(data.username);
          $("#edit_individual_profile_image")
            .closest(".form-group")
            .find("a")
            .attr("href", `../${data.profile_image}`);

          OpenModal("individual_edit_modal");
        } else if (res.status === 401) {
          res.errors.forEach((error) => {
            $("#" + error.path + "_error").text(error.msg);
          });
        } else {
          ToastAlert("warning", res.message);
        }
      },
      error: function (xhr, status, error) {
        ToastAlert("error", "Error: " + error, "error");
      },
    });
  } catch (err) {
    ToastAlert("error", err);
  }
}
