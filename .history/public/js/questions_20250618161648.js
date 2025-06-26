function previewThumbnail(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const $img = $(input).siblings("img.thumbnail-preview-img");
      $img.attr("src", e.target.result).show();
    };
    reader.readAsDataURL(input.files[0]);
  }
}

const selectIds = ["subject", "topic", "level", "sub_topic", "question_type"];

$(document).ready(function () {
  selectIds.forEach((id) => {
    $("#" + id).on("change", checkAllSelected);
  });

  $("#export_question_type").on("change", checkAllSelected);

  updateSubmitButton();
});

function checkAllSelected() {
  const allSelected = selectIds.every((id) => {
    const el = document.getElementById(id);
    return el && el.value.trim() !== "";
  });

  const container = document.getElementById("questionCardContainer");
  const questionType = $("#question_type").val();

  if (allSelected) {
    container.style.display = "block";

    // Clear previous cards
    $("#questionCardContainer").empty();

    // For Question_Type 2, append BOTH question and instruction blocks
    if (questionType === "2") {
      const questionBlock = $("#matchquestionCardTemplate").html();
      const instructionBlock = $("#matchInstructionCardTemplate").html();
      if (questionBlock) {
        $("#questionCardContainer").append($(questionBlock));
      }
      if (instructionBlock) {
        $("#questionCardContainer").append($(instructionBlock));
      }
    } else if (questionType === "1") {
      const templateHtml = $("#questionCardTemplate").html();
      if (templateHtml) {
        $("#questionCardContainer").append($(templateHtml));
      }
    }
    renumberCards();
    updateSubmitButton();
  } else {
    container.style.display = "none";
    $("#questionCardContainer").empty();
  }
}

function updateSubmitButton() {
  // Remove previous button only inside this form
  $("#dynamicQuestionForm .form-submit-button").remove();

  const btnText = $("#questionCardContainer").data("submit-text") || "Submit";

  const $submitBtn = $(`
    <div class="text-end mt-3">
      <button type="submit" class="btn btn-info form-submit-button">${btnText}</button>
    </div>
  `);

  // Append to the wrapper form (outside all question-cards)
  $("#dynamicQuestionForm").append($submitBtn);
}

// ✅ ADD NEW CARD
$(document).on("click", ".add-icon", function () {
  const questionType = $("#question_type").val();
  let templateHtml = "";

  if (questionType === "2") {
    templateHtml = $("#matchInstructionCardTemplate").html();
  } else if (questionType === "1") {
    templateHtml = $("#questionCardTemplate").html();
  }

  if (!templateHtml) {
    console.warn("❗ Template not found for question type:", questionType);
    return;
  }

  const $card = $(templateHtml);
  $("#questionCardContainer").append($card);

  renumberCards(); // 💡 call after adding
  updateSubmitButton();
});

// ✅ DELETE CARD
$(document).on("click", ".delete-icon", function () {
  const questionType = $("#question_type").val();

  // When dealing with Question_Type 2, restrict deletion of all match-instruction cards
  if (questionType === "2") {
    const $instructionCards = $(".match-instruction-card");

    if ($instructionCards.length <= 1) {
      ToastAlert("warning", "At least one instruction block is required.");
      return;
    }
  } else if (questionType === "1") {
    // Default restriction for all cards (if needed)
    const $cards = $(".question-card");
    if ($cards.length <= 1) {
      ToastAlert("warning", "At least one question block is required.");
      return;
    }
  }

  // Proceed with delete
  $(this).closest(".question-card").remove();
  renumberCards();
  updateSubmitButton();
});

function renumberCards() {
  $(".question-card").each(function (index) {
    // Remove old cardX class
    const $card = $(this);
    const classes = $card.attr("class").split(/\s+/);

    // Remove any class that starts with "card" followed by a number
    classes.forEach((c) => {
      if (/^card\d+$/.test(c)) {
        $card.removeClass(c);
      }
    });

    // Add new class
    $card.addClass("card" + index);

    $card.find("textarea, input, select").each(function () {
      const $input = $(this);
      const nameAttr = $input.attr("name");
      //   console.log("Old name "+nameAttr);
      if (nameAttr && nameAttr.includes("array[")) {
        // console.log(index);
        const newName = nameAttr.replace(/array\[\d*\]/, `array[${index}]`);
        // console.log("New name "+newName);
        $input.attr("name", newName);
      } else {
        // console.log("false");
      }
    });
  });
}

// LIMIT TO 2 CHECKBOXES
$(document).on("change", ".question-card input[type='checkbox']", function () {
  const $card = $(this).closest(".question-card");
  const $checkboxes = $card.find("input[type='checkbox']");
  const checkedCount = $checkboxes.filter(":checked").length;

  if (checkedCount > 2) {
    this.checked = false;
    ToastAlert("warning", "You can only select up to 2 options.");
  }
});

// functionality Scripts
$(function () {
  getSubjectForDrop("subject");
  $("#subject").on("change", function () {
    getTopicBySubjectForDrop("topic", $(this).val());
  });
  $("#topic").on("change", function () {
    getLevelsByTopicForDrop("level", $(this).val());
  });
  $("#level").on("change", function () {
    getSubTopicByLevelForDrop("sub_topic", $(this).val());
  });
  getQuestionTypesForDrop("question_type");

  getSubjectForDrop("subject_filter");
  $("#subject_filter").on("change", function () {
    getTopicBySubjectForDrop("topic_filter", $(this).val());
  });
  $("#topic_filter").on("change", function () {
    getLevelsByTopicForDrop("level_filter", $(this).val());
  });
  $("#level_filter").on("change", function () {
    getSubTopicByLevelForDrop("sub_topic_filter", $(this).val());
  });
  getQuestionTypesForDrop("question_type_filter");

  $("#questions_create_form").submit(function (e) {
    e.preventDefault();
    LoadStart();
    const formData = new FormData(this);
    $.ajax({
      url: "/admin/create-questions/create",
      method: "POST",
      data: formData,
      contentType: false,
      processData: false,
      success: function (res) {
        LoadStop();
        if (res.status === 200) {
          ToastAlert("success", res.message);
          location.reload();
          $("#questions_create_form")[0].reset();
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
    url: "/admin/subtopic/list",
    method: "POST",
    contentType: false,
    processData: false,
    success: function (res) {
      if (res.status === 200) {
        renderTable("questions-table", res.data);
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
        key: "question_text",
        label: "Question",
        orderable: true,
        type: "text",
      },
      {
        key: "question_thumbnail",
        label: "Thumbnail",
        orderable: false,
      },
      { key: "action", label: "Actions", orderable: false },
    ],
    showEntries: ["5", "10", "20", "All"],
    search: true,
  });
}
