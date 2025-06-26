var orgIndex = 0;
var editOrgIndex = 0;
document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("rowContainer");

  container.addEventListener("click", function (e) {
    // Add button logic
    if (e.target.matches("[data-add-btn]")) {
      const levels = window.LEVEL_COUNT || 0;
      let levelOptions = "";
      for (let i = 1; i <= levels; i++) {
        levelOptions += `<option value="${i}">${i}</option>`;
      }

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = `<div class="row form-row">
            <div class="col-sm-3">
                <div class="form-group">
                    <label>Standard</label>
                    <select name="org_details[${
                      orgIndex + 1
                    }][standard]" class="form-control standard-dropdown">
                        <option value="">Select Standard</option>
                    </select>
                    <p class="validate_error text-danger"></p>
                </div>
            </div>
            <div class="col-sm-3">
                <div class="form-group">
                    <label>Section</label>
                    <select name="org_details[${
                      orgIndex + 1
                    }][section]" class="form-control section-dropdown">
                                <option value="">Select Section</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                                <option value="E">E</option>
                                <option value="F">F</option>
                            </select>
                    <p class="validate_error text-danger"></p>
                </div>
            </div>
            <div class="col-sm-3">
                <div class="form-group">
                    <label>Level</label>
                    <select name="org_details[${
                      orgIndex + 1
                    }][level]" class="form-control level-dropdown">
                        <option value="">Select Level</option>
                        ${levelOptions}
                    </select>
                    <p class="validate_error text-danger"></p>
                </div>
            </div>
            <div class="col-sm-2">
                <div class="form-group">
                    <label>Student Count</label>
                    <input class="form-control" type="number" name="org_details[${
                      orgIndex + 1
                    }][student_count]" placeholder="Enter count">
                    <p class="validate_error text-danger"></p>
                </div>
            </div>
            <div class="col-sm-1 d-flex align-items-end">
                <div class="form-group">
                    <button type="button" class="btn btn-danger" data-remove-btn>-</button>
                    <button type="button" class="btn btn-success" data-add-btn>+</button>
                </div>
            </div>
        </div>`;
      orgIndex++;
      const newRow = tempDiv.firstElementChild;
      container.appendChild(newRow);

      // Initialize SlimSelect and load options
      const standardSelect = newRow.querySelector(".standard-dropdown");
      const sectionSelect = newRow.querySelector(".section-dropdown");
      const levelSelect = newRow.querySelector(".level-dropdown");
      getStandardsForDrop(standardSelect);
      new SlimSelect({ select: sectionSelect });
      new SlimSelect({ select: levelSelect });
    }

    // Remove button logic
    if (e.target.matches("[data-remove-btn]")) {
      const rows = container.querySelectorAll(".form-row");
      if (rows.length > 1) {
        e.target.closest(".form-row").remove();
      } else {
        ToastAlert("warning", "At least one row is required.");
      }
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("organisation_edit");

  container.addEventListener("click", function (e) {
    // Add button logic
    if (e.target.matches("[data-add-btn]")) {
      const levels = window.LEVEL_COUNT || 0;
      let levelOptions = "";
      for (let i = 1; i <= levels; i++) {
        levelOptions += `<option value="${i}">${i}</option>`;
      }

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = `<div class="row form-row">
            <div class="col-sm-3">
                <div class="form-group">
                    <label>Standard</label>
                    <select name="edit_org_details[${editOrgIndex}][standard]" class="form-control standard-dropdown">
                        <option value="">Select Standard</option>
                    </select>
                    <p class="validate_error text-danger"></p>
                </div>
            </div>
            <div class="col-sm-3">
                <div class="form-group">
                    <label>Section</label>
                    <select name="edit_org_details[${editOrgIndex}][section]" class="form-control section-dropdown">
                                <option value="">Select Section</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                                <option value="E">E</option>
                                <option value="F">F</option>
                            </select>
                    <p class="validate_error text-danger"></p>
                </div>
            </div>
            <div class="col-sm-3">
                <div class="form-group">
                    <label>Level</label>
                    <select name="edit_org_details[${editOrgIndex}][level]" class="form-control level-dropdown">
                        <option value="">Select Level</option>
                        ${levelOptions}
                    </select>
                    <p class="validate_error text-danger"></p>
                </div>
            </div>
            <div class="col-sm-2">
                <div class="form-group">
                    <label>Student Count</label>
                    <input class="form-control" type="number" name="edit_org_details[${editOrgIndex}][student_count]" placeholder="Enter count">
                    <p class="validate_error text-danger"></p>
                </div>
            </div>
            <div class="col-sm-1 d-flex align-items-end">
                <div class="form-group">
                    <button type="button" class="btn btn-danger" data-remove-btn>-</button>
                    <button type="button" class="btn btn-success" data-add-btn>+</button>
                </div>
            </div>
        </div>`;
      editOrgIndex++;
      const newRow = tempDiv.firstElementChild;
      container.appendChild(newRow);

      // Initialize SlimSelect and load options
      const standardSelect = newRow.querySelector(".standard-dropdown");
      const sectionSelect = newRow.querySelector(".section-dropdown");
      const levelSelect = newRow.querySelector(".level-dropdown");
      getStandardsForDrop(standardSelect);
      new SlimSelect({ select: sectionSelect });
      new SlimSelect({ select: levelSelect });
    }

    // Remove button logic
    if (e.target.matches("[data-remove-btn]")) {
      const rows = container.querySelectorAll(".form-row");
      if (rows.length > 1) {
        e.target.closest(".form-row").remove();
      } else {
        ToastAlert("warning", "At least one row is required.");
      }
    }
  });
});

$(function () {
  LoadTableData();

  getSubjectForDropMultiple("subject");
  const firstStandard = document.querySelector(".standard-dropdown");
  if (firstStandard) {
    getStandardsForDrop(firstStandard);
  }
  new SlimSelect({ select: ".section-dropdown" });
  new SlimSelect({ select: ".level-dropdown" });

  const firstStandard1 = document.querySelector(".edit_standard-dropdown");
  if (firstStandard1) {
    getStandardsForDrop(firstStandard1);
  }
  new SlimSelect({ select: ".edit_section-dropdown" });
  new SlimSelect({ select: ".edit_level-dropdown" });

  $("#organisation_create_form").submit(function (e) {
    e.preventDefault();
    LoadStart();
    const formData = new FormData(this);
    $.ajax({
      url: "/admin/organisation/create",
      method: "POST",
      data: formData,
      contentType: false,
      processData: false,
      success: function (res) {
        LoadStop();
        if (res.status === 200) {
          ToastAlert("success", res.message);
          LoadTableData();
          $("#organisation_create_form")[0].reset();
          $("#organisation_create_modal .close").click();
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

  $("#organisation_edit_form").on("submit", function (e) {
    e.preventDefault();
    LoadStart();

    const formData = new FormData(this);

    $.ajax({
      url: "/admin/organisation/update",
      method: "POST",
      data: formData,
      contentType: false,
      processData: false,
      success: function (res) {
        LoadStop();
        if (res.status === 200) {
          ToastAlert("success", res.message);
          LoadTableData();
          $("#organisation_edit_form")[0].reset();
          $("#organisation_edit_modal .close").click();
          $("#organisation_edit").html("");
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
});

function LoadTableData() {
  $.ajax({
    url: "/admin/organisation/list",
    method: "POST",
    contentType: false,
    processData: false,
    success: function (res) {
      if (res.status === 200) {
        renderTable("organisation-table", res.data);
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
      { key: "name", label: "Organiser Name", orderable: true, type: "text" },
      { key: "mobile", label: "Phone Number", orderable: true, type: "text" },
      { key: "email", label: "Email", orderable: false, type: "text" },
      { key: "subject_name", label: "Subjects", orderable: true },
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
      url: "/admin/organisation/data",
      type: "POST",
      data: { id },
      success: async function (res) {
        if (res.status === 200) {
          const data = res.data;
          const data1 = res.data1;

          const selectSubject = await getSubjectForDropMultiple(
            "edit_subject",
            JSON.parse(data.subject)
          );

          $("#edit_id").val(data.id);
          $("#edit_org_name").val(data.org_name);
          $("#edit_name").val(data.name);
          $("#edit_mobile").val(data.mobile);
          $("#edit_email").val(data.email);
          $("#edit_profile_image")
            .closest(".form-group")
            .find("a")
            .attr("href", `../${data.profile_image}`);

          if (data1.length > 0) {
            $("#organisation_edit").html('');
          }

          const levels = window.LEVEL_COUNT || 0;
          let levelOptions = "";
          for (let i = 1; i <= levels; i++) {
            levelOptions += `<option value="${i}">${i}</option>`;
          }
          for (const value of data1) {
            html = `<div class="row form-row">
                    <div class="col-sm-3">
                        <div class="form-group">
                            <label>Standard</label>
                            <select name="edit_org_details[${editOrgIndex}][standard]" class="form-control edit_standard-dropdown">
                                <option value="">Select Standard</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-sm-3">
                        <div class="form-group">
                            <label>Section</label>
                            <select name="edit_org_details[${editOrgIndex}][section]" class="form-control edit_section-dropdown">
                                <option value="">Select Section</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                                <option value="E">E</option>
                                <option value="F">F</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-sm-3">
                        <div class="form-group">
                            <label>Level</label>
                            <select name="edit_org_details[${editOrgIndex}][level]" class="form-control edit_level-dropdown">
                                <option value="">Select Level</option>
                                ${levelOptions}
                            </select>
                        </div>
                    </div>
                    <div class="col-sm-2">
                        <div class="form-group">
                            <label>Student Count</label>
                            <input class="form-control" type="number" name="edit_org_details[${editOrgIndex}][student_count]"
                                placeholder="Enter count" value="${value.stu_count}">
                            <input type="hidden" name="edit_org_details[${editOrgIndex}][edit_id1]" id="edit_id1" value="${value.id}">
                        </div>
                    </div>
                    <div class="col-sm-1 d-flex align-items-end">
                        <div class="form-group">
                            <button type="button" class="btn btn-danger" data-remove-btn>-</button>
                            <button type="button" class="btn btn-success" data-add-btn>+</button>
                        </div>
                    </div>
                </div>`;
            const newRow = $(html);
            $("#organisation_edit").append(newRow);

            const standardSelect = newRow.find(".edit_standard-dropdown")[0];
            getStandardsForDrop(standardSelect, value.standard);

            const sectionSelect = newRow.find(".edit_section-dropdown")[0];
            const sectionSlim = new SlimSelect({ select: sectionSelect });
            if (value.section) {
              sectionSlim.setSelected([String(value.section)]);
            }

            const levelSelect = newRow.find(".edit_level-dropdown")[0];
            const levelSlim = new SlimSelect({ select: levelSelect });
            if (value.levels) {
              levelSlim.setSelected([String(value.levels)]);
            }
            editOrgIndex++;
          }

          OpenModal("organisation_edit_modal");
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
        url: "/admin/organisation/destroy",
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
