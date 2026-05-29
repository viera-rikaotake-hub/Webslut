  var MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];
  var DOW_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
 
  var today = new Date();
  var current = { year: today.getFullYear(), month: today.getMonth() };
  var selected = null;
  var plans = {};
 
  function dateKey(y, m, d) {
    return y + "-" + String(m + 1).padStart(2,"0") + "-" + String(d).padStart(2,"0");
  }
 
  function renderCalendar() {
    var year = current.year;
    var month = current.month;
 
    document.getElementById("monthTitle").innerHTML =
      MONTHS[month] + '<span>' + year + '</span>';
 
    var grid = document.getElementById("daysGrid");
    grid.innerHTML = "";
 
    var firstDay = new Date(year, month, 1).getDay();
    var offset = firstDay === 0 ? 6 : firstDay - 1;
    var daysInMonth = new Date(year, month + 1, 0).getDate();
 
    for (var i = 0; i < offset; i++) {
      var spacer = document.createElement("li");
      spacer.className = "empty";
      spacer.innerHTML = "&nbsp;";
      grid.appendChild(spacer);
    }
 
    for (var d = 1; d <= daysInMonth; d++) {
      var li = document.createElement("li");
      var key = dateKey(year, month, d);
      var isToday = (d === today.getDate() && month === today.getMonth() && year === today.getFullYear());
      var isSel = (selected && selected.day === d && selected.month === month && selected.year === year);
      var hasPlans = (plans[key] && plans[key].length > 0);
 
      var cls = "day-num";
      if (isToday) cls += " active";
      else if (isSel) cls += " selected";
 
      li.innerHTML = '<span class="' + cls + '">' + d + '</span>' +
                     (hasPlans ? '<span class="plan-dot"></span>' : '');
 
      (function(day, mo, yr) {
        li.addEventListener("click", function() { selectDay(day, mo, yr); });
      })(d, month, year);
 
      grid.appendChild(li);
    }
  }
 
  function selectDay(d, month, year) {
    if (selected && selected.day === d && selected.month === month && selected.year === year) {
      selected = null;
      document.getElementById("plansPanel").style.display = "none";
    } else {
      selected = { day: d, month: month, year: year };
      renderPanel();
    }
    renderCalendar();
  }
 
  function renderPanel() {
    if (!selected) return;
    var day = selected.day, month = selected.month, year = selected.year;
    var key = dateKey(year, month, day);
    var dayPlans = plans[key] || [];
 
    var dowName = DOW_NAMES[new Date(year, month, day).getDay()];
    document.getElementById("panelTitle").textContent =
      dowName + ", " + day + " " + MONTHS[month] + " " + year;
 
    var ul = document.getElementById("plansList");
    ul.innerHTML = "";
 
    if (dayPlans.length === 0) {
      var empty = document.createElement("li");
      empty.className = "no-plans";
      empty.style.border = "none";
      empty.textContent = "No plans for this day.";
      ul.appendChild(empty);
    } else {
      dayPlans.forEach(function(plan, idx) {
        var li = document.createElement("li");
        li.innerHTML = '<span>' + plan + '</span>' +
          '<button class="del-btn" onclick="deletePlan(\'' + key + '\',' + idx + ')" title="Remove">&#10005;</button>';
        ul.appendChild(li);
      });
    }
 
    document.getElementById("plansPanel").style.display = "block";
    document.getElementById("planInput").value = "";
    document.getElementById("planInput").focus();
  }
 
  function addPlan() {
    if (!selected) return;
    var input = document.getElementById("planInput");
    var text = input.value.trim();
    if (!text) return;
    var key = dateKey(selected.year, selected.month, selected.day);
    if (!plans[key]) plans[key] = [];
    plans[key].push(text);
    input.value = "";
    renderCalendar();
    renderPanel();
  }
 
  function deletePlan(key, idx) {
    plans[key].splice(idx, 1);
    if (plans[key].length === 0) delete plans[key];
    renderCalendar();
    renderPanel();
  }
 
  document.addEventListener("keydown", function(e) {
    if (e.key === "Enter" && document.activeElement.id === "planInput") addPlan();
  });
 
  function changeMonth(dir) {
    current.month += dir;
    if (current.month > 11) { current.month = 0; current.year++; }
    if (current.month < 0)  { current.month = 11; current.year--; }
    renderCalendar();
  }
 
  function toggleYearAhead() {
    var panel = document.getElementById("yearAheadPanel");
    if (panel.style.display === "block") {
      panel.style.display = "none";
    } else {
      renderYearAhead();
      panel.style.display = "block";
    }
  }
 
  function renderYearAhead() {
    var container = document.getElementById("yearAheadContent");
    container.innerHTML = "";
 
    var from = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    var to   = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
 
    var byMonth = {};
    Object.keys(plans).sort().forEach(function(key) {
      var parts = key.split("-");
      var y = parseInt(parts[0]), m = parseInt(parts[1]), d = parseInt(parts[2]);
      var date = new Date(y, m - 1, d);
      if (date < from || date > to) return;
      if (!plans[key] || plans[key].length === 0) return;
      var mk = y + "-" + String(m).padStart(2,"0");
      if (!byMonth[mk]) byMonth[mk] = [];
      byMonth[mk].push({ key: key, day: d, month: m - 1, year: y });
    });
 
    var monthKeys = Object.keys(byMonth).sort();
 
    if (monthKeys.length === 0) {
      var p = document.createElement("p");
      p.className = "ya-empty";
      p.textContent = "No plans in the next 12 months yet. Click any future day and add some!";
      container.appendChild(p);
      return;
    }
 
    monthKeys.forEach(function(mk) {
      var parts = mk.split("-");
      var y = parseInt(parts[0]), m = parseInt(parts[1]);
      var group = document.createElement("div");
      group.className = "ya-month-group";
 
      var label = document.createElement("div");
      label.className = "ya-month-label";
      label.textContent = MONTHS[m - 1] + " " + y;
      group.appendChild(label);
 
      byMonth[mk].forEach(function(item) {
        var dow = DOW_NAMES[new Date(item.year, item.month, item.day).getDay()];
        plans[item.key].forEach(function(plan) {
          var row = document.createElement("div");
          row.className = "ya-plan-row";
          row.title = "Click to jump to this day";
          row.innerHTML = '<span class="ya-date-tag">' + dow + " " + item.day + '</span><span>' + plan + '</span>';
          (function(it) {
            row.addEventListener("click", function() {
              current.year = it.year;
              current.month = it.month;
              selected = { day: it.day, month: it.month, year: it.year };
              renderCalendar();
              renderPanel();
              document.getElementById("yearAheadPanel").style.display = "none";
              window.scrollTo(0, 0);
            });
          })(item);
          group.appendChild(row);
        });
      });
 
      container.appendChild(group);
    });
  }
 
  renderCalendar();