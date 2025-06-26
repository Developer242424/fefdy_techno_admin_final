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
  const questionType = $("#export_question_type").val();

  if (allSelected) {
    container.style.display = "block";

    // Clear previous cards
    $("#questionCardContainer").empty();

    // For Question_Type 2, append BOTH question and instruction blocks
    if (questionType === "Question_Type 2") {
      const questionBlock = $("#matchquestionCardTemplate").html();
      const instructionBlock = $("#matchInstructionCardTemplate").html();
      if (questionBlock) {
        $("#questionCardContainer").append($(questionBlock));
      }
      if (instructionBlock) {
        $("#questionCardContainer").append($(instructionBlock));
      }
    } else if (questionType === "Question_Type 1") {
      const templateHtml = $("#questionCardTemplate").html();
      if (templateHtml) {
        $("#questionCardContainer").append($(templateHtml));
      }
    }

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
  const questionType = $("#export_question_type").val();
  let templateHtml = "";

  if (questionType === "Question_Type 2") {
    templateHtml = $("#matchInstructionCardTemplate").html();
  } else if (questionType === "Question_Type 1") {
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
  const questionType = $("#export_question_type").val();

  // When dealing with Question_Type 2, restrict deletion of all match-instruction cards
  if (questionType === "Question_Type 2") {
    const $instructionCards = $(".match-instruction-card");

    if ($instructionCards.length <= 1) {
      alert("At least one instruction block is required.");
      return;
    }
  } else {
    // Default restriction for all cards (if needed)
    const $cards = $(".question-card");
    if ($cards.length <= 1) {
      alert("At least one question block is required.");
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
  });
}

// ✅ LIMIT TO 2 CHECKBOXES
$(document).on("change", ".question-card input[type='checkbox']", function () {
  const $card = $(this).closest(".question-card");
  const $checkboxes = $card.find("input[type='checkbox']");
  const checkedCount = $checkboxes.filter(":checked").length;

  if (checkedCount > 2) {
    this.checked = false;
    alert("You can only select up to 2 options.");
  }
});

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
});
