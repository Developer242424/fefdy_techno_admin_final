const slimSelectInstances = {};

function reinitSlimSelect(id) {
  if (slimSelectInstances[id]) {
    slimSelectInstances[id].destroy();
  }
  const select = new SlimSelect({
    select: `#${id}`,
  });
  slimSelectInstances[id] = select;
  return select;
}

function getSubjectForDrop(id, selectedValue = null) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: "/admin/get-subjects-for-drop",
      method: "POST",
      success: function (res) {
        let html = `<option value="">Select Subject</option>`;
        if (res.status === 200) {
          res.data.forEach((value) => {
            html += `<option value="${value.id}">${value.subject}</option>`;
          });
        }
        $(`#${id}`).html(html);
        const select = reinitSlimSelect(id);

        if (selectedValue) {
          select.setSelected([String(selectedValue)], true);
        }

        if (res.status !== 200)
          ToastAlert("warning", res.message || "Something went wrong.");

        resolve(select);
      },
      error: function (xhr) {
        ToastAlert(
          "warning",
          xhr?.responseJSON?.message || "An error occurred."
        );
        reject("Error fetching subjects.");
      },
    });
  });
}

function getSubjectForDropMultiple(id, selectedValues = []) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: "/admin/get-subjects-for-drop",
      method: "POST",
      success: function (res) {
        let html = `<option value="">Select Subject</option>`;
        if (res.status === 200) {
          res.data.forEach((value) => {
            html += `<option value="${value.id}">${value.subject}</option>`;
          });
        }
        $(`#${id}`).html(html);
        const select = reinitSlimSelect(id);

        // Handle multi-select values
        if (Array.isArray(selectedValues) && selectedValues.length > 0) {
          const selectedStrings = selectedValues.map(String); // ensure all are strings
          select.setSelected(selectedStrings);
        }

        if (res.status !== 200)
          ToastAlert("warning", res.message || "Something went wrong.");

        resolve(select);
      },
      error: function (xhr) {
        ToastAlert(
          "warning",
          xhr?.responseJSON?.message || "An error occurred."
        );
        reject("Error fetching subjects.");
      },
    });
  });
}

function getTopicBySubjectForDrop(id, subject, selectedValue = null) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: "/admin/get-topics-by-subjects-for-drop",
      method: "POST",
      data: { id: subject },
      success: function (res) {
        let html = `<option value="">Select Topic</option>`;
        if (res.status === 200) {
          res.data.forEach((value) => {
            html += `<option value="${value.id}">${value.title}</option>`;
          });
        }
        $(`#${id}`).html(html);
        const select = reinitSlimSelect(id);

        if (selectedValue) {
          select.setSelected([String(selectedValue)], true);
        }

        resolve(select);
      },
      error: function (xhr) {
        ToastAlert(
          "warning",
          xhr?.responseJSON?.message || "An error occurred."
        );
        reject("Error fetching topics.");
      },
    });
  });
}

function getLevelCountForDrop(id, topic, selectedValue = null) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: "/admin/get-level-count-for-drop",
      method: "POST",
      data: { id: topic },
      success: function (res) {
        let html = `<option value="">Select Count</option>`;
        if (res.status === 200) {
          for (let i = 1; i <= parseInt(res.levelCount); i++) {
            html += `<option value="${i}">${i}</option>`;
          }
        }
        $(`#${id}`).html(html);
        const select = reinitSlimSelect(id);

        if (selectedValue) {
          select.setSelected([String(selectedValue)], true);
        }

        resolve(select);
      },
      error: function (xhr) {
        ToastAlert(
          "warning",
          xhr?.responseJSON?.message || "An error occurred."
        );
        reject("Error fetching level count.");
      },
    });
  });
}

function getLevelsByTopicForDrop(id, topic, selectedValue = null) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: "/admin/get-levels-by-topic-for-drop",
      method: "POST",
      data: { id: topic },
      success: function (res) {
        let html = `<option value="">Select Level</option>`;
        if (res.status === 200) {
          res.data.forEach((value) => {
            html += `<option value="${value.id}">${value.title}</option>`;
          });
        }

        $(`#${id}`).html(html);

        const select = reinitSlimSelect(id);

        // setSelected only after options are injected
        if (selectedValue) {
          // convert to string just in case
          select.setSelected([String(selectedValue)], true);
        }

        resolve(select);
      },
      error: function (xhr) {
        ToastAlert(
          "warning",
          xhr?.responseJSON?.message || "An error occurred."
        );
        reject("Error fetching levels.");
      },
    });
  });
}

