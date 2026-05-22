/** 天干地支合冲刑害 — 留意分析（含简要说明） */
(function (root) {
  var GAN = "甲乙丙丁戊己庚辛壬癸";
  var ZHI = "子丑寅卯辰巳午未申酉戌亥";

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

  function pairLabel(i, j) {
    return pillarNames[i] + "柱与" + pillarNames[j] + "柱";
  }

  function analyzeGan(gans) {
    var notes = [];
    for (var i = 0; i < gans.length; i++) {
      for (var j = i + 1; j < gans.length; j++) {
        for (var k = 0; k < GAN_HE.length; k++) {
          var a = GAN_HE[k][0], b = GAN_HE[k][1], desc = GAN_HE[k][2], exp = GAN_HE[k][3];
          if ((gans[i] === a && gans[j] === b) || (gans[i] === b && gans[j] === a)) {
            notes.push(pairLabel(i, j) + "：" + a + b + desc + "，意即" + exp);
          }
        }
        for (var k = 0; k < GAN_CHONG.length; k++) {
          var a = GAN_CHONG[k][0], b = GAN_CHONG[k][1], desc = GAN_CHONG[k][2], exp = GAN_CHONG[k][3];
          if ((gans[i] === a && gans[j] === b) || (gans[i] === b && gans[j] === a)) {
            notes.push(pairLabel(i, j) + "：" + a + b + desc + "，意即" + exp);
          }
        }
      }
    }
    var wxSK = {
      甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土", 己: "土", 庚: "金", 辛: "金", 壬: "水", 癸: "水",
    };
    var sheng = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
    var ke = { 木: "土", 土: "水", 水: "火", 火: "金", 金: "木" };
    for (var i = 0; i < gans.length; i++) {
      for (var j = i + 1; j < gans.length; j++) {
        var wi = wxSK[gans[i]];
        var wj = wxSK[gans[j]];
        if (sheng[wi] === wj) notes.push(pairLabel(i, j) + "：" + gans[i] + "生" + gans[j] + "（" + wi + "生" + wj + "），前者滋养后者，关系融洽");
        if (ke[wi] === wj) notes.push(pairLabel(i, j) + "：" + gans[i] + "克" + gans[j] + "（" + wi + "克" + wj + "），前者压制后者，需注意平衡");
      }
    }
    return notes.length ? notes : ["四柱天干无显著合冲，生克关系平和，命主性格较为随和"];
  }

  function analyzeZhi(zhis) {
    var notes = [];
    for (var i = 0; i < zhis.length; i++) {
      for (var j = i + 1; j < zhis.length; j++) {
        for (var k = 0; k < ZHI_LIUHE.length; k++) {
          var a = ZHI_LIUHE[k][0], b = ZHI_LIUHE[k][1], desc = ZHI_LIUHE[k][2], exp = ZHI_LIUHE[k][3];
          if ((zhis[i] === a && zhis[j] === b) || (zhis[i] === b && zhis[j] === a)) {
            notes.push(pairLabel(i, j) + "：" + a + b + "六合（" + desc + "），" + exp);
          }
        }
        for (var k = 0; k < ZHI_CHONG.length; k++) {
          var a = ZHI_CHONG[k][0], b = ZHI_CHONG[k][1], desc = ZHI_CHONG[k][2], exp = ZHI_CHONG[k][3];
          if ((zhis[i] === a && zhis[j] === b) || (zhis[i] === b && zhis[j] === a)) {
            notes.push(pairLabel(i, j) + "：" + a + b + desc + "，" + exp);
          }
        }
        for (var k = 0; k < ZHI_HAI.length; k++) {
          var a = ZHI_HAI[k][0], b = ZHI_HAI[k][1], desc = ZHI_HAI[k][2], exp = ZHI_HAI[k][3];
          if ((zhis[i] === a && zhis[j] === b) || (zhis[i] === b && zhis[j] === a)) {
            notes.push(pairLabel(i, j) + "：" + a + b + desc + "，" + exp);
          }
        }
      }
    }
    for (var g = 0; g < ZHI_XING.length; g++) {
      var group = ZHI_XING[g];
      var present = group.filter(function(z) { return z && zhis.includes(z); });
      if (present.length >= 2) {
        notes.push("地支见" + present.join("") + group[3] + "，" + group[4]);
      }
    }
    for (var h = 0; h < SANHE.length; h++) {
      var sz = SANHE[h];
      var hit = sz.zhi.filter(function(z) { return zhis.includes(z); });
      if (hit.length >= 2) {
        notes.push("地支" + hit.join("") + "半合" + sz.wx + "，" + sz.desc);
      }
      if (hit.length === 3) {
        notes.push("地支三合" + sz.wx + "：" + hit.join("") + "，" + sz.desc);
      }
    }
    return notes.length ? notes : ["四柱地支无显著合冲刑害，格局相对安稳，人生较为平顺"];
  }

  root.Relations = {
    analyzeGan: analyzeGan,
    analyzeZhi: analyzeZhi,
  };
})(typeof window !== "undefined" ? window : global);
