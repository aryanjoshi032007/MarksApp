document.addEventListener("DOMContentLoaded", () => {
  loadTabs();
  refreshDropdowns();
  displayMarks();
});

function loadTabs() {
  const tabs = document.querySelectorAll(".tab-button");
  const contents = document.querySelectorAll(".tab-content");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      contents.forEach(c => c.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.tab).classList.add("active");
      refreshDropdowns();
    });
  });
}

// 🧠 Helper: Get stored data
function getData() {
  return JSON.parse(localStorage.getItem("marksData")) || {};
}

// 💾 Helper: Save data
function saveData(data) {
  localStorage.setItem("marksData", JSON.stringify(data));
  refreshDropdowns();
  displayMarks();
}

// ✅ Add Subject
function addSubject() {
  const subject = document.getElementById("subjectName").value.trim();
  const msg = document.getElementById("subjectMsg");
  if (!subject) return msg.textContent = "Enter a subject name!";
  let data = getData();

  if (data[subject]) {
    msg.textContent = "Subject already added!";
  } else {
    data[subject] = { tests: {}, marks: [] };
    msg.textContent = "Subject added successfully!";
    saveData(data);
  }
  document.getElementById("subjectName").value = "";
}

// ✅ Add Test Type
function addTestType() {
  const subject = document.getElementById("subjectSelect").value;
  const test = document.getElementById("testTypeName").value.trim();
  const msg = document.getElementById("testMsg");
  if (!subject || !test) return msg.textContent = "Select subject and enter test name!";
  let data = getData();

  if (data[subject].tests[test]) {
    msg.textContent = "Test type already exists for this subject!";
  } else {
    data[subject].tests[test] = true;
    msg.textContent = "Test type added successfully!";
    saveData(data);
  }
  document.getElementById("testTypeName").value = "";
}

// ✅ Refresh dropdowns
function refreshDropdowns() {
  const data = getData();
  const subjects = Object.keys(data);

  const subjectSelect = document.getElementById("subjectSelect");
  const subjectDropdown = document.getElementById("subjectDropdown");

  subjectSelect.innerHTML = subjects.map(s => `<option value="${s}">${s}</option>`).join("");
  subjectDropdown.innerHTML = subjects.map(s => `<option value="${s}">${s}</option>`).join("");

  updateTestDropdown();
  subjectDropdown.addEventListener("change", updateTestDropdown);
}

function updateTestDropdown() {
  const subject = document.getElementById("subjectDropdown").value;
  const testDropdown = document.getElementById("testDropdown");
  const data = getData();

  if (!subject || !data[subject]) {
    testDropdown.innerHTML = "<option>Select a subject first</option>";
    return;
  }

  const tests = Object.keys(data[subject].tests);
  testDropdown.innerHTML = tests.map(t => `<option value="${t}">${t}</option>`).join("");
}

// ✅ Add Marks
function addMarks() {
  const subject = document.getElementById("subjectDropdown").value;
  const test = document.getElementById("testDropdown").value;
  const max = document.getElementById("maxMarks").value;
  const scored = document.getElementById("scoredMarks").value;
  const msg = document.getElementById("marksMsg");

  if (!subject || !test || !max || !scored)
    return msg.textContent = "Please fill all fields!";

  const data = getData();
  data[subject].marks.push({ test, max, scored });
  msg.textContent = "Marks added successfully!";
  saveData(data);

  document.getElementById("maxMarks").value = "";
  document.getElementById("scoredMarks").value = "";
}

// ✅ View Marks
function displayMarks() {
  const data = getData();
  const container = document.getElementById("marksTableContainer");
  container.innerHTML = "";

  for (const subject in data) {
    const subDiv = document.createElement("div");
    subDiv.innerHTML = `<h3>${subject}</h3>`;

    for (const test of Object.keys(data[subject].tests)) {
      const marks = data[subject].marks.filter(m => m.test === test);
      if (marks.length === 0) continue;

      let table = `<table><tr><th>Test</th><th>Max Marks</th><th>Scored</th><th>Action</th></tr>`;
      marks.forEach((m, index) => {
        table += `
          <tr>
            <td>${m.test}</td>
            <td>${m.max}</td>
            <td>${m.scored}</td>
            <td><button class="delete-btn" onclick="deleteMark('${subject}','${test}',${index})">X</button></td>
          </tr>`;
      });
      table += `</table>`;
      subDiv.innerHTML += `<h4>${test}</h4>${table}`;
    }

    container.appendChild(subDiv);
  }
}

// 🗑️ Delete Marks
function deleteMark(subject, test, index) {
  const data = getData();
  const filtered = data[subject].marks.filter((m, i) => !(m.test === test && i === index));
  data[subject].marks = filtered;
  saveData(data);
}
