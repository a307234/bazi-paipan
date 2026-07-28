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

  function renderShengshi(result) {
    var wrap = $("#shengshi-body");
    if (!wrap) return;
    var ss = result.shengshi;
    if (!ss) {
      wrap.innerHTML = "";
      return;
    }

    var levelClass = {
      "身强": "shengshi-badge--strong",
      "偏强": "shengshi-badge--strongish",
      "中和": "shengshi-badge--mid",
      "偏弱": "shengshi-badge--weakish",
      "身弱": "shengshi-badge--weak"
    }[ss.level] || "shengshi-badge--mid";

    var flagMap = [
      { key: "deLing", label: "得令" },
      { key: "deDi", label: "得地" },
      { key: "deShi", label: "得势" },
      { key: "deSheng", label: "得生" }
    ];
    var flagHtml = flagMap.map(function (f) {
      var on = ss.flags && ss.flags[f.key];
      return '<span class="shengshi-flag' + (on ? " is-on" : "") + '">' + f.label + (on ? "✓" : "✗") + '</span>';
    }).join("");

    var factorHtml = (ss.factors || []).map(function (f) {
      var wPct = Math.round(f.weight * 100);
      var s = Math.round(f.score);
      return (
        '<div class="factor-row" title="' + (f.detail || "").replace(/"/g, "&quot;") + '">' +
          '<div class="factor-head">' +
            '<span class="factor-name">' + f.name + '</span>' +
            '<span class="factor-meta">权' + wPct + '% · ' + s + '分</span>' +
          '</div>' +
          '<div class="wx-bar-track"><div class="wx-bar-fill" style="width:' + s + '%;background:rgba(var(--accent-rgb),0.85)"></div></div>' +
          '<p class="factor-detail">' + (f.detail || "") + '</p>' +
        '</div>'
      );
    }).join("");

    var barHtml = (window.Shengshi && Shengshi.WX_ORDER ? Shengshi.WX_ORDER : ["木", "火", "土", "金", "水"]).map(function (wx) {
      var pct = ss.percent[wx] || 0;
      return (
        '<div class="wx-bar-row">' +
          '<span class="wx-bar-label" style="color:' + (WUXING_COLOR[wx] || "inherit") + '">' + wx + '</span>' +
          '<div class="wx-bar-track"><div class="wx-bar-fill" style="width:' + pct + '%;background:' + (WUXING_COLOR[wx] || "#888") + '"></div></div>' +
          '<span class="wx-bar-pct">' + pct + '%</span>' +
        '</div>'
      );
    }).join("");

    var xiHtml = ss.xiYong.map(function (w) {
      return '<span class="tag tag--xi">' + w + '</span>';
    }).join("");
    var jiHtml = ss.jiShen.map(function (w) {
      return '<span class="tag tag--ji">' + w + '</span>';
    }).join("");

    wrap.innerHTML =
      '<div class="shengshi-card">' +
        '<div class="shengshi-top">' +
          '<span class="shengshi-badge ' + levelClass + '">' + ss.level + '</span>' +
          (ss.total != null ? '<span class="shengshi-total">综合 ' + ss.total + ' 分</span>' : '') +
          '<div class="shengshi-flags">' + flagHtml + '</div>' +
        '</div>' +
        '<p class="shengshi-summary">日主 <strong style="color:' + ganColor(ss.dayGan) + '">' + ss.dayGan + ss.dayWx + '</strong> · ' + ss.summary + '</p>' +
        '<div class="factor-bars">' + factorHtml + '</div>' +
        '<h4 class="shengshi-sub">五行力量（参考）</h4>' +
        '<div class="wx-bars">' + barHtml + '</div>' +
        '<div class="shengshi-yong">' +
          '<div class="shengshi-yong-col">' +
            '<span class="shengshi-yong-label">喜用神</span>' +
            '<div class="tag-row">' + xiHtml + '</div>' +
            '<p class="shengshi-yong-hint">' + (ss.xiCats || []).join(" · ") + '</p>' +
          '</div>' +
          '<div class="shengshi-yong-col">' +
            '<span class="shengshi-yong-label shengshi-yong-label--ji">忌神</span>' +
            '<div class="tag-row">' + jiHtml + '</div>' +
            '<p class="shengshi-yong-hint">' + (ss.jiCats || []).join(" · ") + '</p>' +
          '</div>' +
        '</div>' +
        '<ul class="shengshi-lines">' + ss.lines.map(function (t) { return "<li>" + t + "</li>"; }).join("") + '</ul>' +
      '</div>';
  }

  function renderDaYun(result) {
    var yun = result.yun;
    var wrap = $("#dayun-body");
    if (!wrap) return;
    if (!yun || !yun.daYun.length) {
      wrap.innerHTML = "";
      return;
    }

    var startTip = "出生后 " + yun.startYear + "年" + yun.startMonth + "月" + yun.startDay + "日起运（" + (yun.isForward ? "顺排" : "逆排") + "）";
    var curLn = yun.liuNianCurrent;
    var curTip = curLn
      ? (' · 今年 ' + curLn.year + ' ' + curLn.ganzhi + (curLn.desc ? '：' + curLn.desc : ''))
      : "";

    var h =
      '<p class="yun-start">' + startTip + curTip + '</p>' +
      '<div class="dayun-table-wrap"><table class="dayun-table"><tbody>';

    yun.daYun.forEach(function (dy) {
      if (!dy.ganzhi && dy.index === 0) {
        h += '<tr class="dayun-before">' +
          '<td class="dayun-age">' + dy.startAge + '–' + dy.endAge + '岁</td>' +
          '<td class="dayun-year">' + dy.startYear + '–' + dy.endYear + '</td>' +
          '<td class="dayun-gz">起运前</td>' +
          '<td class="dayun-liunian"><span class="dayun-muted">童限 · 尚未行大运</span></td></tr>';
        return;
      }
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

    renderGeju(result);

    var cg = result.chenggu;
    $("#chenggu-body").innerHTML =
      '<p class="chenggu-total">总骨重：<strong>' + cg.total + '</strong></p>' +
      '<ul class="chenggu-parts">' + cg.parts.map(function (p) { return "<li>" + p.label + " " + p.value + (p.gz ? "（" + p.gz + "）" : "") + (p.note ? " · " + p.note : "") + "</li>"; }).join("") + '</ul>' +
      '<p class="chenggu-poem">' + cg.poem + '</p>';

    $("#extra-meta").innerHTML =
      '<span>胎元 ' + result.meta.taiyuan + '</span>' +
      '<span>命宫 ' + result.meta.minggong + '</span>' +
      '<span>身宫 ' + result.meta.shengong + '</span>';
  }

  function renderGeju(result) {
    var panel = $("#geju-panel");
    if (!panel) return;
    var g = result.geju;
    if (!g) {
      panel.innerHTML = "";
      return;
    }

    // 新结构：sections；旧结构：lines 数组
    if (g.sections && g.sections.length) {
      var wx = g.wuxing || {};
      var wxAttr = (g.dayGan || "") + (g.dayWx || "");
      var wxHead = "";
      if (wxAttr || (wx.items && wx.items.length)) {
        var chipHtml = (wx.items || []).map(function (it) {
          var cls = it.has ? "wx-chip wx-chip--has" : "wx-chip wx-chip--miss";
          return '<span class="' + cls + '">' + it.wx + '<em>' + it.flag + '</em></span>';
        }).join("");
        wxHead =
          '<div class="geju-wx-block">' +
            '<div class="geju-wx">' +
              '<span class="geju-wx-label">命主五行</span>' +
              (wxAttr ? '<span class="geju-wx-value">' + wxAttr + '</span>' : '') +
              (wx.attrText ? '<span class="geju-wx-attr">属性：' + wx.attrText + '</span>' : '') +
            '</div>' +
            (chipHtml ? '<div class="wx-chip-row">' + chipHtml + '</div>' : '') +
            (wx.summary ? '<p class="geju-wx-summary">' + wx.summary + '</p>' : '') +
            '<p class="geju-wx-hint">数字为天干与地支藏干出现次数；「缺」表示盘中未出现该五行。</p>' +
          '</div>';
      }
      panel.innerHTML =
        '<div class="geju-head">' + wxHead + '</div>' +
        g.sections.map(function (sec) {
          // 八字格局：具体命格 + 有利 / 不利
          if (sec.title === "八字格局" && g.geDetail) {
            var gd = g.geDetail;
            return (
              '<div class="geju-sec">' +
                '<h4 class="geju-sec-title">' + sec.title + '</h4>' +
                '<div class="sha-card">' +
                  '<div class="sha-card__name">' +
                    '<span class="geju-name geju-name--inline">' + (g.name || "命格") + '</span>' +
                  '</div>' +
                  (g.mean ? '<p class="geju-mean geju-mean--in">' + g.mean + '</p>' : '') +
                  gd.howDetail.map(function (t) { return '<p>' + t + '</p>'; }).join("") +
                '</div>' +
                '<div class="sha-card sha-card--xi">' +
                  '<div class="sha-card__name">有利因素 <span class="sha-badge sha-badge--xi">利</span></div>' +
                  '<ul class="geju-factor-list">' +
                    gd.pros.map(function (t) { return '<li>' + t + '</li>'; }).join("") +
                  '</ul>' +
                '</div>' +
                '<div class="sha-card sha-card--ji">' +
                  '<div class="sha-card__name">不利因素 <span class="sha-badge sha-badge--ji">慎</span></div>' +
                  '<ul class="geju-factor-list">' +
                    gd.cons.map(function (t) { return '<li>' + t + '</li>'; }).join("") +
                  '</ul>' +
                '</div>' +
              '</div>'
            );
          }

          // 适宜参考：行业 / 人 / 颜色 / 数字 / 星座
          if (sec.title === "适宜参考" && g.yiYi && g.yiYi.rows) {
            return (
              '<div class="geju-sec">' +
                '<h4 class="geju-sec-title">' + sec.title + '</h4>' +
                '<p class="geju-sha-lead">按格局与身势喜用综合参考；属文化学习，非择偶或就业硬标准。</p>' +
                g.yiYi.rows.map(function (row) {
                  if (row.plain) {
                    return (
                      '<div class="yiyi-row">' +
                        '<div class="yiyi-label">' + row.label + '</div>' +
                        '<ul class="geju-factor-list">' +
                          row.items.map(function (t) { return '<li>' + t + '</li>'; }).join("") +
                        '</ul>' +
                      '</div>'
                    );
                  }
                  return (
                    '<div class="yiyi-row">' +
                      '<div class="yiyi-label">' + row.label + '</div>' +
                      '<div class="tag-row">' +
                        row.items.map(function (t) {
                          return '<span class="tag tag--xi">' + t + '</span>';
                        }).join("") +
                      '</div>' +
                    '</div>'
                  );
                }).join("") +
                '<p class="shengshi-yong-hint">大运流年会微调喜忌，不必刻板对号入座。</p>' +
              '</div>'
            );
          }

          var cardItems = null;
          var lead = "";
          var foot = "";
          if (sec.title === "十神情况" && g.shishenDetail && g.shishenDetail.items && g.shishenDetail.items.length) {
            cardItems = g.shishenDetail.items;
            lead = "每个十神看三句：怎么来的 → 影响什么 → 怎么用/怎么化。标题旁「喜/忌」按当前身势标注。";
            foot = "喜忌随身势而变；合格局、大运看，不宜单断吉凶。";
          } else if (sec.title === "神煞情况" && g.shensha && g.shensha.items && g.shensha.items.length) {
            cardItems = g.shensha.items;
            lead = "来源写「怎么产生」，再看影响。吉神只写用法，凶神只写化解；平神用法与化解分列。";
            foot = "神煞是辅助标签，以身势、格局、大运为主，不必单断吉凶。";
          }
          if (cardItems) {
            var isSha = sec.title === "神煞情况";
            return (
              '<div class="geju-sec">' +
                '<h4 class="geju-sec-title">' + sec.title + '</h4>' +
                '<p class="geju-sha-lead">' + lead + '</p>' +
                cardItems.map(function (it) {
                  var badge = "";
                  var cardMod = "";
                  if (it.flag) {
                    var tone = (it.flag === "喜" || it.flag === "吉")
                      ? "xi"
                      : ((it.flag === "忌" || it.flag === "凶") ? "ji" : "ping");
                    badge = '<span class="sha-badge sha-badge--' + tone + '">' + it.flag + '</span>';
                    if (it.wx) badge += '<span class="sha-badge-wx">' + it.wx + '</span>';
                    cardMod = " sha-card--" + tone;
                  }
                  var actionHtml = "";
                  if (isSha) {
                    if (it.flag === "平") {
                      if (it.usage) actionHtml += '<p><b>用法</b>：' + it.usage + '</p>';
                      if (it.resolve) actionHtml += '<p><b>化解</b>：' + it.resolve + '</p>';
                    } else if (it.action) {
                      actionHtml = '<p><b>' + it.actionLabel + '</b>：' + it.action + '</p>';
                    }
                  } else {
                    actionHtml = '<p><b>化解/用法</b>：' + it.resolve + '</p>';
                  }
                  return (
                    '<div class="sha-card' + cardMod + '">' +
                      '<div class="sha-card__name">' + it.name + badge + '</div>' +
                      (it.flagNote ? '<p class="sha-card__flag">' + it.flagNote + '</p>' : '') +
                      '<p><b>来源</b>：' + it.from + '</p>' +
                      '<p><b>影响</b>：' + it.effect + '</p>' +
                      actionHtml +
                    '</div>'
                  );
                }).join("") +
                '<p class="shengshi-yong-hint">' + foot + '</p>' +
              '</div>'
            );
          }
          return (
            '<div class="geju-sec">' +
              '<h4 class="geju-sec-title">' + sec.title + '</h4>' +
              '<ul class="detail-list detail-list--plain">' +
                sec.body.map(function (t) { return "<li>" + t + "</li>"; }).join("") +
              '</ul>' +
            '</div>'
          );
        }).join("");
      return;
    }

    var lines = Array.isArray(g) ? g : (g.lines || []);
    panel.innerHTML = '<ul class="detail-list detail-list--plain">' +
      lines.map(function (t) { return "<li>" + t + "</li>"; }).join("") +
      '</ul>';
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

  function bindAnalysisBlocks() {
    var stack = $("#analysis-stack");
    if (!stack || stack._bound) return;
    stack._bound = true;
    stack.addEventListener("click", function (e) {
      var head = e.target.closest(".analysis-block__head");
      if (!head || !stack.contains(head)) return;
      var block = head.closest(".analysis-block");
      if (!block) return;
      var open = block.getAttribute("data-open") !== "false";
      var next = !open;
      block.setAttribute("data-open", next ? "true" : "false");
      head.setAttribute("aria-expanded", next ? "true" : "false");
    });
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
      renderShengshi(result);
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
    bindAnalysisBlocks();

    $("#btn-paipan").addEventListener("click", doPaipan);

    ["birth-year", "birth-month", "birth-day", "birth-hour", "birth-minute"].forEach(function (id) {
      $("#" + id).addEventListener("input", function () {
        readInputs();
      });
      $("#" + id).addEventListener("change", function () {
        readInputs();
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
