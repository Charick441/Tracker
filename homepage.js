// Redirect to index.html when Log Out is clicked (Handled in attachButtonListeners)
// Homepage logic for section, student, attendance, grades, and student sign up
// Data is stored in localStorage for demo purposes

// --- Per-user Data helpers ---
function getCurrentUser() {
  return localStorage.getItem('currentUser') || '';
}
function userKey(key) {
  const user = getCurrentUser();
  return user ? `${key}_${user}` : key;
}
function getSections() {
  return JSON.parse(localStorage.getItem(userKey('sections')) || '[]');
}
function setSections(sections) {
  localStorage.setItem(userKey('sections'), JSON.stringify(sections));
}
function getStudents(sectionId) {
  return JSON.parse(localStorage.getItem(userKey('students_' + sectionId)) || '[]');
}
function setStudents(sectionId, students) {
  localStorage.setItem(userKey('students_' + sectionId), JSON.stringify(students));
}
function getAttendance(studentId) {
  return JSON.parse(localStorage.getItem(userKey('attendance_' + studentId)) || '{}');
}
function setAttendance(studentId, att) {
  localStorage.setItem(userKey('attendance_' + studentId), JSON.stringify(att));
}
function getGrades(studentId) {
  return JSON.parse(localStorage.getItem(userKey('grades_' + studentId)) || '{}');
}
function setGrades(studentId, grades) {
  localStorage.setItem(userKey('grades_' + studentId), JSON.stringify(grades));
}

// --- UI helpers ---
function showModal(html) {
  document.getElementById('modalOverlay').style.display = 'flex';
  var box = document.getElementById('modalBox');
  box.innerHTML = html;
  box.style.display = 'block';
}
function closeModal() {
  document.getElementById('modalOverlay').style.display = 'none';
  document.getElementById('modalBox').style.display = 'none';
}

// --- Section logic ---
function renderSections() {
  var list = document.getElementById('sectionList');
  var sections = getSections();
  list.innerHTML = '';
  sections.forEach(function(sec) {
    var li = document.createElement('li');
    li.className = (window.selectedSectionId === sec.id) ? 'active' : '';
    // Section name clickable (selects section)
    var nameSpan = document.createElement('span');
    nameSpan.textContent = sec.name;  
    nameSpan.style.cursor =  'pointer';
    nameSpan.style.marginLeft = '30px';
    nameSpan.style.padding = '10px 0';
    nameSpan.style.fontSize = '1.3em';
    nameSpan.onclick = function() {
      // Only select if not already selected
      if (window.selectedSectionId !== sec.id) {
        window.selectedSectionId = sec.id;
        renderSections();
        renderTabs();
      }
    };
    li.appendChild(nameSpan);
    // Dropdown menu for edit/remove (does not interfere with section selection)
    var menuBtn = document.createElement('button');
    menuBtn.textContent = '⋮';
    menuBtn.title = 'Section options';
    menuBtn.style = 'float:right;margin-left:10px;background:none;border:none;font-size:1.3em;cursor:pointer;color:#1b6ca8;';
    menuBtn.onclick = function(e) {
      e.stopPropagation(); // Prevents triggering li or span click
      showSectionMenu(li, sec.id, sec.name);
    };
    li.appendChild(menuBtn);
    list.appendChild(li);
  });
  // If no sections, clear selectedSectionId and clear tabs
if (sections.length === 0) {
  window.selectedSectionId = null;
  var area = document.getElementById('tabsArea');
  if (area) area.innerHTML = `
    <div class="empty-state" style="text-align:left;max-width:540px;margin:48px auto 0 auto;font-size:1.13em;line-height:1.7;background:#fffbe6;border-radius:12px;padding:28px 32px;box-shadow:0 2px 12px #0001;">
      <b>💡 Helpful Tips for Using the System:</b><br><br>
      • Click on a section name to view and manage student records.<br>
      • Use “+ Add Section” to create a new class or group.<br>
      • You won’t see student data until a section is selected.<br>
      • Add students by clicking the “+ Add Student” button inside a section.<br>
      • Click on a student’s row to view or update their attendance and grades.<br>
      • In the attendance calendar, tap a day to cycle through Present, Absent, or Late.<br>
      • Attendance updates are saved automatically — no need to click "Save."<br>
      • Grades are calculated instantly — just enter scores to see the final result.<br>
      • Use the “View Student Progress” button to check attendance and grades summary by name.<br>
      • Go to Settings (⚙️) to clear data or check past notifications.
    </div>
  `;
}
if (window.attachButtonListeners) window.attachButtonListeners();
}

// Show a dropdown menu for section actions (edit/remove)
function showSectionMenu(li, sectionId, sectionName) {
  // Remove any existing menu
  var oldMenu = document.getElementById('sectionMenuDropdown');
  if (oldMenu) oldMenu.remove();
  // Create menu
  var menu = document.createElement('div');
  menu.id = 'sectionMenuDropdown';
  menu.style = 'position:absolute;z-index:1002;background:#fff;border:1px solid #b7e4c7;border-radius:8px;box-shadow:0 4px 16px #0002;padding:0;min-width:120px;right:20px;top:0;';
  menu.innerHTML = `
    <button style="width:100%;padding:10px 0;border:none;background:none;font-size:1em;cursor:pointer;color:#1b6ca8;" id="editSectionMenuBtn">✏️ Edit</button>
    <button style="width:100%;padding:10px 0;border:none;background:none;font-size:1em;cursor:pointer;color:#d90429;" id="removeSectionMenuBtn">🗑️ Remove</button>
  `;
  // Position menu
  li.style.position = 'relative';
  li.appendChild(menu);
  // Edit
  menu.querySelector('#editSectionMenuBtn').onclick = function(e) {
    e.stopPropagation();
    showEditSectionModal(sectionId, sectionName);
    menu.remove();
  };
  // Remove
  menu.querySelector('#removeSectionMenuBtn').onclick = function(e) {
    e.stopPropagation();
    showRemoveSectionModal(sectionId, sectionName);
    menu.remove();
  };
  // Close menu on click outside
  setTimeout(function() {
    document.addEventListener('click', closeMenu, { once: true });
  }, 0);
  function closeMenu(ev) {
    if (menu && menu.parentNode) menu.remove();
  }
}