function getSubTopicByLevelForDrop(id, subtopic, selectedValue = null) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: "/admin/get-levels-by-topic-for-drop",
      method: "POST",
      data: { id: subtopic },
      success: function (res) {
        let html = `<option value="">Select Level</option>`;
        if (res.status === 200) {
          res.data.forEach((value) => {
            html += `<option value="${value.id}">${value.title}</option>`;
          });
        }

        $(`#${id}`).html(html);

        const select = reinitSlimSelect(id);

        // setSelected only after options are injected
        if (selectedValue) {
          // convert to string just in case
          select.setSelected([String(selectedValue)], true);
        }

        resolve(select);
      },
      error: function (xhr) {
        ToastAlert(
          "warning",
          xhr?.responseJSON?.message || "An error occurred."
        );
        reject("Error fetching levels.");
      },
    });
  });
}

function getStandardsForDrop(element, selectedValue = null) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: "/admin/get-standards-for-drop",
      method: "POST",
      success: function (res) {
        let html = `<option value="">Select Standard</option>`;
        if (res.status === 200 && Array.isArray(res.data)) {
          res.data.forEach((value) => {
            html += `<option value="${value.id}">${value.standard}</option>`;
          });
        }

        $(element).html(html);
        const select = new SlimSelect({ select: element });

        if (selectedValue) {
          select.setSelected([String(selectedValue)], true);
        }

        resolve(select);
      },
      error: function (xhr) {
        ToastAlert(
          "warning",
          xhr?.responseJSON?.message || "An error occurred."
        );
        reject("Error fetching standards.");
      },
    });
  });
}

function getStandardsForDropById(id, selectedValue = null) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: "/admin/get-standards-for-drop",
      method: "POST",
      success: function (res) {
        let html = `<option value="">Select Standard</option>`;
        if (res.status === 200 && Array.isArray(res.data)) {
          res.data.forEach((value) => {
            html += `<option value="${value.id}">${value.standard}</option>`;
          });
        }

        $(`#${id}`).html(html);

        const select = reinitSlimSelect(id);

        // setSelected only after options are injected
        if (selectedValue) {
          // convert to string just in case
          select.setSelected([String(selectedValue)], true);
        }

        resolve(select);
      },
      error: function (xhr) {
        ToastAlert(
          "warning",
          xhr?.responseJSON?.message || "An error occurred."
        );
        reject("Error fetching standards.");
      },
    });
  });
}

function getOrganisationsForDrop(id, selectedValue = null) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: "/admin/get-organisations-for-drop",
      method: "POST",
      success: function (res) {
        let html = `<option value="">Select Organisations</option>`;
        if (res.status === 200) {
          res.data.forEach((value) => {
            html += `<option value="${value.id}">${value.org_name}</option>`;
          });
        }

        $(`#${id}`).html(html);

        const select = reinitSlimSelect(id);

        // setSelected only after options are injected
        if (selectedValue) {
          // convert to string just in case
          select.setSelected([String(selectedValue)], true);
        }

        resolve(select);
      },
      error: function (xhr) {
        ToastAlert(
          "warning",
          xhr?.responseJSON?.message || "An error occurred."
        );
        reject("Error fetching standards.");
      },
    });
  });
}

function getQuestionTypesForDrop(id, selectedValue = null) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: "/admin/get-question-types-for-drop",
      method: "POST",
      success: function (res) {
        let html = `<option value="">Select Question Type</option>`;
        if (res.status === 200) {
          res.data.forEach((value) => {
            html += `<option value="${value.id}">${value.type}</option>`;
          });
        }

        $(`#${id}`).html(html);

        const select = reinitSlimSelect(id);

        // setSelected only after options are injected
        if (selectedValue) {
          // convert to string just in case
          select.setSelected([String(selectedValue)], true);
        }

        resolve(select);
      },
      error: function (xhr) {
        ToastAlert(
          "warning",
          xhr?.responseJSON?.message || "An error occurred."
        );
        reject("Error fetching standards.");
      },
    });
  });
}
