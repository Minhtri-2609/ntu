/* ===== clock.js – Đồng hồ tròn + số cho nhiều múi giờ, và lịch tháng ===== */
(function () {
  "use strict";
  var VN = "Asia/Ho_Chi_Minh";
  var DAYS = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
  var cache = {};
  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function zone(tz, now) {
    var f = cache[tz] || (cache[tz] = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hourCycle: "h23",
      year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    var o = {};
    f.formatToParts(now).forEach(function (p) { if (p.type !== "literal") o[p.type] = +p.value; });
    var off = Math.round((Date.UTC(o.year, o.month - 1, o.day, o.hour, o.minute, o.second) - Math.floor(now / 1000) * 1000) / 60000);
    var a = Math.abs(off);
    o.dow = new Date(Date.UTC(o.year, o.month - 1, o.day)).getUTCDay();
    o.gmt = "GMT" + (off < 0 ? "-" : "+") + Math.floor(a / 60) + (a % 60 ? ":" + pad(a % 60) : "");
    return o;
  }

  function dial() {
    var s = '<svg class="dial" viewBox="0 0 100 100" aria-hidden="true"><circle class="bg" cx="50" cy="50" r="47"/>', i, a, r;
    for (i = 0; i < 60; i++) {
      a = i * Math.PI / 30; r = i % 5 === 0 ? 39 : 43;
      s += '<line class="tk' + (i % 5 === 0 ? " mj" : "") + '" x1="' + (50 + r * Math.sin(a)).toFixed(2) + '" y1="' + (50 - r * Math.cos(a)).toFixed(2) +
           '" x2="' + (50 + 45 * Math.sin(a)).toFixed(2) + '" y2="' + (50 - 45 * Math.cos(a)).toFixed(2) + '"/>';
    }
    [12, 3, 6, 9].forEach(function (n) {
      a = (n % 12) * Math.PI / 6;
      s += '<text x="' + (50 + 30 * Math.sin(a)).toFixed(2) + '" y="' + (50 - 30 * Math.cos(a)).toFixed(2) + '">' + n + "</text>";
    });
    return s + '<line class="hh" x1="50" y1="50" x2="50" y2="29"/><line class="mn" x1="50" y1="50" x2="50" y2="17"/>' +
           '<line class="sc" x1="50" y1="58" x2="50" y2="12"/><circle class="dot" cx="50" cy="50" r="3"/></svg>';
  }

  var clocks = [];
  Array.prototype.forEach.call(document.querySelectorAll(".clk[data-tz]"), function (el) {
    el.innerHTML = dial() + '<div class="ck-txt"><div class="ck-name">' + (el.getAttribute("data-name") || "") +
      '</div><time class="ck-time"><b>--</b><i>:</i><b>--</b><i>:</i><b>--</b></time><div class="ck-date"></div><div class="ck-tz"></div></div>';
    clocks.push({ el: el, tz: el.getAttribute("data-tz"), city: el.getAttribute("data-city") || "",
      hh: el.querySelector(".hh"), mn: el.querySelector(".mn"), sc: el.querySelector(".sc"),
      b: el.querySelectorAll("time b"), t: el.querySelector("time"), d: el.querySelector(".ck-date"), z: el.querySelector(".ck-tz") });
  });
  function paint(c, now) {
    var o = zone(c.tz, now);
    c.hh.setAttribute("transform", "rotate(" + ((o.hour % 12) * 30 + o.minute * 0.5 + o.second / 120) + " 50 50)");
    c.mn.setAttribute("transform", "rotate(" + (o.minute * 6 + o.second * 0.1) + " 50 50)");
    c.sc.setAttribute("transform", "rotate(" + o.second * 6 + " 50 50)");
    c.b[0].textContent = pad(o.hour); c.b[1].textContent = pad(o.minute); c.b[2].textContent = pad(o.second);
    c.d.textContent = DAYS[o.dow] + ", " + pad(o.day) + "/" + pad(o.month) + "/" + o.year;
    c.z.textContent = (c.city ? c.city + " · " : "") + o.gmt;
    c.t.setAttribute("datetime", o.year + "-" + pad(o.month) + "-" + pad(o.day) + "T" + pad(o.hour) + ":" + pad(o.minute) + ":" + pad(o.second));
  }
  Array.prototype.forEach.call(document.querySelectorAll("select[data-clock]"), function (sel) {
    var c = clocks.filter(function (x) { return x.el.id === sel.getAttribute("data-clock"); })[0];
    if (!c) return;
    function use() {
      var op = sel.options[sel.selectedIndex];
      c.tz = op.value; c.city = op.getAttribute("data-city") || "";
      paint(c, Date.now());
    }
    sel.addEventListener("change", use); use();
  });
  function tick() {
    var now = Date.now();
    clocks.forEach(function (c) { paint(c, now); });
    setTimeout(tick, 1000 - (now % 1000) + 5);
  }
  if (clocks.length) tick();

  var cal = document.getElementById("cal");
  if (cal) {
    var t0 = zone(VN, Date.now()), y = t0.year, m = t0.month - 1, key = "";
    var draw = function () {
      var t = zone(VN, Date.now()), h = "", i, col;
      var first = (new Date(Date.UTC(y, m, 1)).getUTCDay() + 6) % 7, len = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
      key = t.year + "-" + t.month + "-" + t.day;
      ["T2", "T3", "T4", "T5", "T6", "T7", "CN"].forEach(function (d, k) { h += '<span class="wd' + (k > 4 ? " we" : "") + '">' + d + "</span>"; });
      for (i = 0; i < first; i++) h += "<span></span>";
      for (i = 1; i <= len; i++) {
        col = (first + i - 1) % 7;
        h += '<span class="' + (col > 4 ? "we " : "") + (t.year === y && t.month - 1 === m && t.day === i ? "td" : "") + '">' + i + "</span>";
      }
      cal.innerHTML = '<div class="cal-h"><button class="cb" data-d="-1" aria-label="Tháng trước">‹</button><div class="cal-t" aria-live="polite">Tháng ' +
        (m + 1) + ", " + y + '</div><button class="cb" data-d="1" aria-label="Tháng sau">›</button></div><div class="cal-g">' + h +
        '</div><button class="btn sm ghost cal-now">Hôm nay</button>';
    };
    cal.addEventListener("click", function (e) {
      var b = e.target.closest("button"), sel;
      if (!b) return;
      if (b.classList.contains("cal-now")) { var t = zone(VN, Date.now()); y = t.year; m = t.month - 1; sel = ".cal-now"; }
      else { sel = '[data-d="' + b.getAttribute("data-d") + '"]'; m += +b.getAttribute("data-d"); if (m < 0) { m = 11; y--; } else if (m > 11) { m = 0; y++; } }
      draw(); cal.querySelector(sel).focus();
    });
    draw();
    setInterval(function () { var t = zone(VN, Date.now()); if (t.year + "-" + t.month + "-" + t.day !== key) draw(); }, 60000);
  }
})();