function showEditSectionModal(sectionId, sectionName) {
  showModal(`<h3>Edit Section</h3><input id="editSectionName" class="input" value="${sectionName}" style="margin:18px 0 12px 0;width:99%; padding:12px 0; font-size: 1.2em;"><div style="display:flex;gap:12px;margin-top:18px;"><button id="saveEditSectionBtn" class="sidebar-btn">Save</button><button id="cancelEditSectionBtn" class="sidebar-btn" style="background:#eee;color:#222;">Cancel</button></div>`);
  setTimeout(() => {
    document.getElementById('saveEditSectionBtn').onclick = function() {
      var newName = document.getElementById('editSectionName').value.trim();
      if (!newName) return;
      var sections = getSections();
      var idx = sections.findIndex(s => s.id === sectionId);
      if (idx !== -1) {
        sections[idx].name = newName;
        setSections(sections);
        closeModal();
        renderSections();
        renderTabs();
      }
    };
    document.getElementById('cancelEditSectionBtn').onclick = closeModal;
  }, 0);
}

function showRemoveSectionModal(sectionId, sectionName) {
  showModal(`<h3>Remove Section</h3><div style="margin:18px 0;">Are you sure you want to remove <b>${sectionName}</b>?</div><div style="display:flex;gap:12px;margin-top:18px;"><button id="confirmRemoveSectionBtn" class="sidebar-btn" style="background:#d90429;color:#fff;">Remove</button><button id="cancelRemoveSectionBtn" class="sidebar-btn" style="background:#eee;color:#222;">Cancel</button></div>`);
  setTimeout(() => {
    document.getElementById('confirmRemoveSectionBtn').onclick = function() {
      var sections = getSections();
      var idx = sections.findIndex(s => s.id === sectionId);
      if (idx !== -1) {
        sections.splice(idx, 1);
        setSections(sections);
        if (window.selectedSectionId === sectionId) window.selectedSectionId = null;
        closeModal();
        renderSections();
        renderTabs();
      }
    };
    document.getElementById('cancelRemoveSectionBtn').onclick = closeModal;
  }, 0);
}

function addSection() {
  showModal('<h3>Add Section</h3><input id="sectionName" class="input" placeholder="Section Name" style="margin:18px 0 12px 0;width:99%; padding:12px 0; font-size:1.2em;"><div style="display:flex;gap:12px;margin-top:18px;"><button id="addSectionModalBtn" class="sidebar-btn">Add</button><button id="cancelAddSectionModalBtn" class="sidebar-btn" style="background:#eee;color:#222;">Cancel</button></div>');
  setTimeout(() => {
    document.getElementById('addSectionModalBtn').addEventListener('click', submitSection);
    document.getElementById('cancelAddSectionModalBtn').addEventListener('click', closeModal);
  }, 0);
}
function submitSection() {
  var name = document.getElementById('sectionName').value.trim();
  if (!name) return;
  var sections = getSections();
  var id = 'sec_' + Date.now();
  sections.push({id, name});
  setSections(sections);
  closeModal();
  renderSections();
}

