$(function () {
  LoadTableData();

  new SlimSelect({
    select: "#category",
    settings: {
      closeOnSelect: false,
    },
  });

  getSubjectForDrop("subject");
  $("#subject").on("change", function () {
    getTopicBySubjectForDrop("topic", $(this).val());
  });
  $("#topic").on("change", function () {
    getLevelsByTopicForDrop("level", $(this).val());
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

  $("#category").on("change", function () {
    $.ajax({
      url: "/admin/subtopic/category-create-form",
      method: "POST",
      data: {
        id: $(this).val(),
      },
      success: function (res) {
        if (res.status === 200) {
          $(".categories_div").html(res.data);
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

  $("#subtopic_create_form").submit(function (e) {
    e.preventDefault();
    LoadStart();
    const formData = new FormData(this);
    $.ajax({
      url: "/admin/subtopic/create",
      method: "POST",
      data: formData,
      contentType: false,
      processData: false,
      success: function (res) {
        LoadStop();
        if (res.status === 200) {
          ToastAlert("success", res.message);
          LoadTableData();
          $("#subtopic_create_form")[0].reset();
          $("#subtopic_create_modal .close").click();
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

  $(document).on("change", "#edit_category", function () {
    $.ajax({
      url: "/admin/subtopic/category-edit-form",
      method: "POST",
      data: {
        id: $(this).val(),
        subtopic_id: $("#edit_id").val(),
      },
      success: function (res) {
        if (res.status === 200) {
          $(".edit_categories_div").html(res.data);
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

  $("#subtopic_edit_form").on("submit", function (e) {
    e.preventDefault();
    LoadStart();

    const formData = new FormData(this);

    $.ajax({
      url: "/admin/subtopic/update",
      method: "POST",
      data: formData,
      contentType: false,
      processData: false,
      success: function (res) {
        LoadStop();
        if (res.status === 200) {
          ToastAlert("success", res.message);
          LoadTableData();
          $("#subtopic_edit_form")[0].reset();
          $("#subtopic_edit_modal .close").click();
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
    url: "/admin/subtopic/list",
    method: "POST",
    contentType: false,
    processData: false,
    success: function (res) {
      if (res.status === 200) {
        renderTable("subtopic-table", res.data);
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
      { key: "level_name", label: "Level", orderable: true, type: "text" },
      { key: "title", label: "Title", orderable: true, type: "text" },
      { key: "description", label: "Description", orderable: true },
      { key: "thumbnail", label: "Thumbnail", orderable: false },
      { key: "action", label: "Actions", orderable: false },
    ],
    showEntries: ["5", "10", "20", "All"],
    search: true,
  });
}

async function OpenEditModal(id) {
  try {
    $.ajax({
      url: "/admin/subtopic/data",
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

          const selectLevel = await getLevelsByTopicForDrop(
            "edit_level",
            data.topic,
            data.level_id
          );

          $("#edit_id").val(data.id);
          $("#edit_title").val(data.title);
          $("#edit_description").val(data.description);
          $("#edit_thumbnail")
            .closest(".form-group")
            .find("a")
            .attr("href", `../${data.thumbnail}`);
          const cat_ids = JSON.parse(data.category);

          $("#edit_category").val(cat_ids.map(String));
          $("#edit_sort_order").val(data.sort_order);

          if (slimSelectInstances["edit_category"]) {
            slimSelectInstances["edit_category"].destroy();
            delete slimSelectInstances["edit_category"];
          }

          slimSelectInstances["edit_category"] = new SlimSelect({
            select: "#edit_category",
            settings: {
              closeOnSelect: false,
            },
          });

          slimSelectInstances["edit_category"].setSelected(cat_ids.map(String));

          OpenModal("subtopic_edit_modal");
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
        url: "/admin/subtopic/destroy",
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
