/** 身势强弱 · 四大要素加权 · 扶抑用神（传统旺衰派）
 * 得令 45% · 得地 30% · 得势 20% · 得生 10%
 */
(function (root) {
  var _wx = root.BaziWxData || {};
  var GAN_WX = _wx.GAN_WX || {
    甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土", 己: "土",
    庚: "金", 辛: "金", 壬: "水", 癸: "水"
  };

  var HIDE_GAN = {
    子: ["癸"],
    丑: ["己", "癸", "辛"],
    寅: ["甲", "丙", "戊"],
    卯: ["乙"],
    辰: ["戊", "乙", "癸"],
    巳: ["丙", "戊", "庚"],
    午: ["丁", "己"],
    未: ["己", "丁", "乙"],
    申: ["庚", "壬", "戊"],
    酉: ["辛"],
    戌: ["戊", "辛", "丁"],
    亥: ["壬", "甲"]
  };

  var HIDE_WEIGHT = [10, 5, 3];
  var STEM_WEIGHT = 8;

  var MONTH_WANG = {
    寅: "木", 卯: "木",
    巳: "火", 午: "火",
    申: "金", 酉: "金",
    亥: "水", 子: "水",
    辰: "土", 戌: "土", 丑: "土", 未: "土"
  };

  var SHENG_WO = { 木: "水", 火: "木", 土: "火", 金: "土", 水: "金" };
  var WO_SHENG = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
  var WO_KE = { 木: "土", 火: "金", 土: "水", 金: "木", 水: "火" };
  var KE_WO = { 木: "金", 火: "水", 土: "木", 金: "火", 水: "土" };

  var WX_ORDER = (_wx.WX_ORDER && _wx.WX_ORDER.slice()) || ["木", "火", "土", "金", "水"];

  // 权重：得令取 40–50% 中值
  var W_LING = 0.45;
  var W_DI = 0.30;
  var W_SHI = 0.20;
  var W_SHENG = 0.10;

  function clamp(n, lo, hi) {
    return Math.max(lo, Math.min(hi, n));
  }

  function emptyScores() {
    return { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  }

  function addScore(scores, wx, n) {
    if (!wx || !scores.hasOwnProperty(wx)) return;
    scores[wx] += n;
  }

  function scoreChart(pillars) {
    var scores = emptyScores();
    pillars.forEach(function (p) {
      addScore(scores, GAN_WX[p.gan], STEM_WEIGHT);
      var hides = HIDE_GAN[p.zhi] || [];
      hides.forEach(function (g, i) {
        addScore(scores, GAN_WX[g], HIDE_WEIGHT[i] || 3);
      });
    });
    return scores;
  }

  /** 得令：月令对日主的旺衰（0–100） */
  function scoreDeLing(dayWx, yinWx, monthZhi) {
    var monthWang = MONTH_WANG[monthZhi];
    var detail = "";
    var score = 0;

    if (monthWang === dayWx) {
      score = 100;
      detail = "月令" + monthZhi + "，" + dayWx + "当令，得令";
    } else if (monthWang === yinWx) {
      score = 58;
      detail = "月令" + monthZhi + "，印星" + yinWx + "当令，印得令";
    } else if (monthWang === WO_SHENG[dayWx]) {
      score = 28;
      detail = "月令" + monthZhi + "，食伤" + monthWang + "当令，泄身";
    } else if (monthWang === WO_KE[dayWx]) {
      score = 22;
      detail = "月令" + monthZhi + "，财星" + monthWang + "当令，耗身";
    } else if (monthWang === KE_WO[dayWx]) {
      score = 18;
      detail = "月令" + monthZhi + "，官杀" + monthWang + "当令，克身";
    } else {
      score = 25;
      detail = "月令" + monthZhi + "，五行" + (monthWang || "?");
    }

    // 月支藏干含日主本气：略抬；仅余气则小抬
    var hides = HIDE_GAN[monthZhi] || [];
    if (hides[0] && GAN_WX[hides[0]] === dayWx && score < 100) {
      score = Math.max(score, 72);
      detail += "；月支本气通日本气";
    } else if (hides.some(function (g) { return GAN_WX[g] === dayWx; }) && score < 55) {
      score += 8;
      detail += "；月支藏干见日主";
    }

    return { score: clamp(score, 0, 100), detail: detail, monthWang: monthWang };
  }

  /** 得地：地支通根（0–100） */
  function scoreDeDi(dayWx, pillars) {
    var roots = [];
    var score = 0;
    // 月、日支权重大于年、时
    var pillarWeight = [0.85, 1.25, 1.15, 0.9]; // 年 月 日 时

    pillars.forEach(function (p, idx) {
      var hides = HIDE_GAN[p.zhi] || [];
      var w = pillarWeight[idx] || 1;
      if (hides[0] && GAN_WX[hides[0]] === dayWx) {
        var add = 42 * w;
        score += add;
        roots.push({ zhi: p.zhi, level: "本气", label: p.label, add: Math.round(add) });
      } else {
        for (var i = 1; i < hides.length; i++) {
          if (GAN_WX[hides[i]] === dayWx) {
            var add2 = (i === 1 ? 18 : 10) * w;
            score += add2;
            roots.push({
              zhi: p.zhi,
              level: i === 1 ? "中气" : "余气",
              label: p.label,
              add: Math.round(add2)
            });
            break;
          }
        }
      }
    });

    score = clamp(score, 0, 100);
    var detail = roots.length
      ? ("通根：" + roots.map(function (r) {
          return r.label + r.zhi + r.level + "(+" + r.add + ")";
        }).join("、"))
      : "四柱地支无明显通根";

    return { score: score, detail: detail, roots: roots };
  }

  /** 得势：天干比劫、印星数量（0–100） */
  function scoreDeShi(dayGan, pillars) {
    var dayWx = GAN_WX[dayGan];
    var yinWx = SHENG_WO[dayWx];
    var bijie = 0;
    var yin = 0;
    var parts = [];

    pillars.forEach(function (p, idx) {
      if (idx === 2) return;
      var wx = GAN_WX[p.gan];
      if (wx === dayWx) {
        bijie += 1;
        parts.push(p.label + p.gan + "比劫");
      } else if (wx === yinWx) {
        yin += 1;
        parts.push(p.label + p.gan + "印");
      }
    });

    // 比劫约 34/枚，印约 28/枚；双比劫接近得势
    var score = clamp(bijie * 34 + yin * 28, 0, 100);
    var detail = parts.length
      ? ("透干 " + parts.join("、") + "（比劫" + bijie + "、印" + yin + "）")
      : "天干无比劫、印星透出";

    return { score: score, detail: detail, bijie: bijie, yin: yin };
  }

  /** 得生：印星是否贴身、有力（0–100） */
  function scoreDeSheng(dayGan, pillars, monthZhi) {
    var dayWx = GAN_WX[dayGan];
    var yinWx = SHENG_WO[dayWx];
    var score = 0;
    var bits = [];

    // 贴身：月干 > 时干 > 年干
    var nearBonus = [16, 48, 0, 28]; // 年 月 日 时
    pillars.forEach(function (p, idx) {
      if (idx === 2) return;
      if (GAN_WX[p.gan] === yinWx) {
        var b = nearBonus[idx] || 12;
        score += b;
        bits.push(p.label + p.gan + "印贴身(+" + b + ")");
      }
    });

    // 月令藏干印：本气最有力
    var hides = HIDE_GAN[monthZhi] || [];
    if (hides[0] && GAN_WX[hides[0]] === yinWx) {
      score += 36;
      bits.push("月令本气" + hides[0] + "印有力(+36)");
    } else if (hides[1] && GAN_WX[hides[1]] === yinWx) {
      score += 18;
      bits.push("月令中气" + hides[1] + "印(+18)");
    } else if (hides[2] && GAN_WX[hides[2]] === yinWx) {
      score += 10;
      bits.push("月令余气" + hides[2] + "印(+10)");
    }

    // 印通根加分
    var yinRoot = false;
    pillars.forEach(function (p) {
      var hs = HIDE_GAN[p.zhi] || [];
      if (hs.some(function (g) { return GAN_WX[g] === yinWx; })) yinRoot = true;
    });
    if (yinRoot && score > 0) {
      score += 12;
      bits.push("印星通根(+12)");
    }

    score = clamp(score, 0, 100);
    var detail = bits.length ? bits.join("；") : "印星不贴身、力量弱";

    return { score: score, detail: detail };
  }

  function classifyByTotal(total) {
    if (total >= 70) return "身强";
    if (total >= 56) return "偏强";
    if (total >= 44) return "中和";
    if (total >= 28) return "偏弱";
    return "身弱";
  }

  function pickYongShen(dayWx, level) {
    var xi, ji, xiCats, jiCats;

    if (level === "身强" || level === "偏强") {
      // 喜克泄耗；忌比印
      xi = [KE_WO[dayWx], WO_SHENG[dayWx], WO_KE[dayWx]];
      ji = [dayWx, SHENG_WO[dayWx]];
      xiCats = ["官杀", "食伤", "财星"];
      jiCats = ["比劫", "印星"];
    } else if (level === "身弱" || level === "偏弱") {
      // 喜印比；忌以财、官杀为主（耗克最伤）
      xi = [SHENG_WO[dayWx], dayWx];
      ji = [WO_KE[dayWx], KE_WO[dayWx]];
      xiCats = ["印星", "比劫"];
      jiCats = ["财星", "官杀"];
    } else {
      xi = [WO_SHENG[dayWx], SHENG_WO[dayWx]];
      ji = [KE_WO[dayWx]];
      xiCats = ["食伤", "印星"];
      jiCats = ["官杀过旺"];
    }

    function uniq(arr) {
      var seen = {};
      return arr.filter(function (x) {
        if (!x || seen[x]) return false;
        seen[x] = true;
        return true;
      });
    }

    return {
      xiYong: uniq(xi),
      jiShen: uniq(ji),
      xiCats: xiCats,
      jiCats: jiCats
    };
  }

  function analyze(opts) {
    var dayGan = opts.dayGan;
    var monthZhi = opts.monthZhi;
    var pillars = opts.pillars || [];
    var dayWx = GAN_WX[dayGan];
    var yinWx = SHENG_WO[dayWx];

    var ling = scoreDeLing(dayWx, yinWx, monthZhi);
    var di = scoreDeDi(dayWx, pillars);
    var shi = scoreDeShi(dayGan, pillars);
    var sheng = scoreDeSheng(dayGan, pillars, monthZhi);

    var total =
      ling.score * W_LING +
      di.score * W_DI +
      shi.score * W_SHI +
      sheng.score * W_SHENG;
    total = Math.round(total * 10) / 10;

    var level = classifyByTotal(total);
    var yong = pickYongShen(dayWx, level);

    // 五行力量条：展示用，不主导身强弱结论
    var scores = scoreChart(pillars);
    if (ling.monthWang === dayWx) addScore(scores, dayWx, 12);
    else if (ling.monthWang === yinWx) addScore(scores, yinWx, 8);
    else if (ling.monthWang) addScore(scores, ling.monthWang, 4);

    var wxTotal = WX_ORDER.reduce(function (s, k) { return s + scores[k]; }, 0) || 1;
    var percent = {};
    WX_ORDER.forEach(function (k) {
      percent[k] = Math.round((scores[k] / wxTotal) * 1000) / 10;
    });

    var factors = [
      { key: "deLing", name: "得令", weight: W_LING, score: ling.score, detail: ling.detail },
      { key: "deDi", name: "得地", weight: W_DI, score: di.score, detail: di.detail },
      { key: "deShi", name: "得势", weight: W_SHI, score: shi.score, detail: shi.detail },
      { key: "deSheng", name: "得生", weight: W_SHENG, score: sheng.score, detail: sheng.detail }
    ];

    var flags = {
      deLing: ling.score >= 55,
      deDi: di.score >= 40,
      deShi: shi.score >= 45,
      deSheng: sheng.score >= 40,
      yinDeLing: ling.monthWang === yinWx
    };

    var summaryParts = [
      "日主" + dayGan + dayWx,
      "综合" + total + "分",
      factors.map(function (f) {
        return f.name + Math.round(f.score);
      }).join("/")
    ];

    var lines = [];
    if (level === "身强" || level === "偏强") {
      lines.push("偏旺，宜泄耗：喜" + yong.xiYong.join("、") + "，忌" + yong.jiShen.join("、"));
    } else if (level === "身弱" || level === "偏弱") {
      lines.push("偏弱，宜生扶：喜" + yong.xiYong.join("、") + "，忌" + yong.jiShen.join("、"));
    } else {
      lines.push("中和，宜平衡：喜" + yong.xiYong.join("、") + "，慎" + yong.jiShen.join("、") + "过旺");
    }

    return {
      dayGan: dayGan,
      dayWx: dayWx,
      level: level,
      total: total,
      factors: factors,
      scores: scores,
      percent: percent,
      flags: flags,
      roots: di.roots,
      touGan: { bijie: shi.bijie, yin: shi.yin },
      xiYong: yong.xiYong,
      jiShen: yong.jiShen,
      xiCats: yong.xiCats,
      jiCats: yong.jiCats,
      summary: summaryParts.join("；"),
      lines: lines
    };
  }

  root.Shengshi = {
    analyze: analyze,
    WX_ORDER: WX_ORDER,
    WEIGHTS: { deLing: W_LING, deDi: W_DI, deShi: W_SHI, deSheng: W_SHENG }
  };
})(typeof window !== "undefined" ? window : global);