// --- Tabs logic ---
function renderTabs() {
  var area = document.getElementById('tabsArea');
  if (!window.selectedSectionId) {
    area.innerHTML = '<div class="empty-state">Select or add a section to begin.</div>';
    if (window.attachButtonListeners) window.attachButtonListeners();
    return;
  }
  var students = getStudents(window.selectedSectionId);
  // Sort: males first, then females, then alphabetical
  students.sort(function(a, b) {
    if (a.gender !== b.gender) return a.gender === 'Male' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  var html = `<div class="tab-header"><h2>${getSections().find(s=>s.id===window.selectedSectionId).name} - Class Record</h2></div>
  <button id="addStudentBtn" class="sidebar-btn" style="width:220px;margin-bottom:18px;">+ Add Student</button>
  <div style="max-height:440px;max-width:1140px;overflow-y:auto;border:1px solid #eee;border-radius:8px;">
    <table class="classrecord-table" style="width:100%;"><thead><tr><th>Name</th><th>LRN</th><th>Gender</th></tr></thead><tbody id="classRecordBody">`;
  students.forEach(function(stu) {
    html += `<tr class="student-row" data-stuid="${stu.id}" style="cursor:pointer;"><td>${stu.name}</td><td>${stu.lrn}</td><td>${stu.gender}</td></tr>`;
  });
  html += '</tbody></table>';
  area.innerHTML = html;
  // Attach event listeners
  document.getElementById('addStudentBtn').addEventListener('click', addStudent);
  document.getElementById('classRecordBody').addEventListener('click', function(e) {
    var row = e.target.closest('.student-row');
    if (row && row.dataset.stuid) {
      openStudentTab(row.dataset.stuid);
    }
  });
  if (window.attachButtonListeners) window.attachButtonListeners();
}

// --- Student logic ---
function addStudent() {
  showModal('<h3>Add Student</h3><input id="stuName" class="input" placeholder="Name" style="margin:12px 0;width:99%; padding: 12px 0; font-size: 1.2em;"><input id="stuLRN" class="input" placeholder="LRN" style="margin:12px 0;width:99%; padding: 12px 0; font-size: 1.2em;"><select id="stuGender" class="input" style="margin:12px 0;width:100%; padding: 12px 0; font-size: 1.2em;"><option value="Male">Male</option><option value="Female">Female</option></select><div style="display:flex;gap:12px;margin-top:18px;"><button id="addStudentModalBtn" class="sidebar-btn">Add</button><button id="cancelAddStudentModalBtn" class="sidebar-btn" style="background:#eee;color:#222;">Cancel</button></div>');
  setTimeout(() => {
    document.getElementById('addStudentModalBtn').addEventListener('click', submitStudent);
    document.getElementById('cancelAddStudentModalBtn').addEventListener('click', closeModal);
  }, 0);
}
function submitStudent() {
  var name = document.getElementById('stuName').value.trim();
  var lrn = document.getElementById('stuLRN').value.trim();
  var gender = document.getElementById('stuGender').value;
  if (!name || !lrn) return;
  var students = getStudents(window.selectedSectionId);
  var id = 'stu_' + Date.now();
  students.push({id, name, lrn, gender});
  setStudents(window.selectedSectionId, students);
  closeModal();
  renderTabs();
}

// --- Student pop-up tab ---
function openStudentTab(stuId) {
  var students = getStudents(window.selectedSectionId);
  var stu = students.find(s=>s.id===stuId);
  if (!stu) return;
  showModal(`
    <div style="display:flex;justify-content:space-between;align-items:center; width: 525px;">
      <h3 style="margin:0; font-size: 1.7em; width: 356px">${stu.name} <span style='font-size:0.8em;color:#888;'>(${stu.lrn})</span></h3>
      <div style='display:flex;gap:13px; height: 60px; width: min-content'>
        <button id="editStudentBtn" class='sidebar-btn' style='background:#fce12e;color:#222;padding:4px 10px;font-size:1em;width:48px;'>✏️</button>
        <button id="removeStudentBtn" class='sidebar-btn' style='background:#d90429;color:#fff;padding:4px 10px;font-size:1em;width:48px;'>🗑️</button>
      </div>
    </div>
    <div style='margin-bottom:18px; font-size: 1.3em;'>Gender: ${stu.gender}</div>
    <div style='display:flex;gap:12px;justify-content:center;margin-bottom:18px;'>
    
      <button id="attendanceBtn" class='sidebar-btn' style='padding:10px 10px;width:105px;'>Attendance</button>
      <button id="gradesBtn" class='sidebar-btn' style='padding:10px 10px;width:105px;'>Grades</button>
    </div>
    <div id="studentTabContent"></div>
  `);
  // Attach modal button listeners
  document.getElementById('editStudentBtn').addEventListener('click', function() { editStudent(stu.id); });
  document.getElementById('removeStudentBtn').addEventListener('click', function() { removeStudent(stu.id); });
  document.getElementById('attendanceBtn').addEventListener('click', function() { openAttendance(stu.id); });
  document.getElementById('gradesBtn').addEventListener('click', function() { openGrades(stu.id); });
}

// Edit student modal
function editStudent(stuId) {
  var students = getStudents(window.selectedSectionId);
  var stu = students.find(s=>s.id===stuId);
  if (!stu) return;
  showModal(`
    <h3>Edit Student</h3>
    <input id="editStuName" class="input" placeholder="Name" style="margin:18px 0 12px 0;width:99%; padding:12px 0; font-size:1.2em;" value="${stu.name}">
    <input id="editStuLRN" class="input" placeholder="LRN" style="margin:12px 0;width:99%; padding:12px 0; font-size:1.2em;" value="${stu.lrn}">
    <select id="editStuGender" class="input" style="margin:12px 0;width:100%; padding:12px 0; font-size:1.2em;">
      <option value="Male" ${stu.gender==='Male'?'selected':''}>Male</option>
      <option value="Female" ${stu.gender==='Female'?'selected':''}>Female</option>
    </select>
    <div style="display:flex;gap:12px;margin-top:18px;">
      <button id="saveEditStudentBtn" class="sidebar-btn">Save</button>
      <button id="cancelEditStudentBtn" class="sidebar-btn" style="background:#eee;color:#222;">Cancel</button>
    </div>
  `);
  setTimeout(() => {
    document.getElementById('saveEditStudentBtn').onclick = function() {
      var name = document.getElementById('editStuName').value.trim();
      var lrn = document.getElementById('editStuLRN').value.trim();
      var gender = document.getElementById('editStuGender').value;
      if (!name || !lrn) return;
      stu.name = name;
      stu.lrn = lrn;
      stu.gender = gender;
      setStudents(window.selectedSectionId, students);
      closeModal();
      renderTabs();
    };
    document.getElementById('cancelEditStudentBtn').onclick = closeModal;
  }, 0);
}
// Remove student but keep records
function removeStudent(stuId) {
  var students = getStudents(window.selectedSectionId);
  var stu = students.find(s => s.id === stuId);
  if (!stu) return;
  showModal(
    `<h3>Remove Student</h3>
    <div style="margin:18px 0;">
      Are you sure you want to remove <b>${stu.name}</b>? Their records will remain.
    </div>
    <div style="display:flex;gap:12px;margin-top:18px;">
      <button id="confirmRemoveStudentBtn" class="sidebar-btn" style="background:#d90429;color:#fff;">Remove</button>
      <button id="cancelRemoveStudentBtn" class="sidebar-btn" style="background:#eee;color:#222;">Cancel</button>
    </div>`
  );
  setTimeout(() => {
    document.getElementById('confirmRemoveStudentBtn').onclick = function() {
      var students = getStudents(window.selectedSectionId);
      students = students.filter(s => s.id !== stuId);
      setStudents(window.selectedSectionId, students);
      closeModal();
      renderTabs();
    };
    document.getElementById('cancelRemoveStudentBtn').onclick = closeModal;
  }, 0);
}

// --- Attendance calendar modal with year/month navigation and day cycling ---
function openAttendance(stuId, year, month) {
  var students = getStudents(window.selectedSectionId);
  var stu = students.find(s=>s.id===stuId);
  if (!stu) return;
  var now = new Date();
  year = typeof year === 'number' ? year : now.getFullYear();
  month = typeof month === 'number' ? month : now.getMonth();
  var att = getAttendance(stuId);
  var daysInMonth = new Date(year, month + 1, 0).getDate();
  var firstDay = new Date(year, month, 1).getDay();
  var monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var weekDays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  // Calculate present/absent for pie chart
  var present = 0, absent = 0;
  for (var day = 1; day <= daysInMonth; day++) {
    var dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    var status = att[dateStr] || '';
    if (status === 'Present') present++;
    if (status === 'Absent') absent++;
  }

  // Modal layout: wide, calendar left, pie chart right
  var html = `<div style="display:flex;flex-direction:row;gap:32px;max-width:900px;min-width:700px;">`;
  // Calendar area (LEFT)
  html += `<div style='flex:2;'>`;
  html += `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">`;
  html += `<button id='attPrevBtn' class='sidebar-btn' style='padding:4px 10px;font-size:1.1em;width:36px;'>&#8592;</button>`;
  html += `<div style='font-size:1.3em;font-weight:600;'><span id='attYear' style='margin-right:8px;'>${year}</span><span id='attMonth'>${monthNames[month]}</span></div>`;
  html += `<button id='attNextBtn' class='sidebar-btn' style='padding:4px 10px;font-size:1.1em;width:36px;'>&#8594;</button>`;
  html += `</div>`;
  html += `<table class='calendar-table' style='width:100%;font-size:1.15em;margin-bottom:0;'><thead><tr>`;
  weekDays.forEach(function(d) { html += `<th>${d}</th>`; });
  html += `</tr></thead><tbody><tr>`;
  for (var i = 0; i < firstDay; i++) html += '<td></td>';
  for (var day = 1; day <= daysInMonth; day++) {
    var dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    var status = att[dateStr] || '';
    var display = '';
    var color = '';
    if (status === 'Present') { display = 'P'; color = '#38b000'; }
    else if (status === 'Absent') { display = 'A'; color = '#d90429'; }
    else if (status === 'Late') { display = 'L'; color = '#1b6ca8'; }
    html += `<td class='att-cell' data-date='${dateStr}' data-stuid='${stuId}' style='text-align:center;cursor:pointer;font-weight:600;'><span style='display:inline-block;width:32px;height:32px;line-height:32px;border-radius:50%;background:${color};color:#fff;font-size:1.1em;'>${display}</span><div style='font-size:0.9em;color:#222;margin-top:2px;'>${day}</div></td>`;
    if ((firstDay + day) % 7 === 0 && day !== daysInMonth) html += '</tr><tr>';
  }
  var lastDay = (firstDay + daysInMonth) % 7;
  if (lastDay !== 0) for (var j = lastDay; j < 7; j++) html += '<td></td>';
  html += '</tr></tbody></table>';
  // Back button
  html += `<button id='attBackBtn' class='sidebar-btn' style='margin-top:18px;background:#333;color:#fff;font-weight:500;padding:4px 10px;border-radius:8px;font-size:1.08em;width:70px;'>&#8592; Back</button>`;
  html += `</div>`; // END calendar area

  // Pie chart area (RIGHT)
  const allTime = getAllTimeAttendance(stuId);
  html += `<div style='flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;'>`;
  html += `<div style='font-size:1.15em;font-weight:600;margin-bottom:10px;'>Attendance Summary (All Time)</div>`;
  html += `<canvas id='pieChart' width='180' height='180' style='background:#fff;border-radius:50%;box-shadow:0 2px 8px #0001;'></canvas>`;
  html += `<div style='margin-top:18px;font-size:1.08em;'>
    <span style='color:#38b000;font-weight:600;'>Present: ${allTime.present}</span><br>
    <span style='color:#d90429;font-weight:600;'>Absent: ${allTime.absent}</span><br>
    <span style='color:#1b6ca8;font-weight:600;'>Late: ${allTime.late}</span>
  </div>`;
  html += `</div>`; // END pie chart area

  html += `</div>`; // END flex row

  showModal(html);
  setTimeout(function(){
    const allTime = getAllTimeAttendance(stuId);
    drawPieChart(allTime.present, allTime.absent);
  }, 100);
  document.getElementById('attPrevBtn').addEventListener('click', function() {
    openAttendance(stuId, month-1 < 0 ? year-1 : year, month-1 < 0 ? 11 : month-1);
  });
  document.getElementById('attNextBtn').addEventListener('click', function() {
    openAttendance(stuId, month+1 > 11 ? year+1 : year, month+1 > 11 ? 0 : month+1);
  });
  document.getElementById('attBackBtn').addEventListener('click', closeModal);
  // Event delegation for attendance cells
  document.querySelectorAll('.att-cell').forEach(function(cell) {
    cell.addEventListener('click', function() {
      cycleAttendanceStatus(stuId, cell.dataset.date, cell);
      // Recalculate all-time present/absent/late and redraw pie chart live
      const allTime = getAllTimeAttendance(stuId);
      drawPieChart(allTime.present, allTime.absent);
      // Update the counts below the pie chart live
      const pie = document.getElementById('pieChart');
      if (pie) {
        const summaryDiv = pie.nextElementSibling;
        if (summaryDiv) {
          summaryDiv.innerHTML = `
            <span style='color:#38b000;font-weight:600;'>Present: ${allTime.present}</span><br>
            <span style='color:#d90429;font-weight:600;'>Absent: ${allTime.absent}</span><br>
            <span style='color:#1b6ca8;font-weight:600;'>Late: ${allTime.late}</span>
          `;
        }
      }
    });
  });
}

// Cycle attendance status: Present -> Absent -> Late -> (empty)
function cycleAttendanceStatus(stuId, dateStr, cell) {
  var att = getAttendance(stuId);
  var current = att[dateStr] || '';
  var next;
  if (current === '') next = 'Present';
  else if (current === 'Present') next = 'Absent';
  else if (current === 'Absent') next = 'Late';
  else next = '';
  att[dateStr] = next;
  setAttendance(stuId, att);
  // Update cell display
  var display = '';
  var color = '';
  if (next === 'Present') { display = 'P'; color = '#38b000'; }
  else if (next === 'Absent') { display = 'A'; color = '#d90429'; }
  else if (next === 'Late') { display = 'L'; color = '#1b6ca8'; }
  cell.innerHTML = `<span style='display:inline-block;width:32px;height:32px;line-height:32px;border-radius:50%;background:${color};color:#fff;font-size:1.1em;'>${display}</span><div style='font-size:0.9em;color:#222;margin-top:2px;'>${parseInt(dateStr.split('-')[2],10)}</div>`;
}

function getAllTimeAttendance(stuId) {
  const att = getAttendance(stuId);
  let present = 0, absent = 0, late = 0, total = 0;
  Object.values(att).forEach(status => {
    if (status === 'Present') present++;
    else if (status === 'Absent') absent++;
    else if (status === 'Late') late++;
    if (status) total++;
  });
  return { present, absent, late, total };
}

function drawPieChart(present, absent) {
  var c = document.getElementById('pieChart');
  if (!c) return;
  var ctx = c.getContext('2d');
  ctx.clearRect(0,0,180,180);
  var total = present + absent;
  if (total === 0) total = 1; // avoid division by zero

  var presentAngle = (present / total) * 2 * Math.PI;

  // Present (green)
  ctx.beginPath();
  ctx.moveTo(90,90);
  ctx.arc(90,90,80,0,presentAngle);
  ctx.closePath();
  ctx.fillStyle = '#38b000';
  ctx.fill();

  // Absent (red)
  ctx.beginPath();
  ctx.moveTo(90,90);
  ctx.arc(90,90,80,presentAngle,2*Math.PI);
  ctx.closePath();
  ctx.fillStyle = '#d90429';
  ctx.fill();

  // Border
  ctx.beginPath();
  ctx.arc(90,90,80,0,2*Math.PI);
  ctx.strokeStyle = '#40916c';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Center percentage (Present)
  ctx.font = 'bold 2.2em Segoe UI';
  ctx.fillStyle = '#222';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  var percent = Math.round((present / total) * 100);
  ctx.fillText(percent + '%', 90, 90);
}

// --- Grades modal for a student (10 scores per component, with PS/WS/Final Grade) ---
function openGrades(stuId) {
  const stu = getStudents(window.selectedSectionId).find(s => s.id === stuId);
  if (!stu) return;
  const key = userKey(`grading_${window.selectedSectionId}_${stuId}`);
  let data = JSON.parse(localStorage.getItem(key) || '{}');
  if (!data.WW) data.WW = Array(10).fill('');
  if (!data.PT) data.PT = Array(10).fill('');
  if (!data.QA) data.QA = ['']; // Only one QA

  function transmute(raw) {
    if (raw <= 60) return 60;
    if (raw >= 100) return 100;
    return Math.round(raw);
  }

  function calc(arr, weight, maxTotal) {
    const scores = arr.map(x => parseFloat(x) || 0);
    const total = scores.reduce((a, b) => a + b, 0);
    const ps = (total / maxTotal) * 100;
    const ws = ps * weight;
    return { total, ps, ws };
  }

  // Render modal only once
  let html = `<h2 style="text-align:center;margin-bottom:18px;">Grading System for ${stu.name}</h2>
    <table style="width:100%;max-width:500px;margin:auto;border-collapse:collapse;">
      <thead>
        <tr>
          <th>No.</th>
          <th>WW</th>
          <th>PT</th>
          <th>QA</th>
        </tr>
      </thead>
      <tbody>`;
  for (let i = 0; i < 10; i++) {
    html += `<tr>
      <td style="text-align:center;">${i + 1}</td>
      <td><input type="number" min="0" max="100" data-comp="WW" data-idx="${i}" value="${data.WW[i] || ''}" style="width:60px;"></td>
      <td><input type="number" min="0" max="100" data-comp="PT" data-idx="${i}" value="${data.PT[i] || ''}" style="width:60px;"></td>`;
    if (i === 0) {
      html += `<td rowspan="10" style="vertical-align:middle;text-align:center;">
        <input type="number" min="0" max="100" data-comp="QA" data-idx="0" value="${data.QA[0] || ''}" style="width:60px;">
      </td>`;
    }
    html += `</tr>`;
  }
  html += `
    <tr style="font-weight:bold;">
      <td>Total</td>
      <td id="ww-total"></td>
      <td id="pt-total"></td>
      <td id="qa-total" rowspan="1"></td>
    </tr>
    <tr>
      <td>PS</td>
      <td id="ww-ps"></td>
      <td id="pt-ps"></td>
      <td id="qa-ps" rowspan="1"></td>
    </tr>
    <tr>
      <td>WS</td>
      <td id="ww-ws"></td>
      <td id="pt-ws"></td>
      <td id="qa-ws" rowspan="1"></td>
    </tr>
  </tbody></table>
  <div style="margin:18px 0 0 0;">
    <p><strong>Raw Final Grade:</strong> <span id="raw-grade" style="font-size:1.2em;"></span></p>
    <p><strong>Final Grade:</strong> <span id="final-grade" style="font-size:1.5em;"></span></p>
  </div>
  <div style="text-align:center;margin-top:18px;">
    <button id="closeGradingBtn" class="sidebar-btn" style="width:120px;">Close</button>
  </div>`;
  showModal(html);

  // Calculation and update function
  function updateResults() {
    const wwRes = calc(data.WW, 0.30, 1000);
    const ptRes = calc(data.PT, 0.50, 1000);
    const qaRes = calc(data.QA, 0.20, 100);
    const rawGrade = wwRes.ws + ptRes.ws + qaRes.ws;
    const transmuted = transmute(rawGrade);

    document.getElementById('ww-total').textContent = wwRes.total;
    document.getElementById('pt-total').textContent = ptRes.total;
    document.getElementById('qa-total').textContent = qaRes.total;
    document.getElementById('ww-ps').textContent = wwRes.ps.toFixed(2);
    document.getElementById('pt-ps').textContent = ptRes.ps.toFixed(2);
    document.getElementById('qa-ps').textContent = qaRes.ps.toFixed(2);
    document.getElementById('ww-ws').textContent = wwRes.ws.toFixed(2);
    document.getElementById('pt-ws').textContent = ptRes.ws.toFixed(2);
    document.getElementById('qa-ws').textContent = qaRes.ws.toFixed(2);
    document.getElementById('raw-grade').textContent = rawGrade.toFixed(2);
    document.getElementById('final-grade').textContent = transmuted;
  }

  // Attach input listeners (no re-render)
  document.querySelectorAll('input[data-comp]').forEach(input => {
    input.addEventListener('input', function () {
      const comp = input.getAttribute('data-comp');
      const idx = parseInt(input.getAttribute('data-idx'));
      data[comp][idx] = input.value;
      localStorage.setItem(key, JSON.stringify(data));
      updateResults();
    });
  });
  document.getElementById('closeGradingBtn').onclick = closeModal;

  // Initial calculation
  updateResults();
}

// --- Student sign up and progress ---
function openStudentSignUp() {
  showModal('<h3>Student Progress</h3><input id="signName" class="input" placeholder="Name" style="margin:12px 0;width:98%; padding: 12px 0; font-size:1.2em;"><div style="display:flex;gap:12px;margin-top:18px;"><button id="viewProgressBtn" class="sidebar-btn">View Progress</button><button id="cancelProgressBtn" class="sidebar-btn" style="background:#eee;color:#222;">Cancel</button></div><div id="progressResult"></div>');
  setTimeout(() => {
    document.getElementById('viewProgressBtn').addEventListener('click', showStudentProgress);
    document.getElementById('cancelProgressBtn').addEventListener('click', closeModal);
  }, 0);
}

// --- Notification bar and bell with history ---
if (!document.getElementById('notificationBar')) {
  const notifBar = document.createElement('div');
  notifBar.id = 'notificationBar';
  notifBar.style = 'position:fixed;top:20px;right:20px;z-index:9999;max-width:320px;';
  document.body.appendChild(notifBar);
}

// Save notification to history in localStorage (per user)
function saveNotificationHistory(msg) {
  let history = JSON.parse(localStorage.getItem(userKey('notificationHistory')) || '[]');
  history.unshift({ msg, time: new Date().toLocaleString() });
  if (history.length > 50) history = history.slice(0, 50); // keep last 50
  localStorage.setItem(userKey('notificationHistory'), JSON.stringify(history));
}

// Show notification and save to history
function showNotification(msg) {
  const bar = document.getElementById('notificationBar');
  const note = document.createElement('div');
  note.style = 'background:#d90429;color:#fff;padding:14px 18px;margin-bottom:10px;border-radius:8px;box-shadow:0 2px 8px #0002;font-size:1.1em;display:flex;align-items:center;justify-content:space-between;';
  note.innerHTML = `<span>${msg}</span><button style="background:none;border:none;color:#fff;font-size:1.2em;cursor:pointer;margin-left:12px;" onclick="this.parentNode.remove()">×</button>`;
  bar.appendChild(note);
  saveNotificationHistory(msg);
  setTimeout(() => { if (note.parentNode) note.parentNode.removeChild(note); }, 8000);
}

// Show notification history modal (per user)
function showNotificationHistory() {
  let history = JSON.parse(localStorage.getItem(userKey('notificationHistory')) || '[]');
  let html = `<h3>Notification History</h3>
    <div style="max-height:400px;overflow-y:auto;">`;
  if (history.length === 0) {
    html += `<div style="color:#888;margin:24px 0;">No notifications yet.</div>`;
  } else {
    html += '<ul style="padding-left:0;list-style:none;">';
    history.forEach(item => {
      html += `<li style="margin-bottom:16px;padding-bottom:8px;border-bottom:1px solid #eee;">
        <div style="font-size:1.08em;">${item.msg}</div>
        <div style="color:#888;font-size:0.95em;margin-top:2px;">${item.time}</div>
      </li>`;
    });
    html += '</ul>';
  }
  html += `</div>
    <div style="text-align:center;margin-top:18px;">
      <button id="closeNotifHistoryBtn" class="sidebar-btn" style="width:120px;">Close</button>
      <button id="clearNotifHistoryBtn" class="sidebar-btn" style="width:120px;background:#eee;color:#222;">Clear</button>
    </div>`;
  showModal(html);
  setTimeout(() => {
    document.getElementById('closeNotifHistoryBtn').onclick = closeModal;
    document.getElementById('clearNotifHistoryBtn').onclick = function() {
      localStorage.removeItem(userKey('notificationHistory'));
      closeModal();
    };
  }, 0);
}

// --- View Progress Modal (with section in notification) ---
function showStudentProgress() {
  var name = document.getElementById('signName').value.trim();
  if (!name) return;
  // Find student in all sections
  var sections = getSections();
  var found = null, secName = '', secId = '';
  for (var i=0;i<sections.length;i++) {
    var students = getStudents(sections[i].id);
    var stu = students.find(s=>s.name===name);
    if (stu) { found = stu; secName = sections[i].name; secId = sections[i].id; break; }
  }
  var result = document.getElementById('progressResult');
  if (!found) {
    result.innerHTML = '<div style="color:#d90429;margin-top:18px;">Student not found.</div>';
    return;
  }

  // Attendance summary
  var att = getAttendance(found.id);
  var present = 0, absent = 0, late = 0, total = 0;
  Object.values(att).forEach(status => {
    if (status === 'Present') present++;
    else if (status === 'Absent') absent++;
    else if (status === 'Late') late++;
    if (status) total++;
  });
  var presentAbsentTotal = present + absent;
  var percent = presentAbsentTotal ? Math.round((present / presentAbsentTotal) * 100) : 0;
  // Grade summary
  const key = userKey(`grading_${secId}_${found.id}`);
  let data = JSON.parse(localStorage.getItem(key) || '{}');
  if (!data.WW) data.WW = Array(10).fill('');
  if (!data.PT) data.PT = Array(10).fill('');
  if (!data.QA) data.QA = [''];
  function calc(arr, weight, maxTotal) {
    const scores = arr.map(x => parseFloat(x) || 0);
    const total = scores.reduce((a, b) => a + b, 0);
    const ps = (total / maxTotal) * 100;
    const ws = ps * weight;
    return { total, ps, ws };
  }
  function transmute(raw) {
    if (raw <= 60) return 60;
    if (raw >= 100) return 100;
    return Math.round(raw);
  }
  const wwRes = calc(data.WW, 0.30, 1000);
  const ptRes = calc(data.PT, 0.50, 1000);
  const qaRes = calc(data.QA, 0.20, 100);
  const rawGrade = wwRes.ws + ptRes.ws + qaRes.ws;
  const finalGrade = transmute(rawGrade);

  // Pass/Fail
  const passed = finalGrade >= 75;
  const passText = passed ? `<span style="color:#38b000;font-weight:bold;">PASSED</span>` : `<span style="color:#d90429;font-weight:bold;">FAILED</span>`;

  // Notification for at-risk (with section in text)
  if (absent >= 3) showNotification(`${secName}, ${found.name} has ${absent} absences.`);
  if (late >= 3) showNotification(`${secName}, ${found.name} has ${late} lates.`);
  if (!passed) showNotification(`${secName}, ${found.name} is failing (Final Grade: ${finalGrade}).`);

  // Pie chart HTML
  const pieId = 'progressPieChart';
  result.innerHTML = `
    <div style="display:flex;gap:32px;align-items:flex-start;justify-content:center;min-width:600px;">
      <!-- Attendance (LEFT) -->
      <div style="flex:1;min-width:260px;">
        <div style="font-size:1.15em;font-weight:600;margin-bottom:10px;">Attendance</div>
        <canvas id="${pieId}" width="180" height="180" style="background:#fff;border-radius:50%;box-shadow:0 2px 8px #0001;"></canvas>
        <div style="margin-top:18px;font-size:1.08em;">
          <span style="color:#38b000;font-weight:600;">Present: ${present}</span><br>
          <span style="color:#d90429;font-weight:600;">Absent: ${absent}</span><br>
          <span style="color:#1b6ca8;font-weight:600;">Late: ${late}</span><br>
          <span style="color:#222;font-weight:600;">Attendance: ${percent}%</span>
        </div>
      </div>
      <!-- Grades (RIGHT) -->
      <div style="flex:1;min-width:220px;">
        <div style="font-size:1.15em;font-weight:600;margin-bottom:10px;">Final Grade</div>
        <div style="font-size:2.5em;font-weight:bold;color:#1b6ca8;margin-bottom:10px;">${finalGrade}</div>
        <div style="font-size:1.2em;margin-bottom:10px;">${passText}</div>
        <div style="color:#888;">Section: ${secName}</div>
      </div>
    </div>
  `;

  // Draw pie chart
  setTimeout(() => {
    const c = document.getElementById(pieId);
    if (!c) return;
    const ctx = c.getContext('2d');
    ctx.clearRect(0,0,180,180);
    
    const totalPie = present + absent || 1;
  // Present (green)
  let start = 0, angle = (present / totalPie) * 2 * Math.PI;
  ctx.beginPath(); ctx.moveTo(90,90);
  ctx.arc(90,90,80,start,start+angle); ctx.closePath();
  ctx.fillStyle = '#38b000'; ctx.fill();
  // Absent (red)
  start += angle; angle = (absent / totalPie) * 2 * Math.PI;
  ctx.beginPath(); ctx.moveTo(90,90);
  ctx.arc(90,90,80,start,start+angle); ctx.closePath();
  ctx.fillStyle = '#d90429'; ctx.fill();
    // Border
    ctx.beginPath(); ctx.arc(90,90,80,0,2*Math.PI);
    ctx.strokeStyle = '#40916c'; ctx.lineWidth = 2; ctx.stroke();
    // Center percentage (Present)
    ctx.font = 'bold 2.2em Segoe UI';
    ctx.fillStyle = '#222';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(percent + '%', 90, 90);
  }, 100);
}

// --- Modal close on overlay click ---
document.getElementById('modalOverlay').onclick = closeModal;

// Robust event listener attachment for main sidebar/header buttons
function attachButtonListeners() {
  var addBtn = document.getElementById('addSectionBtn');
  var signUpBtn = document.getElementById('studentSignUpBtn');
  var logoutBtn = document.getElementById('logoutBtn');
  if (addBtn) addBtn.onclick = addSection;
  if (signUpBtn) signUpBtn.onclick = openStudentSignUp;
  if (logoutBtn) logoutBtn.onclick = function() { window.location.href = 'index.html'; };
}
attachButtonListeners();
// In case the DOM is dynamically re-rendered, re-attach listeners after each render
window.attachButtonListeners = attachButtonListeners;

// --- Initial render ---
document.addEventListener('DOMContentLoaded', function() {
  renderSections();
  renderTabs();
  if (window.attachButtonListeners) window.attachButtonListeners();
});


// --- Settings Panel Dropdown Logic ---
document.addEventListener('DOMContentLoaded', function() {
  const settingsGear = document.getElementById('settingsGear');
  const settingsPanel = document.getElementById('settingsPanel');
  const openNotifications = document.getElementById('openNotifications');
  const clearGradesBtn = document.getElementById('clearGradesBtn');

  // Toggle settings panel
  settingsGear.addEventListener('click', function(e) {
    e.stopPropagation();
    if (settingsPanel.style.display === 'block') {
      settingsPanel.style.display = 'none';
    } else {
      // Position panel below or beside the gear icon
      const rect = settingsGear.getBoundingClientRect();
      settingsPanel.style.left = (rect.left - 10 + window.scrollX) + 'px';
      settingsPanel.style.top = (rect.bottom + 8 + window.scrollY) + 'px';
      settingsPanel.style.display = 'block';
    }
  });

  // Hide panel when clicking outside
  document.addEventListener('click', function(e) {
    if (settingsPanel.style.display === 'block' && !settingsPanel.contains(e.target) && e.target !== settingsGear) {
      settingsPanel.style.display = 'none';
    }
  });

  // Open notifications history
  openNotifications.addEventListener('click', function() {
    settingsPanel.style.display = 'none';
    showNotificationHistory();
  });

  // Clear grades logic
  clearGradesBtn.addEventListener('click', function() {
    settingsPanel.style.display = 'none';
    showClearGradesConfirmation();
  });
});

// --- Show clear grades confirmation modal ---
function showClearGradesConfirmation() {
  showModal(`
    <h3>Clear All Grades</h3>
    <div style="margin:18px 0;">Are you sure you want to clear all grades for all students? This cannot be undone.</div>
    <div style="display:flex;gap:12px;margin-top:18px;">
      <button id="confirmClearGradesBtn" class="sidebar-btn" style="background:#d90429;color:#fff;">Clear</button>
      <button id="cancelClearGradesBtn" class="sidebar-btn" style="background:#eee;color:#222;">Cancel</button>
    </div>
  `);
  setTimeout(() => {
    document.getElementById('confirmClearGradesBtn').onclick = function() {
      // Remove all grades for all students in all sections for current user
      const sections = getSections();
      sections.forEach(sec => {
        const students = getStudents(sec.id);
        students.forEach(stu => {
          localStorage.removeItem(userKey('grades_' + stu.id));
          localStorage.removeItem(userKey(`grading_${sec.id}_${stu.id}`));
        });
      });
      closeModal();
      showNotification('All grades cleared.');
    };
    document.getElementById('cancelClearGradesBtn').onclick = closeModal;
  }, 0);
}