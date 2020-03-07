/* eslint-disable no-undef */
import "bootstrap/dist/css/bootstrap.css";

const BASE_API = "https://paepke.software/CWJBackend/api/people";

const fetchUsers = (api, callback) => {
  fetch(api)
    .then(response => {
      if (!response.ok) {
        return Promise.reject({
          status: response.status,
          message: response.json()
        });
      }
      return response.json();
    })
    .then(data => {
      callback(data);
    })
    .catch(() => {
      updateTable([]);
    });
};

const createUser = (api, data) => {
  fetch(api, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
    .then(response => {
      if (!response.ok) {
        return Promise.reject({
          status: response.status,
          message: response.json()
        });
      }
      return response.json();
    })
    .then(() => {
      $("#createUserModal").modal("hide");
      fetchUsers(BASE_API, updateTable);
    })
    .catch(err => console.log(err));
};

const deleteUser = (api, name) => {
  fetch(api + "/" + name, {
    method: "DELETE"
  })
    .then(response => {
      return response.json();
    })
    .then(() => {
      fetchUsers(BASE_API, updateTable);
    });
};

const updateUser = (api, oldName, data) => {
  var apiURL = api + "/" + oldName;
  fetch(apiURL, {
    method: "PUT",
    mode: "cors",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
    .then(response => {
      return response.json();
    })
    .then(() => {});
};

const getSelectedRows = () => {
  var rows = Array.from(
    document.getElementById("tbody").getElementsByTagName("input")
  );
  return rows.filter(element => {
    return element.checked === true;
  });
};

const getSelectedUserIds = () => {
  let validRows = getSelectedRows();
  return validRows.map(element => {
    return element.value;
  });
};

const userToRow = user => {
  return `<tr id="${user.name}">
  <td>${user.name}</td>
  <td>
    <input type="checkbox" value='${user.name}'>
  </td></tr>`;
};

const updateTable = data => {
  var output;
  if (Array.isArray(data)) {
    var tableData = data.map(user => {
      return userToRow(user);
    });
    output = tableData.join("");
  } else {
    output = userToRow(data);
  }
  document.getElementById("tbody").innerHTML = output;
};

// EVENT LISTENERS
window.addEventListener("DOMContentLoaded", () => {
  fetchUsers(BASE_API, updateTable);
});

document.getElementById("idInputField").addEventListener("input", () => {
  let id = document.getElementById("idInputField").value;
  let apiURL = BASE_API + "/" + id;
  fetchUsers(apiURL, updateTable);
});

document.getElementById("createUserButton").addEventListener("click", () => {
  let _name = document.getElementById("createUserName").value;
  const user = {
    name: _name
  };
  createUser(BASE_API, user);
});

document.getElementById("deleteUsersButton").addEventListener("click", () => {
  let toDeleteUsers = getSelectedUserIds();
  toDeleteUsers.forEach(user => deleteUser(BASE_API, user));
  fetchUsers(BASE_API, updateTable);
});

let toEditRows = [];
let oldName = "";

function editLoop() {
  var row = toEditRows.pop();
  var rowData = Array.from(
    row["parentElement"]["parentElement"].getElementsByTagName("td")
  );
  oldName = document.getElementById("editUserName").value =
    rowData[0].innerText;
  document.getElementById("editUserNameplate").innerText =
    "Edit '" + rowData[0].innerText + "'";
  $("#editUsersModal").modal("show");
}

const getSelectedOption = textOption => {
  var options = Array.from(document.getElementById("editUserGender").options);
  var selected = "";
  options.forEach(option => {
    if (option.innerText.toUpperCase() === textOption.toUpperCase()) {
      selected = option;
    }
  });
  return selected.innerText;
};

document.getElementById("editUsersButton").addEventListener("click", () => {
  toEditRows = getSelectedRows();
  editLoop();
});

document
  .getElementById("submitEditUserButton")
  .addEventListener("click", () => {
    var user = {
      name: document.getElementById("editUserName").value
    };
    updateUser(BASE_API, oldName, user);
    $("#editUsersModal").modal("hide");
    if (toEditRows.length > 0) {
      setTimeout(editLoop, 500);
    } else {
      fetchUsers(BASE_API, updateTable);
    }
  });
