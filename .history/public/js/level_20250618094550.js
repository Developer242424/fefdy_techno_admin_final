$(function () {
  LoadTableData();
  getSubjectForDrop("subject");
  $("#subject").on("change", function () {
    getTopicBySubjectForDrop("topic", $(this).val());
  });
  $("#topic").on("change", function () {
    getLevelCountForDrop("level", $(this).val());
  });
  
  let isInitialEditLoad = true;
  $("#edit_subject").on("change", function () {
    if (isInitialEditLoad) return;
    getTopicBySubjectForDrop("edit_topic", $(this).val());
  });
  
  $("#edit_topic").on("change", function () {
    if (isInitialEditLoad) return;
    getLevelCountForDrop("edit_level", $(this).val());
  });

  $("#level_create_form").submit(function (e) {
    e.preventDefault();
    LoadStart();
    const formData = new FormData(this);
    $.ajax({
      url: "/admin/levels/create",
      method: "POST",
      data: formData,
      contentType: false,
      processData: false,
      success: function (res) {
        LoadStop();
        if (res.status === 200) {
          ToastAlert("success", res.message);
          LoadTableData();
          $("#level_create_form")[0].reset();
          $("#level_create_modal .close").click();
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

  $("#level_edit_form").on("submit", function (e) {
    e.preventDefault();
    LoadStart();

    const formData = new FormData(this);

    $.ajax({
      url: "/admin/levels/update",
      method: "POST",
      data: formData,
      contentType: false,
      processData: false,
      success: function (res) {
        LoadStop();
        if (res.status === 200) {
          ToastAlert("success", res.message);
          LoadTableData();
          $("#level_edit_form")[0].reset();
          $("#level_edit_modal .close").click();
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
    url: "/admin/levels/list",
    method: "POST",
    contentType: false,
    processData: false,
    success: function (res) {
      if (res.status === 200) {
        renderTable("levels-table", res.data);
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
      { key: "subject_name", label: "Subject", orderable: true, type: "text" },
      { key: "topic_name", label: "Topic", orderable: true, type: "text" },
      { key: "level", label: "Level", orderable: true, type: "text" },
      { key: "title", label: "Title", orderable: true, type: "text" },
      { key: "description", label: "Description", orderable: true },
      { key: "thumbnail", label: "Thumbnail", orderable: false },
      { key: "action", label: "Actions", orderable: false },
    ],
    showEntries: ["5", "10", "20", "All"],
    search: true,
  });
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
        url: "/admin/levels/destroy",
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

async function OpenEditModal(id) {
  try {
    const selectSubject = await getSubjectForDrop("edit_subject");

    $.ajax({
      url: "/admin/levels/data",
      type: "POST",
      data: { id },
      success: async function (res) {
        if (res.status === 200) {
          const data = res.data;

          const selectSubject = await getSubjectForDrop(
            "edit_subject",
            data.subject
          );

          const selectTopic = await getTopicBySubjectForDrop(
            "edit_topic",
            data.subject,
            data.topic
          );

          const selectLevel = await getLevelCountForDrop(
            "edit_level",
            data.topic,
            data.level
          );

          $("#edit_id").val(data.id);
          $("#edit_title").val(data.title);
          $("#edit_description").val(data.description);
          $("#edit_levels").val(data.levels);
          $("#edit_thumbnail")
            .closest(".form-group")
            .find("a")
            .attr("href", `../${data.thumbnail}`);

          OpenModal("level_edit_modal");
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
