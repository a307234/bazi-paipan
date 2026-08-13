/** 天干地支合冲刑害 — 结构化卡片（面诊白话 + 问事用法） */
(function (root) {
  var GAN_HE = [
    ["甲", "己", "合化土", "中正之合，主诚信稳重，易得贵人相助"],
    ["乙", "庚", "合化金", "仁义之合，主刚柔并济，利于合作谋事"],
    ["丙", "辛", "合化水", "威制之合，主威严有度，易掌权柄"],
    ["丁", "壬", "合化木", "淫匿之合，主感情丰富，需防暧昧纠缠"],
    ["戊", "癸", "合化火", "无情之合，主变化无常，宜守不宜攻"],
  ];

  var GAN_CHONG = [
    ["甲", "庚", "相冲", "金木交战，主事业竞争、筋骨损伤"],
    ["乙", "辛", "相冲", "金木相搏，主人际摩擦、肝胆肺疾"],
    ["丙", "壬", "相冲", "水火相激，主情绪波动、眼目心血管"],
    ["丁", "癸", "相冲", "水火暗冲，主心神不宁、异性纠葛"],
  ];

  var ZHI_LIUHE = [
    ["子", "丑", "合土", "阴阳和合，主暗中助力、贵人暗扶"],
    ["寅", "亥", "合木", "生发之合，主开拓进取、事业有成"],
    ["卯", "戌", "合火", "文明之合，主才华展现、名望提升"],
    ["辰", "酉", "合金", "肃杀之合，主决断力强、宜防刚愎"],
    ["巳", "申", "合水", "流通之合，主灵活变通、交通发达"],
    ["午", "未", "合土", "燥湿相济，主调和平衡、中庸之道"],
  ];

  var ZHI_CHONG = [
    ["子", "午", "相冲", "水火直冲，主情绪激烈、环境剧变"],
    ["丑", "未", "相冲", "土土相激，主财库动荡、脾胃不安"],
    ["寅", "申", "相冲", "金木交锋，主奔波劳碌、肝胆筋骨"],
    ["卯", "酉", "相冲", "金木相击，主桃花劫、官非口舌"],
    ["辰", "戌", "相冲", "土气相搏，主家宅不宁、信仰冲突"],
    ["巳", "亥", "相冲", "水火交冲，主突发变故、心脏血压"],
  ];

  var ZHI_XING = [
    ["寅", "巳", "申", "三刑", "恃势之刑，主仗势欺人、官非牢狱"],
    ["丑", "戌", "未", "三刑", "无恩之刑，主恩将仇报、人际关系紧张"],
    ["子", "卯", "", "相刑", "无礼之刑，主言行失当、母子不合"],
  ];

  var ZHI_HAI = [
    ["子", "未", "相害", "暗中破坏，防小人暗算、感情裂缝"],
    ["丑", "午", "相害", "明合暗害，防合作伙伴背叛"],
    ["寅", "巳", "相害", "刑中有害，防文书契约纠纷"],
    ["卯", "辰", "相害", "木土相害，防事业根基动摇"],
    ["申", "亥", "相害", "金水相害，防口舌是非、交通事故"],
    ["酉", "戌", "相害", "金火相害，防金属烫伤、肺部疾病"],
  ];

  var SANHE = [
    { zhi: ["申", "子", "辰"], wx: "水局", desc: "智慧圆融，利于学术、外交、流通行业" },
    { zhi: ["亥", "卯", "未"], wx: "木局", desc: "生机勃发，利于文化、教育、创意事业" },
    { zhi: ["寅", "午", "戌"], wx: "火局", desc: "热情奔放，利于演艺、餐饮、能源行业" },
    { zhi: ["巳", "酉", "丑"], wx: "金局", desc: "刚健有力，利于金融、法律、军警行业" },
  ];

  var pillarNames = ["年", "月", "日", "时"];
  var PILLAR_MEAN = {
    年: "长辈/环境",
    月: "事业宫",
    日: "自身/配偶",
    时: "结果/子女",
  };

  var TOPICS = ["综合", "事业", "感情", "财运", "健康"];

  var _wx = root.BaziWxData || {};
  var GAN_WX = _wx.GAN_WX || {
    甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土", 己: "土",
    庚: "金", 辛: "金", 壬: "水", 癸: "水"
  };
  var ZHI_WX = _wx.ZHI_WX || {
    子: "水", 丑: "土", 寅: "木", 卯: "木", 辰: "土", 巳: "火",
    午: "火", 未: "土", 申: "金", 酉: "金", 戌: "土", 亥: "水"
  };

  function matchPair(table, a, b) {
    for (var k = 0; k < table.length; k++) {
      var x = table[k][0], y = table[k][1];
      if ((a === x && b === y) || (a === y && b === x)) return table[k];
    }
    return null;
  }

  function severityFor(kind, pillarKey) {
    var base = {
      冲: 80, 刑: 75, 害: 70, 太岁: 78, 伏吟: 72,
      合: 55, 干合: 50, 干冲: 68,
      半合: 40, 三合: 45, 生: 20, 克: 25,
    }[kind] || 30;
    var boost = { 日: 25, 月: 18, 年: 10, 时: 8 }[pillarKey] || 0;
    return base + boost;
  }

  function toneFor(kind) {
    if (kind === "冲" || kind === "刑" || kind === "害" || kind === "干冲" || kind === "太岁") return "慎";
    if (kind === "合" || kind === "干合" || kind === "半合" || kind === "三合" || kind === "生") return "利";
    if (kind === "伏吟") return "平";
    if (kind === "克") return "慎";
    return "平";
  }

  function tipsFor(kind, pillarKey, layer, classic) {
    var who = PILLAR_MEAN[pillarKey] || "相关宫位";
    var when = layer === "liunian" ? "今年" : (layer === "dayun" ? "这步大运" : "命局里");
    var t = { 综合: "", 事业: "", 感情: "", 财运: "", 健康: "" };

    if (kind === "冲" || kind === "干冲") {
      t.综合 = when + "「冲」动" + who + "：易变动、冲突、换环境。宜主动规划，忌被动硬扛。";
      t.事业 = when + "易调动、合同重谈。重大签约留缓冲；适合有准备的调整。";
      t.感情 = when + "易反复或争执。先说清楚再谈进退，忌冷战。";
      t.财运 = when + "现金流易波动。大额分批；旧债可趁机清理。";
      t.健康 = when + "留意睡眠、情绪、筋骨血压；奔波多注意交通作息。";
    } else if (kind === "合" || kind === "干合") {
      t.综合 = when + "「合」住" + who + "：人缘与合作增，也易被人情绑。宜借力，忌糊涂承诺。";
      t.事业 = when + "易遇合作、贵人。合同写清权责；忌只凭口头约定。";
      t.感情 = when + "缘分或绑定感变强。想稳就明确名分，想抽身早说清。";
      t.财运 = when + "合伙、介绍费机会多。算清分成；盲目合钱要谨慎。";
      t.健康 = when + "应酬增多。有约也要留恢复，肠胃与睡眠优先。";
    } else if (kind === "刑") {
      t.综合 = when + "见「刑」：事情别扭、规矩碰壁。宜按制度办事，少意气用事。";
      t.事业 = when + "易流程卡壳、考核压力。留痕沟通；官司能避则避。";
      t.感情 = when + "易顶牛、话说重。先降温再谈，忌当众指责。";
      t.财运 = when + "罚款、违约风险升。合同细读，大额勿轻信。";
      t.健康 = when + "肝气、血压、睡眠易受情绪牵连。少熬夜硬撑。";
    } else if (kind === "害") {
      t.综合 = when + "见「害」：明里还过得去，暗里易误会、拆台。宜核实再信。";
      t.事业 = when + "防嚼舌、方案被截。重要事项双确认。";
      t.感情 = when + "易猜疑、冷暴力。当面问清，少听转述。";
      t.财运 = when + "防私下拆台、担保猫腻。合伙先看账。";
      t.健康 = when + "压力偏隐，易积成失眠、胃胀。定期体检。";
    } else if (kind === "太岁") {
      t.综合 = when + "冲值太岁：年份主题绕着自己转，变动感强。宜守中有进。";
      t.事业 = "本命年起伏更明显。稳主业；若必变，先备方案。";
      t.感情 = "感情议题易上台面。适合认真沟通，不适合暧昧拖延。";
      t.财运 = "开销与机会都偏大。预算锁死，忌跟风加杠杆。";
      t.健康 = "身心负荷偏高。作息规律，体检可提前。";
    } else if (kind === "伏吟") {
      t.综合 = when + "伏吟（与日支同）：旧题重来。宜复盘收尾，忌原地打转。";
      t.事业 = "旧项目议题重现。适合收尾升级，少另开新摊子。";
      t.感情 = "旧情或旧模式回头。想复合先看是否真改。";
      t.财运 = "旧债旧账优先清，再谈新投。";
      t.健康 = "旧疾易反复。按医嘱复查。";
    } else if (kind === "半合" || kind === "三合") {
      t.综合 = when + "地支成" + kind + "：气势聚向某一五行。宜顺势做一件事，少撒网。";
      t.事业 = "相关赛道易成合力。选定主线深耕。";
      t.感情 = "共同兴趣更容易聚人。可发展共同事务。";
      t.财运 = "偏顺势积累。适合主业加成，忌投机。";
      t.健康 = "固定节奏比间歇拼命更稳。";
    } else if (kind === "生") {
      t.综合 = when + "天干相生：资源与照顾感更强。宜接受帮助并兑现。";
      t.事业 = "易得提携、平台输血。把帮助变成业绩。";
      t.感情 = "付出与被照顾感增强。注意对等。";
      t.财运 = "偏送来的机会。可接，要核算成本。";
      t.健康 = "休养、补益更有效；别透支后再补。";
    } else if (kind === "克") {
      t.综合 = when + "天干相克：压制感并存。宜设边界，忌硬刚到底。";
      t.事业 = "考核、竞争压力可能加重。用节奏扛，少情绪对抗。";
      t.感情 = "控制欲或被控制感抬头。需求说清。";
      t.财运 = "成本、被动支出感强。先止损再进攻。";
      t.健康 = "紧绷易上身。拉伸、睡眠优先。";
    } else {
      t.综合 = classic || "留意此关系对命局的影响。";
      t.事业 = t.感情 = t.财运 = t.健康 = t.综合;
    }

    return t;
  }

  function makeCard(opts) {
    var kind = opts.kind;
    var pillarKey = opts.pillarKey || "";
    var layer = opts.layer || "natal";
    var classic = opts.classic || "";
    var wxList = [];
    (opts.wxList || []).forEach(function (w) {
      if (w && wxList.indexOf(w) < 0) wxList.push(w);
    });
    return {
      kind: kind,
      tone: toneFor(kind),
      layer: layer,
      severity: opts.severity != null ? opts.severity : severityFor(kind, pillarKey),
      title: opts.title,
      involve: opts.involve,
      plain: opts.plain,
      classic: classic,
      tips: opts.tips || tipsFor(kind, pillarKey, layer, classic),
      minor: !!opts.minor,
      wxList: wxList,
      shengshiFlag: "平",
      shengshiNote: "",
    };
  }

  function sortCards(cards) {
    return cards.slice().sort(function (a, b) {
      if (!!a.minor !== !!b.minor) return a.minor ? 1 : -1;
      return (b.severity || 0) - (a.severity || 0);
    });
  }

  /** 按身势喜忌改写卡片色调与问事用法 */
  function applyShengshi(cards, shengshi) {
    if (!shengshi || !cards || !cards.length) return cards || [];
    var xi = shengshi.xiYong || [];
    var ji = shengshi.jiShen || [];
    var level = shengshi.level || "";
    var isWeak = level === "身弱" || level === "偏弱";
    var isStrong = level === "身强" || level === "偏强";

    return cards.map(function (c) {
      var card = {};
      for (var k in c) {
        if (Object.prototype.hasOwnProperty.call(c, k)) card[k] = c[k];
      }
      card.tips = {};
      var srcTips = c.tips || {};
      for (var tk in srcTips) {
        if (Object.prototype.hasOwnProperty.call(srcTips, tk)) card.tips[tk] = srcTips[tk];
      }
      var wx = card.wxList || [];
      var xiHit = wx.filter(function (w) { return xi.indexOf(w) >= 0; });
      var jiHit = wx.filter(function (w) { return ji.indexOf(w) >= 0; });

      var flag = "平";
      if (jiHit.length && !xiHit.length) flag = "忌";
      else if (xiHit.length && !jiHit.length) flag = "喜";
      else if (xiHit.length && jiHit.length) flag = "混";

      var kind = card.kind;
      var isChong = kind === "冲" || kind === "干冲" || kind === "刑" || kind === "害" || kind === "太岁" || kind === "克";
      var isHe = kind === "合" || kind === "干合" || kind === "半合" || kind === "三合" || kind === "生";

      var note = "";
      if (flag === "喜") {
        note = "触及喜用「" + xiHit.join("、") + "」";
        if (isChong) {
          note += isWeak
            ? "：身弱逢冲，即便动到喜用也宜「有准备地变」，忌被动硬冲。"
            : "：冲开忌滞、引出喜用气，变动中藏机会，可主动规划。";
          if (card.tone === "慎") card.tone = isWeak ? "慎" : "平";
          card.severity = (card.severity || 50) + (isWeak ? 6 : -4);
        } else if (isHe) {
          note += "：合来喜用，助力更实，宜借力成事。";
          card.tone = "利";
          card.severity = (card.severity || 50) + 8;
        } else {
          note += "：与喜用同气，整体偏有利。";
          if (card.tone !== "慎") card.tone = "利";
        }
      } else if (flag === "忌") {
        note = "触及忌神「" + jiHit.join("、") + "」";
        if (isChong) {
          note += isWeak
            ? "：身弱再逢忌神来冲，压力更大，宜守、宜化，少开新战场。"
            : "：忌神来冲，仍须防突发与消耗；身强可扛，但勿硬刚到底。";
          card.tone = "慎";
          card.severity = (card.severity || 50) + (isWeak ? 14 : 8);
        } else if (isHe) {
          note += "：合住忌神，易被人情/事务粘住负担，合作先算清再进。";
          card.tone = "慎";
          card.severity = (card.severity || 50) + 6;
        } else {
          note += "：与忌神同气，宜谨慎。";
          card.tone = "慎";
        }
      } else if (flag === "混") {
        note = "喜用「" + xiHit.join("、") + "」与忌神「" + jiHit.join("、") + "」并存：利弊同门，宜取喜用一面、挡忌神一面。";
        card.tone = "平";
      } else {
        note = "";
      }

      if (level && (kind === "太岁" || kind === "伏吟")) {
        note += isWeak
          ? " 身弱之年/运，更要把体力与现金流留余量。"
          : (isStrong ? " 身强者本命气动可做事，仍忌过度扩张。" : "");
      }

      card.shengshiFlag = flag;
      card.shengshiNote = (flag === "平") ? "" : note;
      // plain 保持本义；身势用法写入问事 tip

      TOPICS.forEach(function (topic) {
        if (!card.tips[topic]) return;
        var extra = "";
        if (flag === "喜" && isHe) {
          extra = topic === "事业" ? " 合偏喜用，合作可优先谈。"
            : topic === "财运" ? " 喜用得合，可接但仍控分账。"
            : topic === "感情" ? " 喜用得合，助力大于损耗。"
            : topic === "健康" ? " 喜用得气，仍规律作息。"
            : " 喜用得气，可积极用、有边界。";
        } else if (flag === "忌" && isChong) {
          extra = topic === "事业" ? " 忌神来冲，宜守成、少赌气决策。"
            : topic === "财运" ? " 忌神冲动财帛，大额分批、留备用。"
            : topic === "感情" ? " 忌神冲宫，情绪先降温再谈。"
            : topic === "健康" ? " 忌神来冲，盯睡眠与血压负荷。"
            : " 忌神来冲，以守、化、缓为主。";
        } else if (flag === "忌" && isHe) {
          extra = " 合上忌神易耗，承诺前先算账。";
        } else if (flag === "喜" && isChong && !isWeak) {
          extra = " 冲中带喜用：可变，自己握方向。";
        } else if (flag === "喜" && isChong && isWeak) {
          extra = " 虽触喜用，身弱仍先稳住再求变。";
        }
        if (extra) card.tips[topic] = card.tips[topic] + extra;
      });

      return card;
    });
  }

  function analyzeNatalCards(gans, zhis, shengshi) {
    var cards = [];
    var i, j;

    for (i = 0; i < gans.length; i++) {
      for (j = i + 1; j < gans.length; j++) {
        var he = matchPair(GAN_HE, gans[i], gans[j]);
        if (he) {
          cards.push(makeCard({
            kind: "干合",
            pillarKey: pillarNames[j] === "日" || pillarNames[i] === "日" ? "日" : pillarNames[i],
            layer: "natal",
            title: he[0] + he[1] + he[2],
            involve: pillarNames[i] + "干" + gans[i] + " 合 " + pillarNames[j] + "干" + gans[j],
            plain: "原局天干相合，性格里既有牵绊合作的一面，也容易被人情拉着走。",
            classic: he[3],
            wxList: [GAN_WX[gans[i]], GAN_WX[gans[j]]],
          }));
        }
        var ch = matchPair(GAN_CHONG, gans[i], gans[j]);
        if (ch) {
          cards.push(makeCard({
            kind: "干冲",
            pillarKey: pillarNames[i] === "日" || pillarNames[j] === "日" ? "日" : pillarNames[i],
            layer: "natal",
            title: ch[0] + ch[1] + ch[2],
            involve: pillarNames[i] + "干" + gans[i] + " 冲 " + pillarNames[j] + "干" + gans[j],
            plain: "原局天干相冲，内心或对外容易拉扯、竞争感强，遇事要先稳住再出手。",
            classic: ch[3],
            wxList: [GAN_WX[gans[i]], GAN_WX[gans[j]]],
          }));
        }
      }
    }

    for (i = 0; i < zhis.length; i++) {
      for (j = i + 1; j < zhis.length; j++) {
        var zhe = matchPair(ZHI_LIUHE, zhis[i], zhis[j]);
        if (zhe) {
          var pkHe = pillarNames[i] === "日" || pillarNames[j] === "日" ? "日" :
            (pillarNames[i] === "月" || pillarNames[j] === "月" ? "月" : pillarNames[i]);
          cards.push(makeCard({
            kind: "合",
            pillarKey: pkHe,
            layer: "natal",
            title: zhis[i] + zhis[j] + "六合（" + zhe[2] + "）",
            involve: pillarNames[i] + "支 与 " + pillarNames[j] + "支",
            plain: "原局地支相合，" + PILLAR_MEAN[pkHe] + "一带更容易粘合、互助，也易形成固定模式。",
            classic: zhe[3],
            wxList: [ZHI_WX[zhis[i]], ZHI_WX[zhis[j]]],
          }));
        }
        var zch = matchPair(ZHI_CHONG, zhis[i], zhis[j]);
        if (zch) {
          var pkCh = pillarNames[i] === "日" || pillarNames[j] === "日" ? "日" :
            (pillarNames[i] === "月" || pillarNames[j] === "月" ? "月" : pillarNames[i]);
          cards.push(makeCard({
            kind: "冲",
            pillarKey: pkCh,
            layer: "natal",
            title: zhis[i] + zhis[j] + zch[2],
            involve: pillarNames[i] + "支 与 " + pillarNames[j] + "支",
            plain: "原局地支相冲，" + PILLAR_MEAN[pkCh] + "一带天生多变动与张力，成长靠「会调整」。",
            classic: zch[3],
            wxList: [ZHI_WX[zhis[i]], ZHI_WX[zhis[j]]],
          }));
        }
        var zhai = matchPair(ZHI_HAI, zhis[i], zhis[j]);
        if (zhai) {
          var pkHai = pillarNames[i] === "日" || pillarNames[j] === "日" ? "日" :
            (pillarNames[i] === "月" || pillarNames[j] === "月" ? "月" : pillarNames[i]);
          cards.push(makeCard({
            kind: "害",
            pillarKey: pkHai,
            layer: "natal",
            title: zhis[i] + zhis[j] + zhai[2],
            involve: pillarNames[i] + "支 与 " + pillarNames[j] + "支",
            plain: "原局地支相害，相关关系里易有暗耗与误会，宜早核实、少表面文章。",
            classic: zhai[3],
            wxList: [ZHI_WX[zhis[i]], ZHI_WX[zhis[j]]],
          }));
        }
      }
    }

    for (var g = 0; g < ZHI_XING.length; g++) {
      var group = ZHI_XING[g];
      var present = [];
      for (var p = 0; p < 3; p++) {
        if (group[p] && zhis.indexOf(group[p]) >= 0) present.push(group[p]);
      }
      if (present.length >= 2) {
        var pkX = "月";
        for (var zi = 0; zi < zhis.length; zi++) {
          if (present.indexOf(zhis[zi]) < 0) continue;
          if (pillarNames[zi] === "日") pkX = "日";
          else if (pillarNames[zi] === "月" && pkX !== "日") pkX = "月";
        }
        cards.push(makeCard({
          kind: "刑",
          pillarKey: pkX,
          layer: "natal",
          title: present.join("") + group[3],
          involve: "地支 " + present.join("、"),
          plain: "原局见刑，处事易别扭、规矩碰壁；把规则写清、情绪降温会好很多。",
          classic: group[4],
          wxList: present.map(function (z) { return ZHI_WX[z]; }),
        }));
      }
    }

    for (var h = 0; h < SANHE.length; h++) {
      var sz = SANHE[h];
      var hit = sz.zhi.filter(function (z) { return zhis.indexOf(z) >= 0; });
      if (hit.length >= 2) {
        var kind = hit.length === 3 ? "三合" : "半合";
        var wxSan = sz.wx.replace("局", "");
        cards.push(makeCard({
          kind: kind,
          pillarKey: "月",
          layer: "natal",
          title: hit.join("") + kind + sz.wx,
          involve: "地支 " + hit.join("、"),
          plain: "原局" + kind + sz.wx + "，气势往这一路聚，相关赛道更顺手。",
          classic: sz.desc,
          wxList: [wxSan],
        }));
      }
    }

    // 天干生克：次要，默认折叠
    var sheng = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
    var ke = { 木: "土", 土: "水", 水: "火", 火: "金", 金: "木" };
    for (i = 0; i < gans.length; i++) {
      for (j = i + 1; j < gans.length; j++) {
        var wi = GAN_WX[gans[i]];
        var wj = GAN_WX[gans[j]];
        if (sheng[wi] === wj) {
          cards.push(makeCard({
            kind: "生",
            pillarKey: pillarNames[j],
            layer: "natal",
            minor: true,
            title: gans[i] + "生" + gans[j],
            involve: pillarNames[i] + "干 → " + pillarNames[j] + "干（" + wi + "生" + wj + "）",
            plain: "前者滋养后者，资源与照顾从" + pillarNames[i] + "柱流向" + pillarNames[j] + "柱。",
            classic: wi + "生" + wj,
            wxList: [wi, wj],
          }));
        }
        if (ke[wi] === wj) {
          cards.push(makeCard({
            kind: "克",
            pillarKey: pillarNames[j],
            layer: "natal",
            minor: true,
            title: gans[i] + "克" + gans[j],
            involve: pillarNames[i] + "干 → " + pillarNames[j] + "干（" + wi + "克" + wj + "）",
            plain: "前者压制后者，" + pillarNames[j] + "柱一带更易感到压力或约束。",
            classic: wi + "克" + wj,
            wxList: [wi, wj],
          }));
        }
      }
    }

    return sortCards(applyShengshi(cards, shengshi));
  }

  function vsExternalCards(natalGans, natalZhis, gan, zhi, layer, label, shengshi) {
    var cards = [];
    if (!gan && !zhi) return cards;
    var tag = label || (layer === "liunian" ? "流年" : "大运");
    var extWx = [];
    if (gan && GAN_WX[gan]) extWx.push(GAN_WX[gan]);
    if (zhi && ZHI_WX[zhi]) extWx.push(ZHI_WX[zhi]);
    var i;

    if (gan) {
      for (i = 0; i < natalGans.length; i++) {
        var he = matchPair(GAN_HE, gan, natalGans[i]);
        if (he) {
          cards.push(makeCard({
            kind: "干合",
            pillarKey: pillarNames[i],
            layer: layer,
            title: tag + gan + " 合" + pillarNames[i] + "干" + natalGans[i],
            involve: tag + "天干 合 " + pillarNames[i] + "柱天干",
            plain: tag + "与" + pillarNames[i] + "柱天干相合，" + PILLAR_MEAN[pillarNames[i]] + "易出现牵绊、合作或人情绑定。",
            classic: he[2] + "，" + he[3],
          }));
        }
        var ch = matchPair(GAN_CHONG, gan, natalGans[i]);
        if (ch) {
          cards.push(makeCard({
            kind: "干冲",
            pillarKey: pillarNames[i],
            layer: layer,
            title: tag + gan + " 冲" + pillarNames[i] + "干" + natalGans[i],
            involve: tag + "天干 冲 " + pillarNames[i] + "柱天干",
            plain: tag + "冲击" + pillarNames[i] + "柱天干，念头与对外表达更冲，宜先缓再决。",
            classic: ch[2] + "，" + ch[3],
          }));
        }
      }
    }

    if (zhi) {
      for (i = 0; i < natalZhis.length; i++) {
        if (zhi === natalZhis[i]) {
          if (i === 2) {
            var isLn = layer === "liunian";
            cards.push(makeCard({
              kind: isLn ? "太岁" : "伏吟",
              pillarKey: "日",
              layer: layer,
              title: isLn ? (tag + zhi + " 值日支太岁") : (tag + zhi + " 与日支同"),
              involve: tag + "地支 对 日支",
              plain: isLn
                ? "流年地支与日支相同，太岁坐命，变动围绕「自己」展开。"
                : "大运地支与日支相同，伏吟象，旧题易重来，宜复盘收尾。",
              classic: isLn ? "本命气动" : "伏吟",
            }));
          } else {
            cards.push(makeCard({
              kind: "伏吟",
              pillarKey: pillarNames[i],
              layer: layer,
              title: tag + zhi + " 与" + pillarNames[i] + "支同",
              involve: tag + "地支 对 " + pillarNames[i] + "支",
              plain: tag + "与" + pillarNames[i] + "支同气，" + PILLAR_MEAN[pillarNames[i]] + "旧模式加强。",
              classic: "同支加深",
              severity: severityFor("伏吟", pillarNames[i]) - 8,
            }));
          }
          continue;
        }
        var zhe = matchPair(ZHI_LIUHE, zhi, natalZhis[i]);
        if (zhe) {
          cards.push(makeCard({
            kind: "合",
            pillarKey: pillarNames[i],
            layer: layer,
            title: tag + zhi + " 合" + pillarNames[i] + "支" + natalZhis[i],
            involve: tag + "地支 合 " + pillarNames[i] + "支（" + zhe[2] + "）",
            plain: tag + "合住" + pillarNames[i] + "支，" + PILLAR_MEAN[pillarNames[i]] + "易得助力，也易被绑定。",
            classic: zhe[3],
          }));
        }
        var zch = matchPair(ZHI_CHONG, zhi, natalZhis[i]);
        if (zch) {
          cards.push(makeCard({
            kind: "冲",
            pillarKey: pillarNames[i],
            layer: layer,
            title: tag + zhi + " 冲" + pillarNames[i] + "支" + natalZhis[i],
            involve: tag + "地支 冲 " + pillarNames[i] + "支",
            plain: tag + "冲开" + pillarNames[i] + "支，" + PILLAR_MEAN[pillarNames[i]] + "变动、冲突或迁移感上升。",
            classic: zch[3],
          }));
        }
        var zhai = matchPair(ZHI_HAI, zhi, natalZhis[i]);
        if (zhai) {
          cards.push(makeCard({
            kind: "害",
            pillarKey: pillarNames[i],
            layer: layer,
            title: tag + zhi + " 害" + pillarNames[i] + "支" + natalZhis[i],
            involve: tag + "地支 害 " + pillarNames[i] + "支",
            plain: tag + "暗害" + pillarNames[i] + "支，相关领域易有误会与暗耗，宜核实。",
            classic: zhai[3],
          }));
        }
      }

      var mixed = natalZhis.slice();
      if (mixed.indexOf(zhi) < 0) mixed.push(zhi);
      for (var g = 0; g < ZHI_XING.length; g++) {
        var group = ZHI_XING[g];
        var present = [];
        var hasExt = false;
        for (var p = 0; p < 3; p++) {
          if (!group[p]) continue;
          if (mixed.indexOf(group[p]) >= 0) {
            present.push(group[p]);
            if (group[p] === zhi) hasExt = true;
          }
        }
        if (hasExt && present.length >= 2) {
          cards.push(makeCard({
            kind: "刑",
            pillarKey: "日",
            layer: layer,
            title: tag + "参与" + present.join("") + group[3],
            involve: "地支 " + present.join("、"),
            plain: tag + "凑成刑局，处事易别扭、规矩碰壁，宜按流程、少意气。",
            classic: group[4],
          }));
        }
      }

      for (var h = 0; h < SANHE.length; h++) {
        var sz = SANHE[h];
        if (sz.zhi.indexOf(zhi) < 0) continue;
        var hit = sz.zhi.filter(function (z) { return natalZhis.indexOf(z) >= 0 || z === zhi; });
        var natalHit = sz.zhi.filter(function (z) { return natalZhis.indexOf(z) >= 0; });
        if (hit.length >= 2 && natalHit.length >= 1) {
          var kind = hit.length === 3 ? "三合" : "半合";
          cards.push(makeCard({
            kind: kind,
            pillarKey: "月",
            layer: layer,
            title: tag + zhi + " 与原局" + kind + sz.wx,
            involve: hit.join("") + kind + sz.wx,
            plain: tag + "促成" + kind + sz.wx + "，气势聚向这一路，顺势做事更省力。",
            classic: sz.desc,
          }));
        }
      }
    }

    cards.forEach(function (c) {
      c.wxList = extWx.slice();
    });
    return sortCards(applyShengshi(cards, shengshi));
  }

  /** 兼容旧字符串接口 */
  function cardsToLines(cards) {
    return (cards || []).map(function (c) {
      return c.title + "：" + c.plain;
    });
  }

  function fromPillars(pillars, shengshi) {
    var gans = pillars.map(function (p) { return p.gan; });
    var zhis = pillars.map(function (p) { return p.zhi; });
    var natalCards = analyzeNatalCards(gans, zhis, shengshi);
    return {
      gans: gans,
      zhis: zhis,
      natalCards: natalCards,
      ganNotes: cardsToLines(natalCards.filter(function (c) {
        return c.kind === "干合" || c.kind === "干冲" || c.kind === "生" || c.kind === "克";
      })),
      zhiNotes: cardsToLines(natalCards.filter(function (c) {
        return !(c.kind === "干合" || c.kind === "干冲" || c.kind === "生" || c.kind === "克");
      })),
    };
  }

  function vsExternal(natalGans, natalZhis, gan, zhi, label, shengshi) {
    var layer = (label && label.indexOf("流年") === 0) ? "liunian" : "dayun";
    return cardsToLines(vsExternalCards(natalGans, natalZhis, gan, zhi, layer, label, shengshi));
  }

  root.Relations = {
    TOPICS: TOPICS,
    analyzeNatalCards: analyzeNatalCards,
    vsExternalCards: vsExternalCards,
    applyShengshi: applyShengshi,
    fromPillars: fromPillars,
    vsExternal: vsExternal,
    analyzeGan: function (gans) {
      var cards = analyzeNatalCards(gans, ["子", "丑", "寅", "卯"]);
      var lines = cardsToLines(cards.filter(function (c) {
        return c.kind === "干合" || c.kind === "干冲" || c.kind === "生" || c.kind === "克";
      }));
      return lines.length ? lines : ["四柱天干无显著合冲，生克关系平和"];
    },
    analyzeZhi: function (zhis) {
      var cards = analyzeNatalCards(["甲", "乙", "丙", "丁"], zhis);
      var lines = cardsToLines(cards.filter(function (c) {
        return !(c.kind === "干合" || c.kind === "干冲" || c.kind === "生" || c.kind === "克");
      }));
      return lines.length ? lines : ["四柱地支无显著合冲刑害，格局相对安稳"];
    },
  };
})(typeof window !== "undefined" ? window : global);
