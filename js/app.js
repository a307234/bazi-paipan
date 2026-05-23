(function () {
  var $ = function (sel, el) { return (el || document).querySelector(sel); };
  var $$ = function (sel, el) { return [].slice.call((el || document).querySelectorAll(sel)); };

  var state = {
    birth: {
      year: 1990,
      month: 5,
      day: 15,
      hour: 12,
      minute: 0,
      gender: 1,
    },
    calendarType: "solar",    // "solar" | "lunar"
    birthplace: "长沙",
    birthplaceData: null,
    useTrueSolar: true,
    selectedShichen: null,
    result: null,
  };

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function syncInputsFromState() {
    $("#birth-year").value = state.birth.year;
    $("#birth-month").value = state.birth.month;
    $("#birth-day").value = state.birth.day;
    $("#birth-hour").value = state.birth.hour;
    $("#birth-minute").value = state.birth.minute;
    $("input[name=\"gender\"][value=\"" + state.birth.gender + "\"]").checked = true;
    $("input[name=\"calendar-type\"][value=\"" + state.calendarType + "\"]").checked = true;
    $("#birthplace").value = state.birthplace;
    $("#use-true-solar").checked = state.useTrueSolar;
  }

  function readInputs() {
    state.birth = {
      year: +$("#birth-year").value,
      month: +$("#birth-month").value,
      day: +$("#birth-day").value,
      hour: +$("#birth-hour").value,
      minute: +$("#birth-minute").value,
      gender: +$("input[name=\"gender\"]:checked").value,
    };
    state.calendarType = $("input[name=\"calendar-type\"]:checked").value;
    state.birthplace = $("#birthplace").value.trim() || "北京";
    state.useTrueSolar = $("#use-true-solar").checked;

    var cityInfo = BaziCities.find(state.birthplace);
    state.birthplaceData = cityInfo || { name: state.birthplace, lng: 116.4, lat: 39.9 };
  }

  function renderShichen() {
    var wrap = $("#shichen-list");
    wrap.innerHTML = "";
    var sc = BaziCalendar.hourToShichen(state.birth.hour, state.birth.minute);
    BaziCalendar.SHICHEN.forEach(function (item) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "shichen-btn";
      if (item.zhi === sc.zhi) btn.classList.add("shichen-btn--active");
      btn.innerHTML = '<span class="shichen-btn__name">' + item.name + '</span><span class="shichen-btn__range">' + item.range + '</span>';
      btn.addEventListener("click", function () {
        state.birth.hour = item.hour;
        state.birth.minute = 0;
        $("#birth-hour").value = item.hour;
        $("#birth-minute").value = 0;
        renderShichen();
      });
      wrap.appendChild(btn);
    });
  }

  var WUXING_COLOR = {
    "金": "#DAA520",
    "木": "#50C878",
    "水": "#4A9FD4",
    "火": "#DC143C",
    "土": "#8B4513"
  };

  var GAN_WUXING = {
    "甲":"木","乙":"木","丙":"火","丁":"火","戊":"土","己":"土",
    "庚":"金","辛":"金","壬":"水","癸":"水"
  };

  var ZHI_WUXING = {
    "子":"水","丑":"土","寅":"木","卯":"木","辰":"土","巳":"火",
    "午":"火","未":"土","申":"金","酉":"金","戌":"土","亥":"水"
  };

  function ganColor(gan) {
    var wx = GAN_WUXING[gan];
    return WUXING_COLOR[wx] || "inherit";
  }

  function zhiColor(zhi) {
    var wx = ZHI_WUXING[zhi];
    return WUXING_COLOR[wx] || "inherit";
  }

  function renderBaziTable(result) {
    var rows = [
      { key: "label", title: "四柱", render: function(p) { return p.label; } },
      { key: "shishenGan", title: "十神", render: function(p) { return '<span class="ss">' + p.shishenGan + '</span>'; } },
      { key: "gan", title: "天干", render: function(p) { return '<span class="gz-char" style="color:' + ganColor(p.gan) + '">' + p.gan + '</span>'; } },
      { key: "zhi", title: "地支", render: function(p) { return '<span class="gz-char" style="color:' + zhiColor(p.zhi) + '">' + p.zhi + '</span>'; } },
      { key: "canggan", title: "藏干", render: function(p) { return p.canggan.map(function(c) { return '<span class="cg">' + c.text + '<em>(' + c.shishen + ')</em></span>'; }).join(""); } },
      { key: "xunkong", title: "空亡", render: function(p) { return p.xunkong; } },
      { key: "nayin", title: "纳音", render: function(p) { return p.nayin; } },
      { key: "shensha", title: "神煞", render: function(p) { return (p.shensha || ["—"]).map(function(s) { return '<span class="tag">' + s + '</span>'; }).join(""); } },
    ];

    var table = $("#bazi-table");
    table.innerHTML = "";

    rows.forEach(function (row) {
      var tr = document.createElement("tr");
      var th = document.createElement("th");
      th.textContent = row.title;
      tr.appendChild(th);
      result.pillars.forEach(function (p) {
        var td = document.createElement("td");
        td.innerHTML = row.render(p);
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });

    // 卡片区：横向4列
    $("#pillar-cards").innerHTML = result.pillars
      .map(function (p) {
        var gColor = ganColor(p.gan);
        var zColor = zhiColor(p.zhi);
        return '<article class="pillar-card">' +
          '<header>' + p.label + '</header>' +
          '<div class="pillar-card__gz">' +
            '<span style="color:' + gColor + '">' + p.gan + '</span>' +
            '<span style="color:' + zColor + '">' + p.zhi + '</span>' +
          '</div>' +
          '<p class="pillar-card__sub">' + p.shishenGan + ' · ' + p.nayin + '</p>' +
          '<p class="pillar-card__cg">' + p.canggan.map(function (c) { return c.text + "(" + c.shishen + ")"; }).join(" ") + '</p>' +
          '</article>';
      })
      .join("");
  }

  function renderDaYun(result) {
    var yun = result.yun;
    var wrap = $("#dayun-section");
    if (!yun || !yun.daYun.length) {
      wrap.innerHTML = "";
      return;
    }

    var h =
      '<h3 class="yun-title">大运流年</h3>' +
      '<p class="yun-start">起运：' + yun.startYear + '年' + yun.startMonth + '月' + yun.startDay + '日（' + (yun.isForward ? '顺排' : '逆排') + '）</p>' +
      '<div class="dayun-table-wrap"><table class="dayun-table"><tbody>';

    yun.daYun.forEach(function (dy) {
      var cls = dy.isCurrent ? ' class="dayun-current"' : '';
      h += '<tr' + cls + '>' +
        '<td class="dayun-age">' + dy.startAge + '–' + dy.endAge + '岁</td>' +
        '<td class="dayun-year">' + dy.startYear + '–' + dy.endYear + '</td>' +
        '<td class="dayun-gz">' + dy.ganzhi + '</td>' +
        '<td class="dayun-liunian">';
      dy.liuNian.forEach(function (ln) {
        var lnCls = (ln.year === new Date().getFullYear()) ? ' class="ln-current"' : '';
        h += '<span' + lnCls + ' title="' + (ln.desc || '') + '">' + ln.year + '<small>' + ln.ganzhi + '</small></span>';
      });
      h += '</td></tr>';
    });

    h += '</tbody></table></div>';
    wrap.innerHTML = h;
  }

  function renderExtras(result) {
    var calendarLabel = result.calendarType === "lunar" ? "阴历" : "阳历";
    var timeLabel = result.calendarType === "lunar" ? "" : "";
    var metaParts = [
      result.genderText,
      calendarLabel + " " + result.solarOriginal.year + "-" + pad(result.solarOriginal.month) + "-" + pad(result.solarOriginal.day) + " " + pad(result.solarOriginal.hour) + ":" + pad(result.solarOriginal.minute),
      result.lunar.full,
      result.shichen.name,
      "生肖" + result.meta.shengxiao,
    ];

    if (result.isLateZi) {
      metaParts.push("晚子时（日柱用当日，时柱用次日）");
    }

    if (result.trueSolarInfo) {
      var ts = result.trueSolarInfo;
      var dir = ts.offsetMinutes >= 0 ? "+" : "";
      metaParts.push("真太阳时 " + pad(ts.hour) + ":" + pad(ts.minute) + "（" + dir + ts.offsetMinutes + "分）");
    }

    if (result.birthplace && result.birthplace.name) {
      metaParts.push(result.birthplace.name);
    }

    $("#meta-line").textContent = metaParts.join(" · ");

    $("#geju-list").innerHTML = result.geju.map(function (t) { return "<li>" + t + "</li>"; }).join("");
    $("#gan-notes").innerHTML = result.ganNotes.map(function (t) { return "<li>" + t + "</li>"; }).join("");
    $("#zhi-notes").innerHTML = result.zhiNotes.map(function (t) { return "<li>" + t + "</li>"; }).join("");

    var cg = result.chenggu;
    $("#chenggu-body").innerHTML =
      '<p class="chenggu-total">总骨重：<strong>' + cg.total + '</strong></p>' +
      '<ul class="chenggu-parts">' + cg.parts.map(function (p) { return "<li>" + p.label + " " + p.value + (p.gz ? "（" + p.gz + "）" : "") + (p.note ? " · " + p.note : "") + "</li>"; }).join("") + '</ul>' +
      '<p class="chenggu-poem">' + cg.poem + '</p>';

    $("#shensha-all").innerHTML = result.shenshaAll.map(function (s) { return '<span class="tag tag--accent">' + s + '</span>'; }).join("");

    $("#extra-meta").innerHTML =
      '<span>胎元 ' + result.meta.taiyuan + '</span>' +
      '<span>命宫 ' + result.meta.minggong + '</span>' +
      '<span>身宫 ' + result.meta.shengong + '</span>';
  }

  function showToast(msg, duration) {
    duration = duration || 3000;
    var toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = msg;
    document.body.appendChild(toast);
    // 强制回流后添加 show 类触发淡入
    void toast.offsetWidth;
    toast.classList.add("toast--show");
    setTimeout(function () {
      toast.classList.remove("toast--show");
      setTimeout(function () {
        document.body.removeChild(toast);
      }, 400);
    }, duration);
  }

  function doPaipan() {
    readInputs();
    try {
      var result = BaziEngine.compute({
        year: state.birth.year,
        month: state.birth.month,
        day: state.birth.day,
        hour: state.birth.hour,
        minute: state.birth.minute,
        gender: state.birth.gender,
        calendarType: state.calendarType,
        birthplace: state.birthplaceData,
        useTrueSolar: state.useTrueSolar,
      });
      state.result = result;
      renderBaziTable(result);
      renderDaYun(result);
      renderExtras(result);
      $("#result-empty").hidden = true;
      $("#result-panel").hidden = false;
      showToast("排盘完成、请下滑查看~");
    } catch (e) {
      console.error(e);
      $("#result-empty").hidden = false;
      $("#result-panel").hidden = true;
      $("#result-empty").textContent = "排盘失败，请检查日期是否有效。";
    }
  }

  function init() {
    // === 主题切换 ===
    var savedTheme = localStorage.getItem("bazi-theme") || "classic";
    applyTheme(savedTheme);

    function applyTheme(name) {
      document.documentElement.dataset.theme = name;
      localStorage.setItem("bazi-theme", name);
      $$(".theme-btn").forEach(function (b) {
        b.classList.toggle("theme-btn--active", b.dataset.theme === name);
      });
    }

    $$(".theme-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        applyTheme(this.dataset.theme);
      });
    });

    var now = new Date();
    state.birth.year = now.getFullYear() - 35;
    state.birth.month = now.getMonth() + 1;
    state.birth.day = now.getDate();
    if (BaziCities && BaziCities.find) {
      var defCity = BaziCities.find("长沙");
      if (defCity) state.birthplaceData = defCity;
    }

    syncInputsFromState();
    renderShichen();

    $("#btn-paipan").addEventListener("click", doPaipan);

    ["birth-year", "birth-month", "birth-day", "birth-hour", "birth-minute"].forEach(function (id) {
      $("#" + id).addEventListener("input", function () {
        readInputs();
        renderShichen();
      });
      $("#" + id).addEventListener("change", function () {
        readInputs();
        renderShichen();
      });
    });

    $$("input[name=\"gender\"]").forEach(function (el) {
      el.addEventListener("change", function () { readInputs(); });
    });
    $$("input[name=\"calendar-type\"]").forEach(function (el) {
      el.addEventListener("change", function () {
        readInputs();
      });
    });

    $("#birthplace").addEventListener("change", function () {
      readInputs();
    });
    $("#birthplace").addEventListener("input", function () {
      var v = this.value.trim();
      if (v) {
        var c = BaziCities.find(v);
        if (c) state.birthplaceData = c;
      }
    });
    $("#use-true-solar").addEventListener("change", function () {
      readInputs();
    });

    // === 输入框键盘导航 ===
    // 顺序：性别 → 出生地 → 历法 → 年 → 月 → 日 → 时 → 分 → 开始排盘
    function jumpTo(nextEl) {
      if (!nextEl) return;
      if (nextEl.tagName === "BUTTON" || nextEl.id === "btn-paipan") {
        nextEl.focus();
      } else if (nextEl.type === "radio") {
        nextEl.checked = true;
        nextEl.focus();
        readInputs();
      } else {
        nextEl.focus();
        nextEl.select();
      }
    }

    // 为指定元素添加 Enter 跳转
    function bindEnter(el, nextEl) {
      if (!el) return;
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          if (el.type === "radio") { el.checked = true; readInputs(); }
          jumpTo(nextEl);
        } else if (e.key === "Tab" && el.type !== "radio") {
          var self = el;
          setTimeout(function () { self.select(); }, 10);
        }
      });
      // 聚焦全选（非radio）
      if (el.type !== "radio") {
        el.addEventListener("focus", function () { this.select(); });
      }
    }

    // 数字输入框：满位自动跳转
    function bindAutoJump(el, maxLen, nextEl) {
      if (!el || !maxLen) return;
      el.addEventListener("input", function () {
        var val = this.value.replace(/[^0-9]/g, "");
        if (val.length >= maxLen) jumpTo(nextEl);
      });
    }

    var genderRadios = document.getElementsByName("gender");
    var calRadios = document.getElementsByName("calendar-type");
    var yearEl = $("#birth-year");
    var monthEl = $("#birth-month");
    var dayEl = $("#birth-day");
    var hourEl = $("#birth-hour");
    var minEl = $("#birth-minute");
    var bpEl = $("#birthplace");
    var btnEl = $("#btn-paipan");

    // 性别组 (两个radio都绑Enter到出生地)
    genderRadios.forEach(function (r) { bindEnter(r, bpEl); });
    // 出生地 → 历法组
    bindEnter(bpEl, calRadios[0]);
    // 历法组 → 年
    calRadios.forEach(function (r) { bindEnter(r, yearEl); });
    // 年(4位) → 月
    bindEnter(yearEl, monthEl);
    bindAutoJump(yearEl, 4, monthEl);
    // 月(2位) → 日
    bindEnter(monthEl, dayEl);
    bindAutoJump(monthEl, 2, dayEl);
    // 日(2位) → 时
    bindEnter(dayEl, hourEl);
    bindAutoJump(dayEl, 2, hourEl);
    // 时(2位) → 分
    bindEnter(hourEl, minEl);
    bindAutoJump(hourEl, 2, minEl);
    // 分(2位) → 按钮（聚焦按钮，不自动排盘）
    bindEnter(minEl, btnEl);
    bindAutoJump(minEl, 2, btnEl);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
