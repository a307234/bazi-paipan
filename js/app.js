(function () {
  var $ = function (sel, el) { return (el || document).querySelector(sel); };
  var $$ = function (sel, el) { return [].slice.call((el || document).querySelectorAll(sel)); };

  var BIRTH_STORAGE_KEY = "bazi-shengchen";
  var CASE_STORAGE_KEY = "bazi-mianzhen-cases";

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
    lunarLeap: false,
    birthplace: "长沙",
    birthplaceData: null,
    cityMatched: true,
    useTrueSolar: true,
    result: null,
    currentCaseId: null,
    relTopic: "综合",
    notesBaseline: "",
    _syncingQuestion: false,
  };

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function saveBirthPrefs() {
    try {
      var payload = {
        birth: state.birth,
        calendarType: state.calendarType,
        lunarLeap: !!state.lunarLeap,
        birthplace: state.birthplace,
        useTrueSolar: state.useTrueSolar
      };
      localStorage.setItem(BIRTH_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) { /* ignore quota / private mode */ }
  }

  function loadBirthPrefs() {
    try {
      var raw = localStorage.getItem(BIRTH_STORAGE_KEY);
      if (!raw) return false;
      var data = JSON.parse(raw);
      if (!data || !data.birth) return false;
      var b = data.birth;
      if (!(b.year >= 1900 && b.year <= 2100)) return false;
      if (!(b.month >= 1 && b.month <= 12)) return false;
      if (!(b.day >= 1 && b.day <= 31)) return false;
      state.birth = {
        year: +b.year,
        month: +b.month,
        day: +b.day,
        hour: Math.min(23, Math.max(0, +b.hour || 0)),
        minute: Math.min(59, Math.max(0, +b.minute || 0)),
        gender: b.gender === 0 || b.gender === "0" ? 0 : 1
      };
      if (data.calendarType === "lunar" || data.calendarType === "solar") {
        state.calendarType = data.calendarType;
      }
      if (typeof data.birthplace === "string" && data.birthplace.trim()) {
        state.birthplace = data.birthplace.trim();
      }
      if (typeof data.useTrueSolar === "boolean") {
        state.useTrueSolar = data.useTrueSolar;
      }
      if (typeof data.lunarLeap === "boolean") {
        state.lunarLeap = data.lunarLeap;
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  function syncLeapMonthUI() {
    var wrap = $("#leap-month-wrap");
    var chk = $("#lunar-leap");
    if (!wrap || !chk) return;
    var isLunar = state.calendarType === "lunar";
    var leapOfYear = 0;
    if (isLunar && window.BaziCalendar && BaziCalendar.leapMonthOfYear) {
      leapOfYear = BaziCalendar.leapMonthOfYear(state.birth.year) || 0;
    }
    var canLeap = isLunar && leapOfYear > 0 && leapOfYear === state.birth.month;
    wrap.hidden = !isLunar;
    chk.disabled = !canLeap;
    if (!canLeap) {
      state.lunarLeap = false;
      chk.checked = false;
    } else {
      chk.checked = !!state.lunarLeap;
    }
    wrap.title = canLeap
      ? ("本年有闰" + leapOfYear + "月，勾选表示生于闰月")
      : (isLunar ? (leapOfYear ? ("本年闰" + leapOfYear + "月，请先把月份改为" + leapOfYear) : "本年无闰月") : "");
  }

  function updateCityHint() {
    var hint = $("#city-hint");
    var ts = $("#use-true-solar");
    var name = state.birthplace || "";
    var exact = BaziCities.findExact ? BaziCities.findExact(name) : null;
    var matches = BaziCities.findMatches ? BaziCities.findMatches(name, 5) : [];
    var city = exact || (matches.length === 1 ? matches[0] : null);

    if (city) {
      state.cityMatched = true;
      state.birthplaceData = {
        name: city.n, lng: city.lng, lat: city.lat, n: city.n, p: city.p
      };
      if (hint) {
        hint.textContent = city.p ? (city.n + " · " + city.p) : city.n;
        hint.className = "field-hint is-ok";
      }
      if (ts) ts.disabled = false;
      return true;
    }

    state.cityMatched = false;
    state.birthplaceData = null;
    if (state.useTrueSolar) {
      state.useTrueSolar = false;
      if (ts) ts.checked = false;
    }
    if (ts) ts.disabled = true;

    if (hint) {
      if (!name) {
        hint.textContent = "请选择出生城市（真太阳时需要）";
      } else if (matches.length > 1) {
        hint.textContent = "多个匹配：" + matches.map(function (c) { return c.n; }).join("、") + "，请选完整城市名";
      } else {
        hint.textContent = "未匹配城市，已关闭真太阳时（避免错用经度）";
      }
      hint.className = "field-hint is-warn";
    }
    return false;
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
    if ($("#lunar-leap")) $("#lunar-leap").checked = !!state.lunarLeap;
    syncLeapMonthUI();
    updateCityHint();
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
    state.birthplace = $("#birthplace").value.trim() || "";
    state.lunarLeap = !!( $("#lunar-leap") && $("#lunar-leap").checked );
    if (state.calendarType !== "lunar") state.lunarLeap = false;
    syncLeapMonthUI();
    updateCityHint();
    // 真太阳时：仅城市匹配后允许
    state.useTrueSolar = !!(state.cityMatched && $("#use-true-solar").checked);
    if ($("#use-true-solar")) $("#use-true-solar").checked = state.useTrueSolar;
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
      { key: "deLing", label: "得令", gloss: "月令帮身" },
      { key: "deDi", label: "得地", gloss: "坐下有根" },
      { key: "deShi", label: "得势", gloss: "比印透干" },
      { key: "deSheng", label: "得生", gloss: "印星生助" }
    ];
    var flagHtml = flagMap.map(function (f) {
      var on = ss.flags && ss.flags[f.key];
      return '<span class="shengshi-flag' + (on ? " is-on" : "") + '" title="' + f.gloss + '">' +
        f.label + "<small>" + f.gloss + "</small>" + (on ? " ✓" : " ✗") + "</span>";
    }).join("");

    var factorNameGloss = { 得令: "月令帮身", 得地: "坐下有根", 得势: "比印透干", 得生: "印星生助" };
    var factorHtml = (ss.factors || []).map(function (f) {
      var wPct = Math.round(f.weight * 100);
      var s = Math.round(f.score);
      var gloss = factorNameGloss[f.name] || "";
      return (
        '<div class="factor-row" title="' + (f.detail || "").replace(/"/g, "&quot;") + '">' +
          '<div class="factor-head">' +
            '<span class="factor-name">' + f.name +
              (gloss ? '<small class="factor-gloss">' + gloss + "</small>" : "") +
            "</span>" +
            '<span class="factor-meta">' + s + "分 · 权" + wPct + "%</span>" +
          "</div>" +
          '<div class="wx-bar-track"><div class="wx-bar-fill" style="width:' + s + '%;background:rgba(var(--accent-rgb),0.85)"></div></div>' +
        "</div>"
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

    var conclude = (ss.lines && ss.lines.length) ? ss.lines[ss.lines.length - 1] : "";
    wrap.innerHTML =
      '<div class="shengshi-card">' +
        '<div class="shengshi-top">' +
          '<span class="shengshi-badge ' + levelClass + '">' + ss.level + '</span>' +
          (ss.total != null ? '<span class="shengshi-total">' + ss.total + " 分</span>" : "") +
          '<div class="shengshi-flags">' + flagHtml + "</div>" +
        "</div>" +
        '<p class="shengshi-summary">日主 <strong style="color:' + ganColor(ss.dayGan) + '">' +
          ss.dayGan + ss.dayWx + "</strong>" +
          (conclude ? " · " + conclude : "") +
        "</p>" +
        '<div class="factor-bars">' + factorHtml + "</div>" +
        '<h4 class="shengshi-sub">五行力量</h4>' +
        '<div class="wx-bars">' + barHtml + "</div>" +
        '<div class="shengshi-yong">' +
          '<div class="shengshi-yong-col">' +
            '<span class="shengshi-yong-label">喜 <small>宜用</small></span>' +
            '<div class="tag-row">' + xiHtml + "</div>" +
            '<p class="shengshi-yong-hint">' + (ss.xiCats || []).join(" · ") + "</p>" +
          "</div>" +
          '<div class="shengshi-yong-col">' +
            '<span class="shengshi-yong-label shengshi-yong-label--ji">忌 <small>宜避</small></span>' +
            '<div class="tag-row">' + jiHtml + "</div>" +
            '<p class="shengshi-yong-hint">' + (ss.jiCats || []).join(" · ") + "</p>" +
          "</div>" +
        "</div>" +
      "</div>";
  }

  function wxSpans(ganWx, zhiWx) {
    function one(w) {
      if (!w) return "";
      return '<em class="yun-wx" style="color:' + (WUXING_COLOR[w] || "inherit") + '">' + w + '</em>';
    }
    return one(ganWx) + one(zhiWx);
  }

  /** 按身势喜忌，判流年/月/日干支五行吉凶（天干权重大于地支） */
  function judgeYunLuck(ganWx, zhiWx, shengshi) {
    var xi = (shengshi && shengshi.xiYong) || [];
    var ji = (shengshi && shengshi.jiShen) || [];
    if (!xi.length && !ji.length) {
      return { flag: "平", score: 0, tip: "暂无喜忌，作中性看" };
    }
    var score = 0;
    if (ganWx && xi.indexOf(ganWx) >= 0) score += 2;
    if (zhiWx && xi.indexOf(zhiWx) >= 0) score += 1;
    if (ganWx && ji.indexOf(ganWx) >= 0) score -= 2;
    if (zhiWx && ji.indexOf(zhiWx) >= 0) score -= 1;

    var flag = score > 0 ? "吉" : (score < 0 ? "凶" : "平");
    var tip = "";
    if (flag === "吉") tip = "喜用较多，相对有利";
    else if (flag === "凶") tip = "忌神较多，宜谨慎";
    else tip = "喜忌参半或不明，宜平稳";
    return { flag: flag, score: score, tip: tip };
  }

  function luckClass(luck) {
    if (!luck || !luck.flag) return "";
    if (luck.flag === "吉") return " is-luck-xi";
    if (luck.flag === "凶") return " is-luck-ji";
    return " is-luck-ping";
  }

  function natalParts(result) {
    var gans = result.pillars.map(function (p) { return p.gan; });
    var zhis = result.pillars.map(function (p) { return p.zhi; });
    return { gans: gans, zhis: zhis };
  }

  /** 身势喜忌以身势块为准，其它区块不再复读关联条 */
  function renderShengshiLink() {
    return "";
  }

  var REL_KIND_GLOSS = {
    冲: "变动", 干冲: "变动", 合: "牵绊助力", 干合: "牵绊助力",
    刑: "别扭碰壁", 害: "暗损误会", 太岁: "本命气动", 伏吟: "旧题重来",
    半合: "聚气", 三合: "成局聚气", 生: "滋养", 克: "压制"
  };

  function relationTips(result, gan, zhi, label) {
    if (!window.Relations || !Relations.vsExternalCards || !gan) return [];
    var n = natalParts(result);
    var layer = (label && label.indexOf("流年") === 0) ? "liunian" : "dayun";
    return Relations.vsExternalCards(n.gans, n.zhis, gan, zhi, layer, label, result.shengshi).map(function (c) {
      return c.title + "：" + c.plain;
    });
  }

  function getRelTopic() {
    return (state.relTopic && Relations && Relations.TOPICS && Relations.TOPICS.indexOf(state.relTopic) >= 0)
      ? state.relTopic
      : "综合";
  }

  function tipForCard(card, topic) {
    var tips = card.tips || {};
    return tips[topic] || tips["综合"] || card.plain || "";
  }

  function renderRelCards(cards, topic, emptyText) {
    if (!cards || !cards.length) {
      return '<p class="rel-empty">' + (emptyText || "暂无显著关系") + "</p>";
    }
    var main = cards.filter(function (c) { return !c.minor; });
    var minor = cards.filter(function (c) { return c.minor; });
    var h = '<div class="rel-cards">';
    main.forEach(function (c) {
      var tip = tipForCard(c, topic);
      var gloss = REL_KIND_GLOSS[c.kind] || "";
      var ssBadge = "";
      if (c.shengshiFlag && c.shengshiFlag !== "平") {
        var ssTone = c.shengshiFlag === "喜" ? "xi" : (c.shengshiFlag === "忌" ? "ji" : "ping");
        ssBadge = '<span class="rel-card__ss sha-badge sha-badge--' + ssTone + '">身势·' + escapeHtml(c.shengshiFlag) + "</span>";
      }
      var note = c.shengshiNote || "";
      var showPlain = c.plain && tip.indexOf(c.plain) < 0;
      h += '<article class="rel-card tone-' + (c.tone || "平") + '">' +
        '<header class="rel-card__head">' +
          '<span class="rel-card__kind">' + escapeHtml(c.kind) +
            (gloss ? '<small>' + gloss + "</small>" : "") +
          "</span>" +
          '<span class="rel-card__tone">' + escapeHtml(c.tone || "平") + "</span>" +
          ssBadge +
        "</header>" +
        '<h5 class="rel-card__title">' + escapeHtml(c.title) + "</h5>" +
        '<p class="rel-card__involve">' + escapeHtml(c.involve || "") + "</p>" +
        (showPlain ? '<p class="rel-card__plain">' + escapeHtml(c.plain) + "</p>" : "") +
        (note && c.shengshiFlag && c.shengshiFlag !== "平"
          ? '<p class="rel-card__ss-note">' + escapeHtml(note) + "</p>"
          : "") +
        '<div class="rel-card__tip"><span class="rel-card__tip-label">问事 · ' + escapeHtml(topic) + "</span>" +
          "<p>" + escapeHtml(tip) + "</p></div>" +
        "</article>";
    });
    h += "</div>";
    if (minor.length) {
      h += '<details class="rel-minor"><summary>天干生克等次要关系（' + minor.length + "）</summary><div class=\"rel-cards rel-cards--minor\">";
      minor.forEach(function (c) {
        var tip = tipForCard(c, topic);
        h += '<article class="rel-card tone-' + (c.tone || "平") + ' is-minor">' +
          '<header class="rel-card__head"><span class="rel-card__kind">' + escapeHtml(c.kind) + "</span></header>" +
          '<h5 class="rel-card__title">' + escapeHtml(c.title) + "</h5>" +
          '<p class="rel-card__plain">' + escapeHtml(c.plain || "") + "</p>" +
          '<div class="rel-card__tip"><span class="rel-card__tip-label">问事 · ' + escapeHtml(topic) + "</span>" +
            "<p>" + escapeHtml(tip) + "</p></div></article>";
      });
      h += "</div></details>";
    }
    return h;
  }

  function renderRelations(result) {
    var wrap = $("#relations-body");
    if (!wrap) return;
    if (!window.Relations || !Relations.fromPillars || !Relations.vsExternalCards) {
      wrap.innerHTML = '<p class="rel-empty">刑冲合害模块未加载</p>';
      return;
    }
    if (!state.relTopic) state.relTopic = "综合";
    var topic = getRelTopic();
    var topics = Relations.TOPICS || ["综合", "事业", "感情", "财运", "健康"];
    var pack = Relations.fromPillars(result.pillars, result.shengshi);
    var n = natalParts(result);
    var ss = result.shengshi;

    var yun = result.yun || {};
    var view = state.dayunView || {};
    var dy = null;
    if (yun.daYun && yun.daYun.length) {
      var idx = view.daYunIndex != null ? view.daYunIndex : yun.currentDaYunIndex;
      dy = yun.daYun[idx] || yun.daYun.filter(function (d) { return d.isCurrent; })[0];
    }
    var yearItem = null;
    if (dy && dy.liuNian) {
      var y = view.year;
      dy.liuNian.forEach(function (ln) {
        if (ln.year === y) yearItem = ln;
      });
      if (!yearItem) yearItem = dy.liuNian.filter(function (ln) { return ln.isCurrent; })[0];
    }

    var h = renderShengshiLink(ss) +
      '<div class="rel-toolbar">' +
      '<span class="rel-toolbar__label">问事</span>' +
      '<div class="rel-topic-row">';
    topics.forEach(function (t) {
      h += '<button type="button" class="rel-topic-chip' + (t === topic ? " is-on" : "") + '" data-rel-topic="' + t + '">' + t + "</button>";
    });
    h += "</div></div>";

    // 当前运优先
    var yunCards = [];
    if (dy && dy.ganzhi) {
      yunCards = yunCards.concat(Relations.vsExternalCards(n.gans, n.zhis, dy.ganzhi.charAt(0), dy.ganzhi.charAt(1), "dayun", "大运", ss));
    }
    if (yearItem && yearItem.ganzhi) {
      yunCards = yunCards.concat(Relations.vsExternalCards(n.gans, n.zhis, yearItem.ganzhi.charAt(0), yearItem.ganzhi.charAt(1), "liunian", "流年", ss));
    }
    yunCards.sort(function (a, b) { return (b.severity || 0) - (a.severity || 0); });

    var yunTitle = "当前运";
    if (dy && dy.ganzhi) yunTitle += " · 大运" + dy.ganzhi;
    if (yearItem && yearItem.ganzhi) yunTitle += " · 流年" + yearItem.year + yearItem.ganzhi;

    h += '<section class="rel-panel rel-panel--yun">' +
      '<h4 class="rel-sec__title">' + escapeHtml(yunTitle) + "</h4>" +
      renderRelCards(yunCards, topic, "此步大运与流年相对平和") +
      "</section>";

    var natalMain = (pack.natalCards || []).filter(function (c) { return !c.minor; });
    var natalOpen = state.relNatalOpen ? " open" : "";
    h += '<details class="rel-panel rel-panel--natal"' + natalOpen + ' data-rel-natal>' +
      '<summary class="rel-sec__title">原局底色（' + natalMain.length + "）</summary>" +
      renderRelCards(pack.natalCards || [], topic, "原局刑冲合害不显著") +
      "</details>";

    wrap.innerHTML = h;
    bindRelationsUI(result);
  }

  function bindRelationsUI(result) {
    var wrap = $("#relations-body");
    if (!wrap || wrap._relBound) return;
    wrap._relBound = true;
    wrap.addEventListener("click", function (e) {
      var chip = e.target.closest("[data-rel-topic]");
      if (!chip || !wrap.contains(chip)) return;
      state.relTopic = chip.getAttribute("data-rel-topic") || "综合";
      if ($("#case-question") && !state._syncingQuestion) {
        var topics = (Relations && Relations.TOPICS) || [];
        var curQ = ($("#case-question").value || "").trim();
        // 问事为空，或当前已是标准标签时，跟随刑冲问事（含「综合」）
        if (!curQ || topics.indexOf(curQ) >= 0) {
          state._syncingQuestion = true;
          $("#case-question").value = state.relTopic;
          state._syncingQuestion = false;
        }
      }
      if (state.result) renderRelations(state.result);
    });
    wrap.addEventListener("toggle", function (e) {
      var det = e.target;
      if (!det || !det.getAttribute || !det.hasAttribute("data-rel-natal")) return;
      state.relNatalOpen = !!det.open;
    }, true);
  }

  function renderDaYun(result) {
    var yun = result.yun;
    var wrap = $("#dayun-body");
    if (!wrap) return;
    if (!yun || !yun.daYun.length) {
      wrap.innerHTML = "";
      renderRelations(result);
      return;
    }

    var ss = result.shengshi || null;
    var today = yun.today || {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate()
    };

    var focusIdx = yun.currentDaYunIndex;
    if (focusIdx == null || focusIdx < 0) {
      focusIdx = 0;
      yun.daYun.forEach(function (d, i) { if (d.isCurrent) focusIdx = i; });
    }

    state.dayunView = state.dayunView || {};
    var view = state.dayunView;
    if (view.daYunIndex == null) view.daYunIndex = focusIdx;
    if (view.year == null) view.year = today.year;
    if (view.month == null) view.month = today.month;
    if (view.monthOpen == null) view.monthOpen = false;
    if (view.dayOpen == null) view.dayOpen = false;

    var focusDy = yun.daYun[view.daYunIndex] || yun.daYun[focusIdx] || yun.daYun[0];
    var years = (focusDy.liuNian || []).filter(function (ln) { return !!ln.ganzhi; });
    if (!years.length) years = focusDy.liuNian || [];

    var selYear = view.year;
    var yearItem = null;
    years.forEach(function (ln) {
      if (ln.year === selYear) yearItem = ln;
    });
    if (!yearItem && years.length) {
      yearItem = years.filter(function (ln) { return ln.isCurrent; })[0] || years[0];
      selYear = yearItem.year;
      view.year = selYear;
    }

    var months = (yearItem && yearItem.liuYue) ? yearItem.liuYue : [];
    var selMonth = view.month;
    if (selMonth < 1 || selMonth > 12) selMonth = today.month;
    view.month = selMonth;

    var days = [];
    if (yearItem && yun.liuRiCurrent && selYear === today.year && selMonth === today.month) {
      days = yun.liuRiCurrent;
    } else if (window.BaziEngine && BaziEngine.buildLiuRi) {
      days = BaziEngine.buildLiuRi(selYear, selMonth);
    }

    var startTip = "起运 " + yun.startYear + "年" + yun.startMonth + "月" + yun.startDay + "日（" + (yun.isForward ? "顺" : "逆") + "）";

    var h = renderShengshiLink(ss) +
      '<p class="yun-start">' + startTip + "</p>";

    h += '<div class="yun-dy-row">';
    yun.daYun.forEach(function (dy, i) {
      if (!dy.ganzhi && dy.index === 0) {
        h += '<button type="button" class="yun-dy-chip' + (view.daYunIndex === i ? ' is-on' : '') + '" data-dy="' + i + '">' +
          '<span class="yun-dy-chip__gz">起运前</span>' +
          '<span class="yun-dy-chip__meta">' + dy.startAge + '–' + dy.endAge + '岁</span></button>';
        return;
      }
      if (!dy.ganzhi) return;
      var dyLuck = judgeYunLuck(dy.ganWx, dy.zhiWx, ss);
      h += '<button type="button" class="yun-dy-chip' + (view.daYunIndex === i ? ' is-on' : '') + (dy.isCurrent ? ' is-now' : '') + luckClass(dyLuck) + '" data-dy="' + i + '" title="' + (dyLuck.tip || "") + '">' +
        '<span class="yun-dy-chip__gz">' + dy.ganzhi + wxSpans(dy.ganWx, dy.zhiWx) + '</span>' +
        '<span class="yun-dy-chip__meta">' + dy.startAge + '–' + dy.endAge + '岁</span></button>';
    });
    h += '</div>';

    if (focusDy.ganzhi) {
      var focusLuck = judgeYunLuck(focusDy.ganWx, focusDy.zhiWx, ss);
      var focusTips = relationTips(result, focusDy.ganzhi.charAt(0), focusDy.ganzhi.charAt(1), "大运");
      var focusTipText = ([focusLuck.tip].concat(focusTips.slice(0, 2))).filter(Boolean).join("；");
      h += '<div class="yun-focus' + luckClass(focusLuck) + '" title="' + focusTipText.replace(/"/g, "&quot;") + '">' +
        '<div class="yun-focus__label">' + (focusDy.isCurrent ? "当前大运" : "查看大运") + '</div>' +
        '<div class="yun-focus__main">' +
          '<strong>' + focusDy.ganzhi + '</strong>' +
          wxSpans(focusDy.ganWx, focusDy.zhiWx) +
          '<span class="yun-focus__range">' + focusDy.startAge + '–' + focusDy.endAge + '岁 · ' +
            focusDy.startYear + '–' + focusDy.endYear + '</span>' +
        '</div>';
      if (focusTips.length) {
        h += '<ul class="yun-focus__rel">' + focusTips.slice(0, 3).map(function (t) {
          var short = t.split("：")[0] || t;
          return "<li>" + short + "</li>";
        }).join("") + (focusTips.length > 3 ? "<li>…详见「刑冲合害」</li>" : "") + "</ul>";
      }
      h += "</div>";
    } else {
      h += '<div class="yun-focus"><div class="yun-focus__label">起运前童限</div>' +
        '<div class="yun-focus__main"><span class="yun-focus__range">' +
        focusDy.startAge + '–' + focusDy.endAge + '岁 · ' + focusDy.startYear + '–' + focusDy.endYear +
        '</span></div></div>';
    }

    h += '<div class="yun-sec"><div class="yun-sec__title">流年</div><div class="yun-grid yun-grid--year">';
    years.forEach(function (ln) {
      if (!ln.ganzhi) {
        h += '<span class="yun-cell yun-muted">童限</span>';
        return;
      }
      var luck = judgeYunLuck(ln.ganWx, ln.zhiWx, ss);
      var on = ln.year === selYear ? " is-on" : "";
      var nowCls = ln.isCurrent ? " is-now" : "";
      var lnTips = relationTips(result, ln.ganzhi.charAt(0), ln.ganzhi.charAt(1), "流年");
      var tip = ([luck.tip].concat(lnTips.slice(0, 1))).filter(Boolean).join("；");
      h += '<button type="button" class="yun-cell' + on + nowCls + luckClass(luck) + '" data-year="' + ln.year + '" title="' + tip.replace(/"/g, "&quot;") + '">' +
        '<span class="yun-cell__top">' + ln.year + '<small>' + ln.age + '岁</small></span>' +
        '<span class="yun-cell__gz">' + ln.ganzhi + '</span>' +
        '<span class="yun-cell__wx">' + wxSpans(ln.ganWx, ln.zhiWx) + '</span></button>';
    });
    h += '</div></div>';

    if (yearItem && yearItem.ganzhi) {
      var yearTips = relationTips(result, yearItem.ganzhi.charAt(0), yearItem.ganzhi.charAt(1), "流年");
      if (yearTips.length) {
        h += '<div class="yun-sec yun-sec--rel"><div class="yun-sec__title">流年要点 · ' +
          selYear + " " + yearItem.ganzhi + "</div>" +
          '<ul class="yun-focus__rel">' + yearTips.slice(0, 3).map(function (t) {
            return "<li>" + (t.split("：")[0] || t) + "</li>";
          }).join("") + '<li class="yun-focus__more">明细见「刑冲合害」</li></ul></div>';
      }
    }

    if (yearItem && months.length) {
      h += '<details class="yun-details"' + (view.monthOpen ? " open" : "") + ' data-yun-details="month">' +
        '<summary class="yun-sec__title">流月 · ' + selYear + "年 " + yearItem.ganzhi +
        wxSpans(yearItem.ganWx, yearItem.zhiWx) + "</summary>" +
        '<div class="yun-grid yun-grid--month">';
      months.forEach(function (m) {
        var luck = judgeYunLuck(m.ganWx, m.zhiWx, ss);
        var on = m.month === selMonth ? " is-on" : "";
        var nowCls = (selYear === today.year && m.month === today.month) ? " is-now" : "";
        h += '<button type="button" class="yun-cell' + on + nowCls + luckClass(luck) + '" data-month="' + m.month + '" title="' + (luck.tip || "") + '">' +
          '<span class="yun-cell__top">' + (m.name || (m.month + "月")) + '</span>' +
          '<span class="yun-cell__gz">' + m.ganzhi + '</span>' +
          '<span class="yun-cell__wx">' + wxSpans(m.ganWx, m.zhiWx) + '</span></button>';
      });
      h += '</div></details>';
    }

    if (days.length) {
      h += '<details class="yun-details"' + (view.dayOpen ? " open" : "") + ' data-yun-details="day">' +
        '<summary class="yun-sec__title">流日 · 公历' + selYear + '年' + selMonth + '月</summary>' +
        '<div class="yun-grid yun-grid--day">';
      days.forEach(function (d) {
        var luck = judgeYunLuck(d.ganWx, d.zhiWx, ss);
        var nowCls = (d.year === today.year && d.month === today.month && d.day === today.day) ? " is-now" : "";
        h += '<div class="yun-cell yun-cell--day' + nowCls + luckClass(luck) + '" title="' + (luck.tip || "") + '">' +
          '<span class="yun-cell__top">' + d.day + '日</span>' +
          '<span class="yun-cell__gz">' + d.ganzhi + '</span>' +
          '<span class="yun-cell__wx">' + wxSpans(d.ganWx, d.zhiWx) + '</span></div>';
      });
      h += '</div></details>';
    }

    wrap.innerHTML = h;
    bindDaYunExplore(result);
    renderRelations(result);
  }

  function bindDaYunExplore(result) {
    var wrap = $("#dayun-body");
    if (!wrap || wrap._yunBound) return;
    wrap._yunBound = true;
    wrap.addEventListener("click", function (e) {
      var dyBtn = e.target.closest("[data-dy]");
      var yBtn = e.target.closest("[data-year]");
      var mBtn = e.target.closest("[data-month]");
      if (!dyBtn && !yBtn && !mBtn) return;
      if (!state.result || !state.result.yun) return;
      state.dayunView = state.dayunView || {};
      if (dyBtn) {
        var idx = +dyBtn.getAttribute("data-dy");
        state.dayunView.daYunIndex = idx;
        var dy = state.result.yun.daYun[idx];
        if (dy && dy.liuNian && dy.liuNian.length) {
          var hit = dy.liuNian.filter(function (ln) { return ln.isCurrent; })[0] || dy.liuNian.filter(function (ln) { return ln.ganzhi; })[0];
          if (hit) state.dayunView.year = hit.year;
        }
      }
      if (yBtn) {
        state.dayunView.year = +yBtn.getAttribute("data-year");
      }
      if (mBtn) {
        state.dayunView.month = +mBtn.getAttribute("data-month");
        state.dayunView.dayOpen = true;
      }
      renderDaYun(state.result);
    });
    wrap.addEventListener("toggle", function (e) {
      var det = e.target;
      if (!det || !det.getAttribute || !det.getAttribute("data-yun-details")) return;
      state.dayunView = state.dayunView || {};
      var key = det.getAttribute("data-yun-details");
      if (key === "month") state.dayunView.monthOpen = !!det.open;
      if (key === "day") state.dayunView.dayOpen = !!det.open;
    }, true);
  }

  function formatSolarBirth(result) {
    var s = result.solarBirth || result.solar || result.solarOriginal;
    var h = (result.solarOriginal && result.solarOriginal.hour != null) ? result.solarOriginal.hour : s.hour;
    var m = (result.solarOriginal && result.solarOriginal.minute != null) ? result.solarOriginal.minute : s.minute;
    return "阳历 " + s.year + "-" + pad(s.month) + "-" + pad(s.day) + " " + pad(h) + ":" + pad(m);
  }

  function formatLunarBirth(result) {
    if (result.lunar && result.lunar.full && /\d{4}年/.test(result.lunar.full)) {
      return "阴历 " + result.lunar.full;
    }
    var lu = result.lunar || {};
    if (lu.year) {
      return "阴历 " + lu.year + "年" +
        (lu.monthChinese || "") + "月" + (lu.dayChinese || "") +
        (lu.yearGanZhi ? "（" + lu.yearGanZhi + "）" : "");
    }
    return lu.full ? ("阴历 " + lu.full) : "";
  }

  function renderExtras(result) {
    var xingzuo = (result.meta && result.meta.xingzuo) ? result.meta.xingzuo : "";
    if (xingzuo && xingzuo.indexOf("座") < 0) xingzuo += "座";

    var metaParts = [
      result.genderText,
      formatSolarBirth(result),
      formatLunarBirth(result),
      result.shichen.name,
      "生肖" + result.meta.shengxiao,
    ];
    if (xingzuo) metaParts.push(xingzuo);

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

    $("#meta-line").textContent = metaParts.filter(Boolean).join(" · ");

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

  function renderGejuGlance(gl, result) {
    if (!gl) return "";
    var gradeTone = gl.gradeTone === "利" ? "xi" : (gl.gradeTone === "慎" ? "ji" : "ping");
    var levelCls = gl.levelTone === "强" ? "is-strong" : (gl.levelTone === "弱" ? "is-weak" : "is-mid");
    var xiTags = (gl.xi || []).map(function (w) {
      return '<span class="tag tag--xi">' + w + "</span>";
    }).join("");
    var jiTags = (gl.ji || []).map(function (w) {
      return '<span class="tag tag--ji">' + w + "</span>";
    }).join("");
    var xiCat = (gl.xiCats || []).length ? (gl.xiCats.join(" · ")) : "";
    var jiCat = (gl.jiCats || []).length ? (gl.jiCats.join(" · ")) : "";

    return (
      '<div class="geju-glance">' +
        '<p class="geju-glance__headline">' + escapeHtml(gl.headline) + "</p>" +
        '<div class="geju-glance__grid">' +
          '<div class="geju-glance__cell">' +
            '<span class="geju-glance__k">命主</span>' +
            '<span class="geju-glance__v">' + escapeHtml(gl.dayLabel) + "</span>" +
          "</div>" +
          '<div class="geju-glance__cell ' + levelCls + '">' +
            '<span class="geju-glance__k">身势</span>' +
            '<span class="geju-glance__v">' + escapeHtml(gl.level) + "</span>" +
          "</div>" +
          '<div class="geju-glance__cell">' +
            '<span class="geju-glance__k">格局</span>' +
            '<span class="geju-glance__v">' + escapeHtml(gl.geName) +
              (gl.geCategory ? '<small>' + escapeHtml(gl.geCategory) + "</small>" : "") +
            "</span>" +
          "</div>" +
          '<div class="geju-glance__cell">' +
            '<span class="geju-glance__k">档次</span>' +
            '<span class="geju-glance__v"><span class="sha-badge sha-badge--' + gradeTone + '">' +
              escapeHtml(gl.grade) + "</span>" +
              (gl.gradeScore != null ? '<small>参考 ' + gl.gradeScore + "</small>" : "") +
            "</span>" +
          "</div>" +
        "</div>" +
        '<div class="geju-glance__xiji">' +
          '<div class="geju-glance__xi">' +
            '<div class="geju-glance__xk"><span class="sha-badge sha-badge--xi">喜</span> 宜用</div>' +
            '<div class="tag-row">' + (xiTags || '<span class="geju-glance__empty">—</span>') + "</div>" +
            (xiCat ? '<p class="geju-glance__cat">' + escapeHtml(xiCat) + "</p>" : "") +
          "</div>" +
          '<div class="geju-glance__ji">' +
            '<div class="geju-glance__xk"><span class="sha-badge sha-badge--ji">忌</span> 宜避</div>' +
            '<div class="tag-row">' + (jiTags || '<span class="geju-glance__empty">—</span>') + "</div>" +
            (jiCat ? '<p class="geju-glance__cat">' + escapeHtml(jiCat) + "</p>" : "") +
          "</div>" +
        "</div>" +
        '<div class="geju-glance__lishen">' +
          '<div class="geju-glance__li"><span class="sha-badge sha-badge--xi">利</span> ' +
            escapeHtml(gl.li) + "</div>" +
          '<div class="geju-glance__shen"><span class="sha-badge sha-badge--ji">慎</span> ' +
            escapeHtml(gl.shen) + "</div>" +
        "</div>" +
        '<p class="geju-glance__strategy"><b>怎么用</b>：' + escapeHtml(gl.strategy) + "</p>" +
        (gl.focus ? '<p class="geju-glance__focus">格局焦点：' + escapeHtml(gl.focus) + "</p>" : "") +
      "</div>"
    );
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
            '</div>' +
            (chipHtml ? '<div class="wx-chip-row">' + chipHtml + '</div>' : '') +
            (wx.summary ? '<p class="geju-wx-summary">' + wx.summary + '</p>' : '') +
          '</div>';
      }
      panel.innerHTML =
        '<div class="geju-head">' +
          renderGejuGlance(g.glance, result) +
          wxHead +
        '</div>' +
        g.sections.map(function (sec) {
          // 八字格局：具体命格 + 有利 / 不利
          if (sec.title === "八字格局" && g.geDetail) {
            var gd = g.geDetail;
            var gradeTone = gd.gradeTone === "利" ? "xi" : (gd.gradeTone === "慎" ? "ji" : "ping");
            return (
              '<div class="geju-sec">' +
                '<h4 class="geju-sec-title">' + sec.title + '</h4>' +
                '<div class="geju-id sha-card">' +
                  '<div class="geju-id__top">' +
                    '<div class="geju-id__type">' +
                      '<span class="geju-id__label">格局类型</span>' +
                      '<span class="geju-name geju-name--inline">' + (gd.typeName || g.name || "命格") + '</span>' +
                      (gd.typeCategory ? '<span class="geju-id__cat">' + gd.typeCategory + '</span>' : '') +
                    '</div>' +
                    '<div class="geju-id__grade">' +
                      '<span class="geju-id__label">档次</span>' +
                      '<span class="sha-badge sha-badge--' + gradeTone + '">' + (gd.grade || "—") + '</span>' +
                      (gd.gradeScore != null ? '<span class="geju-id__score">参考 ' + gd.gradeScore + '</span>' : '') +
                    '</div>' +
                  '</div>' +
                  (gd.typeExplain ? '<p class="geju-id__explain">' + gd.typeExplain + '</p>' : '') +
                  (gd.gradeSummary ? '<p class="geju-mean geju-mean--in">' + gd.gradeSummary + '</p>' : (g.mean ? '<p class="geju-mean geju-mean--in">' + g.mean + '</p>' : '')) +
                '</div>' +
                '<details class="geju-more">' +
                  '<summary>取格说明 · 判断标准 · 本盘对照</summary>' +
                  '<div class="sha-card">' +
                    '<div class="sha-card__name">取格说明</div>' +
                    gd.howDetail.map(function (t) { return '<p>' + t + '</p>'; }).join("") +
                  '</div>' +
                  '<div class="sha-card">' +
                    '<div class="sha-card__name">判断标准</div>' +
                    '<ul class="geju-factor-list">' +
                      (gd.criteria || []).map(function (t) { return '<li>' + t + '</li>'; }).join("") +
                    '</ul>' +
                    '<div class="sha-card__name" style="margin-top:0.65rem">本盘对照</div>' +
                    '<ul class="geju-factor-list">' +
                      (gd.gradeReasons || []).map(function (t) { return '<li>' + t + '</li>'; }).join("") +
                    '</ul>' +
                  '</div>' +
                '</details>' +
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
              '</div>'
            );
          }

          var cardItems = null;
          if (sec.title === "十神" && g.shishenDetail && g.shishenDetail.items && g.shishenDetail.items.length) {
            cardItems = g.shishenDetail.items;
          } else if (sec.title === "神煞" && g.shensha && g.shensha.items && g.shensha.items.length) {
            cardItems = g.shensha.items;
          }
          if (cardItems) {
            return (
              '<div class="geju-sec">' +
                '<h4 class="geju-sec-title">' + sec.title + '</h4>' +
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
                  if (it.flag === "平") {
                    if (it.usage) actionHtml += '<p><b>用法</b>：' + it.usage + '</p>';
                    if (it.resolve) actionHtml += '<p><b>化解</b>：' + it.resolve + '</p>';
                  } else if (it.action) {
                    actionHtml = '<p><b>' + it.actionLabel + '</b>：' + it.action + '</p>';
                  } else if (it.resolve) {
                    actionHtml = '<p><b>化解</b>：' + it.resolve + '</p>';
                  }
                  return (
                    '<div class="sha-card' + cardMod + '">' +
                      '<div class="sha-card__name">' + it.name + badge + '</div>' +
                      (it.from ? '<p><b>来源</b>：' + it.from + '</p>' : "") +
                      '<p><b>影响</b>：' + it.effect + '</p>' +
                      actionHtml +
                    '</div>'
                  );
                }).join("") +
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
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.textContent = msg;
    document.body.appendChild(toast);
    void toast.offsetWidth;
    toast.classList.add("toast--show");
    setTimeout(function () {
      toast.classList.remove("toast--show");
      setTimeout(function () {
        if (toast.parentNode) document.body.removeChild(toast);
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

  function loadCases() {
    try {
      var raw = localStorage.getItem(CASE_STORAGE_KEY);
      if (!raw) return [];
      var list = JSON.parse(raw);
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function saveCases(list) {
    try {
      localStorage.setItem(CASE_STORAGE_KEY, JSON.stringify(list));
      return true;
    } catch (e) {
      showToast("案例保存失败（存储空间不足）");
      return false;
    }
  }

  function notesFingerprint() {
    var f = readCaseForm();
    return [f.name, f.question, f.notes].join("\u0001");
  }

  function markNotesBaseline() {
    state.notesBaseline = notesFingerprint();
  }

  function notesDirty() {
    return notesFingerprint() !== (state.notesBaseline || "");
  }

  function confirmDiscardNotes(actionLabel) {
    if (!notesDirty()) return true;
    return window.confirm("批注尚未保存，确定" + (actionLabel || "继续") + "？未保存内容将丢失。");
  }

  function setCaseStatus(msg) {
    var el = $("#case-status");
    if (el) el.textContent = msg || "";
  }

  function syncCaseButtons() {
    var upd = $("#btn-case-update");
    if (upd) upd.hidden = !state.currentCaseId;
  }

  function readCaseForm() {
    return {
      name: (($("#case-name") && $("#case-name").value) || "").trim(),
      question: (($("#case-question") && $("#case-question").value) || "").trim(),
      notes: (($("#case-notes") && $("#case-notes").value) || "").trim(),
    };
  }

  function fillCaseForm(c) {
    if ($("#case-name")) $("#case-name").value = (c && c.name) || "";
    if ($("#case-question")) $("#case-question").value = (c && c.question) || "";
    if ($("#case-notes")) $("#case-notes").value = (c && c.notes) || "";
  }

  function snapshotBirth() {
    return {
      birth: {
        year: state.birth.year,
        month: state.birth.month,
        day: state.birth.day,
        hour: state.birth.hour,
        minute: state.birth.minute,
        gender: state.birth.gender,
      },
      calendarType: state.calendarType,
      lunarLeap: !!state.lunarLeap,
      birthplace: state.birthplace,
      useTrueSolar: state.useTrueSolar,
    };
  }

  function applyCaseBirth(c) {
    if (!c || !c.birth) return;
    var b = c.birth;
    state.birth = {
      year: +b.year,
      month: +b.month,
      day: +b.day,
      hour: Math.min(23, Math.max(0, +b.hour || 0)),
      minute: Math.min(59, Math.max(0, +b.minute || 0)),
      gender: b.gender === 0 || b.gender === "0" ? 0 : 1,
    };
    if (c.calendarType === "lunar" || c.calendarType === "solar") {
      state.calendarType = c.calendarType;
    }
    state.lunarLeap = !!c.lunarLeap;
    if (typeof c.birthplace === "string" && c.birthplace.trim()) {
      state.birthplace = c.birthplace.trim();
    }
    if (typeof c.useTrueSolar === "boolean") {
      state.useTrueSolar = c.useTrueSolar;
    }
    syncInputsFromState();
  }

  function renderCaseList() {
    var listEl = $("#case-list");
    if (!listEl) return;
    var list = loadCases().slice().sort(function (a, b) {
      return (b.updatedAt || 0) - (a.updatedAt || 0);
    });
    if (!list.length) {
      listEl.innerHTML = '<li class="case-list__empty">尚无存档</li>';
      return;
    }
    listEl.innerHTML = list.map(function (c) {
      var on = c.id === state.currentCaseId ? " is-on" : "";
      var sub = (c.question || "") ||
        ((c.birth && c.birth.year) ? (c.birth.year + "-" + pad(c.birth.month) + "-" + pad(c.birth.day)) : "");
      return '<li class="case-item' + on + '" data-case-id="' + escapeHtml(c.id) + '">' +
        '<button type="button" class="case-item__main" data-case-load="' + escapeHtml(c.id) + '">' +
          '<span class="case-item__name">' + escapeHtml(c.name || "未命名") + '</span>' +
          '<span class="case-item__sub">' + escapeHtml(sub) + '</span>' +
        "</button>" +
        '<button type="button" class="case-item__del" data-case-del="' + escapeHtml(c.id) + '" aria-label="删除案例">×</button>' +
        "</li>";
    }).join("");
  }

  function saveNewCase() {
    readInputs();
    var form = readCaseForm();
    if (!form.name) {
      setCaseStatus("请先填写称呼");
      showToast("请填写称呼再存档");
      return;
    }
    var now = Date.now();
    var snap = snapshotBirth();
    var item = {
      id: "c" + now.toString(36),
      name: form.name,
      question: form.question,
      notes: form.notes,
      birth: snap.birth,
      calendarType: snap.calendarType,
      lunarLeap: snap.lunarLeap,
      birthplace: snap.birthplace,
      useTrueSolar: snap.useTrueSolar,
      createdAt: now,
      updatedAt: now,
    };
    var list = loadCases();
    list.push(item);
    if (!saveCases(list)) return;
    state.currentCaseId = item.id;
    markNotesBaseline();
    syncCaseButtons();
    renderCaseList();
    setCaseStatus("已存档：" + item.name);
    showToast("案例已保存");
  }

  function updateCurrentCase() {
    if (!state.currentCaseId) return;
    readInputs();
    var form = readCaseForm();
    var list = loadCases();
    var hit = null;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === state.currentCaseId) {
        hit = list[i];
        break;
      }
    }
    if (!hit) {
      state.currentCaseId = null;
      syncCaseButtons();
      setCaseStatus("当前案例已不存在，请重新存档");
      return;
    }
    var snap = snapshotBirth();
    hit.name = form.name || hit.name || "未命名";
    hit.question = form.question;
    hit.notes = form.notes;
    hit.birth = snap.birth;
    hit.calendarType = snap.calendarType;
    hit.lunarLeap = snap.lunarLeap;
    hit.birthplace = snap.birthplace;
    hit.useTrueSolar = snap.useTrueSolar;
    hit.updatedAt = Date.now();
    if (!saveCases(list)) return;
    markNotesBaseline();
    renderCaseList();
    setCaseStatus("已更新：" + hit.name);
    showToast("案例已更新");
  }

  function loadCaseById(id) {
    if (!confirmDiscardNotes("载入其他案例")) return;
    var list = loadCases();
    var c = null;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) {
        c = list[i];
        break;
      }
    }
    if (!c) {
      showToast("找不到该案例");
      renderCaseList();
      return;
    }
    state.currentCaseId = c.id;
    applyCaseBirth(c);
    fillCaseForm(c);
    markNotesBaseline();
    if (c.question && Relations && Relations.TOPICS && Relations.TOPICS.indexOf(c.question) >= 0) {
      state.relTopic = c.question;
    }
    syncCaseButtons();
    renderCaseList();
    setCaseStatus("已载入：" + (c.name || "未命名"));
    doPaipan();
  }

  function deleteCaseById(id) {
    var list = loadCases().filter(function (c) { return c.id !== id; });
    if (!saveCases(list)) return;
    if (state.currentCaseId === id) {
      state.currentCaseId = null;
      syncCaseButtons();
      setCaseStatus("已删除当前案例");
    }
    renderCaseList();
    showToast("案例已删除");
  }

  function exportCases() {
    var list = loadCases();
    var blob = new Blob([JSON.stringify({ version: 1, exportedAt: Date.now(), cases: list }, null, 2)], {
      type: "application/json"
    });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "bazi-cases-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    showToast("已导出 " + list.length + " 条案例");
  }

  function importCasesFromFile(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(String(reader.result || ""));
        var incoming = Array.isArray(data) ? data : (data && data.cases);
        if (!Array.isArray(incoming)) throw new Error("格式不对");
        var list = loadCases();
        var byId = {};
        list.forEach(function (c) { byId[c.id] = c; });
        var added = 0;
        var updated = 0;
        incoming.forEach(function (c) {
          if (!c || !c.birth) return;
          if (!c.id) c.id = "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
          if (byId[c.id]) {
            byId[c.id] = c;
            updated++;
          } else {
            byId[c.id] = c;
            added++;
          }
        });
        var next = Object.keys(byId).map(function (k) { return byId[k]; });
        if (!saveCases(next)) return;
        renderCaseList();
        showToast("导入完成：新增" + added + " · 更新" + updated);
      } catch (e) {
        console.error(e);
        showToast("导入失败，请检查 JSON 文件");
      }
    };
    reader.readAsText(file, "utf-8");
  }

  function bindCasePanel() {
    var saveBtn = $("#btn-case-save");
    var updBtn = $("#btn-case-update");
    var clearBtn = $("#btn-case-clear");
    var listEl = $("#case-list");
    var exportBtn = $("#btn-case-export");
    var importBtn = $("#btn-case-import");
    var importFile = $("#case-import-file");
    if (saveBtn && !saveBtn._bound) {
      saveBtn._bound = true;
      saveBtn.addEventListener("click", saveNewCase);
    }
    if (updBtn && !updBtn._bound) {
      updBtn._bound = true;
      updBtn.addEventListener("click", updateCurrentCase);
    }
    if (clearBtn && !clearBtn._bound) {
      clearBtn._bound = true;
      clearBtn.addEventListener("click", function () {
        if (!confirmDiscardNotes("清空批注")) return;
        fillCaseForm({ name: "", question: "", notes: "" });
        state.currentCaseId = null;
        markNotesBaseline();
        syncCaseButtons();
        setCaseStatus("批注已清空");
        renderCaseList();
      });
    }
    if (exportBtn && !exportBtn._bound) {
      exportBtn._bound = true;
      exportBtn.addEventListener("click", exportCases);
    }
    if (importBtn && importFile && !importBtn._bound) {
      importBtn._bound = true;
      importBtn.addEventListener("click", function () { importFile.click(); });
      importFile.addEventListener("change", function () {
        var f = importFile.files && importFile.files[0];
        importCasesFromFile(f);
        importFile.value = "";
      });
    }
    if (listEl && !listEl._bound) {
      listEl._bound = true;
      listEl.addEventListener("click", function (e) {
        var del = e.target.closest("[data-case-del]");
        var load = e.target.closest("[data-case-load]");
        if (del) {
          var did = del.getAttribute("data-case-del");
          if (window.confirm("确定删除该案例？")) deleteCaseById(did);
          return;
        }
        if (load) loadCaseById(load.getAttribute("data-case-load"));
      });
    }
    var qEl = $("#case-question");
    if (qEl && !qEl._topicBound) {
      qEl._topicBound = true;
      qEl.addEventListener("change", function () {
        if (state._syncingQuestion) return;
        var q = (qEl.value || "").trim();
        if (Relations && Relations.TOPICS && Relations.TOPICS.indexOf(q) >= 0) {
          state.relTopic = q;
          if (state.result) renderRelations(state.result);
        }
      });
    }
    syncCaseButtons();
    renderCaseList();
    markNotesBaseline();
  }

  function parseShareParams() {
    var raw = "";
    if (location.search && location.search.length > 1) raw = location.search.slice(1);
    else if (location.hash && location.hash.indexOf("=") > 0) {
      raw = location.hash.replace(/^#\/?/, "");
      if (raw.charAt(0) === "?") raw = raw.slice(1);
    }
    if (!raw) return null;
    var map = {};
    raw.split("&").forEach(function (pair) {
      var i = pair.indexOf("=");
      if (i < 0) return;
      var k = decodeURIComponent(pair.slice(0, i));
      var v = decodeURIComponent(pair.slice(i + 1).replace(/\+/g, " "));
      map[k] = v;
    });
    if (!map.y && !map.year) return null;
    var year = parseInt(map.y || map.year, 10);
    var month = parseInt(map.m || map.month, 10);
    var day = parseInt(map.d || map.day, 10);
    if (!(year >= 1900 && year <= 2100) || !(month >= 1 && month <= 12) || !(day >= 1 && day <= 31)) {
      return null;
    }
    var hour = parseInt(map.h != null ? map.h : (map.hour != null ? map.hour : "12"), 10);
    var minute = parseInt(map.mi != null ? map.mi : (map.minute != null ? map.minute : "0"), 10);
    if (isNaN(hour) || hour < 0 || hour > 23) hour = 12;
    if (isNaN(minute) || minute < 0 || minute > 59) minute = 0;
    var g = parseInt(map.g != null ? map.g : (map.gender != null ? map.gender : "1"), 10);
    var cal = map.cal || map.calendarType || "s";
    if (cal === "lunar" || cal === "l" || cal === "阴") cal = "lunar";
    else cal = "solar";
    var tsRaw = map.ts != null ? map.ts : map.trueSolar;
    var useTrueSolar = !(tsRaw === "0" || tsRaw === "false" || tsRaw === "off");
    var leapRaw = map.leap != null ? map.leap : map.lunarLeap;
    return {
      year: year,
      month: month,
      day: day,
      hour: hour,
      minute: minute,
      gender: g === 0 ? 0 : 1,
      calendarType: cal,
      lunarLeap: leapRaw === "1" || leapRaw === "true",
      birthplace: (map.city || map.p || map.birthplace || "长沙").trim() || "长沙",
      useTrueSolar: useTrueSolar,
      name: (map.n || map.name || "").trim()
    };
  }

  function applyShareParams(p) {
    if (!p) return false;
    state.birth = {
      year: p.year,
      month: p.month,
      day: p.day,
      hour: p.hour,
      minute: p.minute,
      gender: p.gender
    };
    state.calendarType = p.calendarType;
    state.lunarLeap = !!p.lunarLeap;
    state.birthplace = p.birthplace;
    state.useTrueSolar = !!p.useTrueSolar;
    syncInputsFromState();
    if (p.name && $("#case-name")) $("#case-name").value = p.name;
    markNotesBaseline();
    return true;
  }

  function buildShareUrl(opts) {
    opts = opts || {};
    readInputs();
    var b = state.birth;
    var parts = [
      "y=" + b.year,
      "m=" + b.month,
      "d=" + b.day,
      "h=" + b.hour,
      "mi=" + b.minute,
      "g=" + b.gender,
      "cal=" + (state.calendarType === "lunar" ? "l" : "s"),
      "ts=" + (state.useTrueSolar ? "1" : "0"),
      "city=" + encodeURIComponent(state.birthplace || "")
    ];
    if (state.calendarType === "lunar" && state.lunarLeap) parts.push("leap=1");
    if (opts.includeName) {
      var name = ($("#case-name") && $("#case-name").value.trim()) || "";
      if (name) parts.push("n=" + encodeURIComponent(name));
    }
    return location.origin + location.pathname + "?" + parts.join("&");
  }

  function syncShareUrl() {
    try {
      if (history.replaceState) history.replaceState(null, "", buildShareUrl({ includeName: false }));
    } catch (e) { /* ignore */ }
  }

  function copyShareLink() {
    if (!state.result) {
      showToast("请先排盘");
      return;
    }
    var url = buildShareUrl({ includeName: true });
    syncShareUrl();
    function ok() { showToast("链接已复制，可分享打开同一盘"); }
    function fail() { window.prompt("复制以下链接：", url); }

    if (navigator.share) {
      navigator.share({ title: "八字排盘", text: "荣恩的周易学堂 · 排盘链接", url: url })
        .then(function () { showToast("已调起系统分享"); })
        .catch(function () {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(ok).catch(fail);
          } else fail();
        });
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(ok).catch(fail);
    } else {
      try {
        var ta = document.createElement("textarea");
        ta.value = url;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        var done = document.execCommand("copy");
        document.body.removeChild(ta);
        if (done) ok();
        else fail();
      } catch (e) {
        fail();
      }
    }
  }

  function loadHtml2Canvas(cb) {
    if (typeof html2canvas === "function") {
      cb(null);
      return;
    }
    var s = document.createElement("script");
    s.src = "lib/html2canvas.min.js";
    s.onload = function () { cb(typeof html2canvas === "function" ? null : new Error("bad")); };
    s.onerror = function () { cb(new Error("load")); };
    document.head.appendChild(s);
  }

  function deliverPngBlob(blob, filename) {
    try {
      var file = new File([blob], filename, { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: filename, text: "八字排盘结果" })
          .then(function () { showToast("已调起分享/保存"); })
          .catch(function () { fallbackDownload(blob, filename); });
        return;
      }
    } catch (e) { /* File/share unsupported */ }
    fallbackDownload(blob, filename);
  }

  function fallbackDownload(blob, filename) {
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.download = filename;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      setTimeout(function () { window.open(url, "_blank"); }, 200);
      showToast("若未下载，请在新页面长按图片保存");
    } else {
      showToast("图片已保存");
    }
    setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
  }

  function dataURLtoBlob(dataUrl) {
    var parts = dataUrl.split(",");
    var mime = parts[0].match(/:(.*?);/)[1];
    var bin = atob(parts[1]);
    var arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
  }

  function saveResultImage() {
    if (!state.result) {
      showToast("请先排盘");
      return;
    }
    var panel = $("#result-panel");
    if (!panel || panel.hidden) {
      showToast("暂无排盘结果");
      return;
    }

    var btn = $("#btn-save-img");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "生成中…";
    }
    showToast("正在生成图片…", 1800);

    loadHtml2Canvas(function (err) {
      if (err || typeof html2canvas !== "function") {
        if (btn) { btn.disabled = false; btn.textContent = "保存图片"; }
        showToast("图片组件加载失败");
        return;
      }

      var coreIds = { "shengshi-block": 1, "dayun-block": 1, "relations-block": 1 };
      var opened = [];
      Object.keys(coreIds).forEach(function (id) {
        var block = document.getElementById(id);
        if (block && block.getAttribute("data-open") === "false") {
          opened.push(block);
          block.setAttribute("data-open", "true");
          var head = $(".analysis-block__head", block);
          if (head) head.setAttribute("aria-expanded", "true");
        }
      });
      ["dayun-body", "relations-body"].forEach(function (id) {
        var root = document.getElementById(id);
        if (!root) return;
        $$("details", root).forEach(function (d) {
          if (!d.open) {
            opened.push(d);
            d.open = true;
          }
        });
      });

      var bg = getComputedStyle(document.body).backgroundColor || "#1a1a1a";
      setTimeout(function () {
        html2canvas(panel, {
          backgroundColor: bg,
          scale: Math.min(2, window.devicePixelRatio || 1.5),
          useCORS: true,
          logging: false,
          windowWidth: panel.scrollWidth,
          windowHeight: panel.scrollHeight,
          ignoreElements: function (el) {
            if (!el) return false;
            if (el.id === "notes-block" || el.id === "geju-block" || el.id === "chenggu-block") return true;
            if (el.id === "consult-jump") return true;
            if (el.classList && el.classList.contains("result-actions")) return true;
            return false;
          }
        }).then(function (canvas) {
          opened.forEach(function (el) {
            if (el.classList && el.classList.contains("analysis-block")) {
              el.setAttribute("data-open", "false");
              var head = $(".analysis-block__head", el);
              if (head) head.setAttribute("aria-expanded", "false");
            } else if (el.tagName === "DETAILS") {
              el.open = false;
            }
          });
          if (btn) { btn.disabled = false; btn.textContent = "保存图片"; }
          var b = state.birth;
          var name = ($("#case-name") && $("#case-name").value.trim()) || "";
          var filename = "八字_" + b.year + "-" + pad(b.month) + "-" + pad(b.day) +
            (name ? "_" + name.replace(/[\\/:*?"<>|]+/g, "") : "") + ".png";
          if (canvas.toBlob) {
            canvas.toBlob(function (blob) {
              if (!blob) {
                showToast("生成图片失败");
                return;
              }
              deliverPngBlob(blob, filename);
            }, "image/png");
          } else {
            fallbackDownload(dataURLtoBlob(canvas.toDataURL("image/png")), filename);
          }
        }).catch(function (e2) {
          console.error(e2);
          opened.forEach(function (el) {
            if (el.classList && el.classList.contains("analysis-block")) {
              el.setAttribute("data-open", "false");
            } else if (el.tagName === "DETAILS") {
              el.open = false;
            }
          });
          if (btn) { btn.disabled = false; btn.textContent = "保存图片"; }
          showToast("生成图片失败，请重试");
        });
      }, 80);
    });
  }

  function doPaipan() {
    readInputs();
    if (state.useTrueSolar && !state.cityMatched) {
      showToast("城市未匹配，已关闭真太阳时");
      state.useTrueSolar = false;
    }
    try {
      var result = BaziEngine.compute({
        year: state.birth.year,
        month: state.birth.month,
        day: state.birth.day,
        hour: state.birth.hour,
        minute: state.birth.minute,
        gender: state.birth.gender,
        calendarType: state.calendarType,
        lunarLeap: state.calendarType === "lunar" && state.lunarLeap,
        birthplace: state.birthplaceData,
        useTrueSolar: state.useTrueSolar && !!state.birthplaceData,
      });
      state.result = result;
      state.dayunView = null;
      saveBirthPrefs();
      syncShareUrl();
      renderBaziTable(result);
      renderShengshi(result);
      renderDaYun(result);
      renderExtras(result);
      $("#result-empty").hidden = true;
      $("#result-panel").hidden = false;
      showToast("排盘完成");
      var panel = $("#result-panel");
      if (panel && panel.scrollIntoView) {
        setTimeout(function () {
          panel.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);
      }
      var paipanBtn = $("#btn-paipan");
      if (paipanBtn) paipanBtn.blur();
    } catch (e) {
      console.error(e);
      $("#result-empty").hidden = false;
      $("#result-panel").hidden = true;
      $("#result-empty").textContent = "排盘失败，请检查日期是否有效（农历闰月需勾选「闰月」）。";
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
        var on = b.dataset.theme === name;
        b.classList.toggle("theme-btn--active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
    }

    $$(".theme-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        applyTheme(this.dataset.theme);
      });
    });

    var now = new Date();
    var share = parseShareParams();
    var hasSaved = loadBirthPrefs();
    if (share) {
      applyShareParams(share);
    } else if (!hasSaved) {
      state.birth.year = now.getFullYear() - 35;
      state.birth.month = now.getMonth() + 1;
      state.birth.day = now.getDate();
      state.birthplace = "长沙";
    }
    if (BaziCities && BaziCities.find) {
      var defCity = BaziCities.find(state.birthplace);
      if (!defCity && !share) defCity = BaziCities.find("长沙");
      if (defCity) {
        state.birthplaceData = {
          name: defCity.n || defCity.name || state.birthplace,
          lng: defCity.lng,
          lat: defCity.lat,
          n: defCity.n,
          p: defCity.p
        };
        state.birthplace = defCity.n || state.birthplace;
      } else if (!state.birthplaceData) {
        // 未匹配城市：不写假经度，真太阳时由 updateCityHint 关闭
        state.birthplaceData = null;
      }
    }

    syncInputsFromState();
    bindAnalysisBlocks();
    bindCasePanel();

    $("#btn-paipan").addEventListener("click", doPaipan);
    if ($("#btn-share")) $("#btn-share").addEventListener("click", copyShareLink);
    if ($("#btn-save-img")) $("#btn-save-img").addEventListener("click", saveResultImage);

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
      readInputs();
    });
    $("#use-true-solar").addEventListener("change", function () {
      if (this.checked && !state.cityMatched) {
        this.checked = false;
        showToast("请先选择匹配的出生城市");
        return;
      }
      readInputs();
    });
    if ($("#lunar-leap")) {
      $("#lunar-leap").addEventListener("change", function () {
        state.lunarLeap = !!this.checked;
        syncLeapMonthUI();
      });
    }

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

    if (share) {
      doPaipan();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
