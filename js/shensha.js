/** 神煞推算 — 参考传统命理规则 */
(function (root) {
  // 天乙贵人
  var TIANYI = {
    甲: ["丑","未"], 戊: ["丑","未"],
    乙: ["子","申"], 己: ["子","申"],
    丙: ["亥","酉"], 丁: ["亥","酉"],
    庚: ["午","寅"], 辛: ["午","寅"],
    壬: ["卯","巳"], 癸: ["卯","巳"]
  };

  // 文昌贵人
  var WENCHANG = { 甲:"巳", 乙:"午", 丙:"申", 丁:"酉", 戊:"申", 己:"酉", 庚:"亥", 辛:"子", 壬:"寅", 癸:"卯" };

  // 太极贵人
  var TAIJI = {
    甲: ["子","午"], 乙: ["子","午"],
    丙: ["卯","酉"], 丁: ["卯","酉"],
    戊: ["辰","戌","丑","未"], 己: ["辰","戌","丑","未"],
    庚: ["寅","亥"], 辛: ["寅","亥"],
    壬: ["巳","申"], 癸: ["巳","申"]
  };

  // 国印贵人
  var GUOYIN = { 甲:"戌", 乙:"亥", 丙:"丑", 丁:"寅", 戊:"丑", 己:"寅", 庚:"辰", 辛:"巳", 壬:"未", 癸:"申" };

  // 天厨贵人
  var TIANCHU = { 甲:"巳", 乙:"午", 丙:"子", 丁:"巳", 戊:"午", 己:"申", 庚:"寅", 辛:"午", 壬:"酉", 癸:"亥" };

  // 学堂
  var XUETANG = { 甲:"亥", 乙:"午", 丙:"寅", 丁:"酉", 戊:"寅", 己:"酉", 庚:"巳", 辛:"子", 壬:"申", 癸:"卯" };

  // 禄神（各干之禄）
  var LUSHEN = { 甲:"寅", 乙:"卯", 丙:"巳", 丁:"午", 戊:"巳", 己:"午", 庚:"申", 辛:"酉", 壬:"亥", 癸:"子" };

  // 羊刃（帝旺之位）
  // 阳干羊刃在帝旺，阴干在临官前
  var YANGREN = { 甲:"卯", 丙:"午", 戊:"午", 庚:"酉", 壬:"子", 乙:"寅", 丁:"巳", 己:"巳", 辛:"申", 癸:"亥" };

  // 红艳
  var HONGYAN = { 甲:"午", 乙:"申", 丙:"寅", 丁:"未", 戊:"辰", 己:"辰", 庚:"戌", 辛:"酉", 壬:"子", 癸:"申" };

  // 金舆
  var JINYU = { 甲:"辰", 乙:"巳", 丙:"未", 丁:"申", 戊:"未", 己:"申", 庚:"戌", 辛:"亥", 壬:"丑", 癸:"寅" };

  // 福星贵人
  var FUXING = { 甲:"丑", 乙:"巳", 丙:"寅", 丁:"未", 戊:"申", 己:"酉", 庚:"午", 辛:"巳", 壬:"辰", 癸:"卯" };

  // —— 以地支三合局为基准的神煞 ——
  // 驿马：三合局长生位对冲
  var YIMA = { 申:"寅",子:"寅",辰:"寅", 寅:"申",午:"申",戌:"申", 亥:"巳",卯:"巳",未:"巳", 巳:"亥",酉:"亥",丑:"亥" };

  // 桃花/咸池：三合局沐浴位
  var TAOHUA = { 申:"酉",子:"酉",辰:"酉", 寅:"卯",午:"卯",戌:"卯", 亥:"子",卯:"子",未:"子", 巳:"午",酉:"午",丑:"午" };

  // 华盖：三合局墓库位
  var HUAGAI = { 申:"辰",子:"辰",辰:"辰", 寅:"戌",午:"戌",戌:"戌", 亥:"未",卯:"未",未:"未", 巳:"丑",酉:"丑",丑:"丑" };

  // 将星：三合局帝旺位（中神）
  var JIANGXING = { 申:"子",子:"子",辰:"子", 寅:"午",午:"午",戌:"午", 亥:"卯",卯:"卯",未:"卯", 巳:"酉",酉:"酉",丑:"酉" };

  // 劫煞：三合局绝位
  var JIESHA = { 申:"巳",子:"巳",辰:"巳", 寅:"亥",午:"亥",戌:"亥", 亥:"申",卯:"申",未:"申", 巳:"寅",酉:"寅",丑:"寅" };

  // 亡神：三合局临官位
  var WANGSHEN = { 申:"亥",子:"亥",辰:"亥", 寅:"巳",午:"巳",戌:"巳", 亥:"寅",卯:"寅",未:"寅", 巳:"申",酉:"申",丑:"申" };

  // 孤辰：三合局前一辰
  var GUCHEN = { 亥:"寅",子:"寅",丑:"寅", 寅:"巳",卯:"巳",辰:"巳", 巳:"申",午:"申",未:"申", 申:"亥",酉:"亥",戌:"亥" };

  // 寡宿：三合局后一辰
  var GUASU = { 亥:"戌",子:"戌",丑:"戌", 寅:"丑",卯:"丑",辰:"丑", 巳:"辰",午:"辰",未:"辰", 申:"未",酉:"未",戌:"未" };

  // 天罗地网
  var TIANLUO = { 戌:"亥", 亥:"戌" };
  var DIWANG = { 辰:"巳", 巳:"辰" };

  // 魁罡（日柱特定干支）
  var KUIGANG = { "庚戌":true, "庚辰":true, "戊戌":true, "壬辰":true };

  // 阴阳差错（日柱特定干支）
  var YINYANG_CHACUO = {
    "丙子":true,"丁丑":true,"戊寅":true,"辛卯":true,"壬辰":true,
    "癸巳":true,"丙午":true,"丁未":true,"戊申":true,"辛酉":true,"壬戌":true,"癸亥":true
  };

  // 十恶大败（日柱特定干支）
  var SHIE_DABAI = {
    "甲辰":true,"乙巳":true,"丙申":true,"丁亥":true,"戊戌":true,
    "己丑":true,"庚辰":true,"辛巳":true,"壬申":true,"癸亥":true
  };

  // 天德贵人（按月支）
  var TIANDE = { 寅:"丁",卯:"申",辰:"壬",巳:"辛",午:"亥",未:"甲",申:"癸",酉:"寅",戌:"丙",亥:"乙",子:"巳",丑:"庚" };

  // 月德贵人（按月支三合局）
  var YUEDE = { 寅:"丙",午:"丙",戌:"丙", 卯:"甲",未:"甲",亥:"甲", 辰:"壬",申:"壬",子:"壬", 巳:"庚",酉:"庚",丑:"庚" };

  // 天医（按月支前一辰）
  var TIANYI_SHA = { 寅:"丑",卯:"寅",辰:"卯",巳:"辰",午:"巳",未:"午",申:"未",酉:"申",戌:"酉",亥:"戌",子:"亥",丑:"子" };

  // 吊客（年支/日支后二辰）
  var DIAOKE = { 子:"戌",丑:"亥",寅:"子",卯:"丑",辰:"寅",巳:"卯",午:"辰",未:"巳",申:"午",酉:"未",戌:"申",亥:"酉" };

  function compute(ec) {
    var dayGan = ec.getDayGan();
    var yearGan = ec.getYearGan();
    var monthZhi = ec.getMonthZhi();
    var dayGz = ec.getDay();
    var dayZhi = ec.getDayZhi();
    var yearZhi = ec.getYearZhi();

    var pillars = [
      { gan: ec.getYearGan(), zhi: ec.getYearZhi() },
      { gan: ec.getMonthGan(), zhi: ec.getMonthZhi() },
      { gan: ec.getDayGan(), zhi: ec.getDayZhi() },
      { gan: ec.getTimeGan(), zhi: ec.getTimeZhi() },
    ];
    var allZhi = pillars.map(function(p) { return p.zhi; });
    var byPillar = [[], [], [], []];
    var all = [];

    function add(name, indexes) {
      if (!all.includes(name)) all.push(name);
      indexes.forEach(function(i) {
        if (!byPillar[i].includes(name)) byPillar[i].push(name);
      });
    }

    // 以天干查四柱地支
    function ganZhiHit(map, gan, name) {
      var targets = map[gan];
      if (!targets) return;
      if (!Array.isArray(targets)) targets = [targets];
      var hits = [];
      allZhi.forEach(function(z, i) { if (targets.includes(z)) hits.push(i); });
      if (hits.length) add(name, hits);
    }

    // 以指定地支查四柱地支
    function zhiHit(map, keyZhi, name) {
      var t = map[keyZhi];
      if (!t) return;
      var hits = [];
      allZhi.forEach(function(z, i) { if (z === t) hits.push(i); });
      if (hits.length) add(name, hits);
    }

    // 以指定天干查四柱天干
    function ganHit(gan, name) {
      var hits = [];
      pillars.forEach(function(p, i) { if (p.gan === gan) hits.push(i); });
      if (hits.length) add(name, hits);
    }

    // === 日干查神煞 ===
    ganZhiHit(TIANYI, dayGan, "天乙贵人");
    ganZhiHit(WENCHANG, dayGan, "文昌贵人");
    ganZhiHit(TAIJI, dayGan, "太极贵人");
    ganZhiHit(FUXING, dayGan, "福星贵人");
    ganZhiHit(GUOYIN, dayGan, "国印贵人");
    ganZhiHit(TIANCHU, dayGan, "天厨贵人");
    ganZhiHit(XUETANG, dayGan, "学堂");
    ganZhiHit(LUSHEN, dayGan, "禄神");
    ganZhiHit(YANGREN, dayGan, "羊刃");
    ganZhiHit(HONGYAN, dayGan, "红艳");
    ganZhiHit(JINYU, dayGan, "金舆");

    // === 年干查神煞 ===
    ganZhiHit(TIANYI, yearGan, "天乙贵人");
    ganZhiHit(WENCHANG, yearGan, "文昌贵人");
    ganZhiHit(TAIJI, yearGan, "太极贵人");
    ganZhiHit(FUXING, yearGan, "福星贵人");
    ganZhiHit(GUOYIN, yearGan, "国印贵人");
    ganZhiHit(TIANCHU, yearGan, "天厨贵人");
    ganZhiHit(XUETANG, yearGan, "学堂");
    ganZhiHit(LUSHEN, yearGan, "禄神");
    ganZhiHit(YANGREN, yearGan, "羊刃");
    ganZhiHit(HONGYAN, yearGan, "红艳");
    ganZhiHit(JINYU, yearGan, "金舆");

    // === 日支查神煞 ===
    zhiHit(YIMA, dayZhi, "驿马");
    zhiHit(TAOHUA, dayZhi, "桃花");
    zhiHit(HUAGAI, dayZhi, "华盖");
    zhiHit(JIANGXING, dayZhi, "将星");
    zhiHit(JIESHA, dayZhi, "劫煞");
    zhiHit(WANGSHEN, dayZhi, "亡神");
    zhiHit(GUCHEN, dayZhi, "孤辰");
    zhiHit(GUASU, dayZhi, "寡宿");
    zhiHit(DIAOKE, dayZhi, "吊客");

    // === 年支查神煞 ===
    zhiHit(YIMA, yearZhi, "驿马");
    zhiHit(TAOHUA, yearZhi, "桃花");
    zhiHit(HUAGAI, yearZhi, "华盖");
    zhiHit(JIANGXING, yearZhi, "将星");
    zhiHit(JIESHA, yearZhi, "劫煞");
    zhiHit(WANGSHEN, yearZhi, "亡神");
    zhiHit(GUCHEN, yearZhi, "孤辰");
    zhiHit(GUASU, yearZhi, "寡宿");
    zhiHit(DIAOKE, yearZhi, "吊客");

    // === 日柱特判 ===
    if (KUIGANG[dayGz]) add("魁罡贵人", [2]);
    if (YINYANG_CHACUO[dayGz]) add("阴阳差错", [2]);
    if (SHIE_DABAI[dayGz]) add("十恶大败", [2]);

    // === 天德贵人（月支→天干）===
    var tdGan = TIANDE[monthZhi];
    if (tdGan) ganHit(tdGan, "天德贵人");

    // === 月德贵人（月支→天干）===
    var ydGan = YUEDE[monthZhi];
    if (ydGan) ganHit(ydGan, "月德贵人");

    // === 天医（月支→地支）===
    zhiHit(TIANYI_SHA, monthZhi, "天医");

    // === 天罗地网 ===
    var allSet = {};
    allZhi.forEach(function(z) { allSet[z] = true; });
    var tnHits = [];
    [yearZhi, dayZhi].forEach(function(key) {
      if (TIANLUO[key] && allSet[TIANLUO[key]]) {
        allZhi.forEach(function(z, i) { if (z === key || z === TIANLUO[key]) { if (tnHits.indexOf(i) < 0) tnHits.push(i); } });
      }
      if (DIWANG[key] && allSet[DIWANG[key]]) {
        allZhi.forEach(function(z, i) { if (z === key || z === DIWANG[key]) { if (tnHits.indexOf(i) < 0) tnHits.push(i); } });
      }
    });
    if (tnHits.length) add("天罗地网", tnHits);

    for (var i = 0; i < 4; i++) {
      if (!byPillar[i].length) byPillar[i] = ["—"];
    }

    return {
      all: all.length ? all : ["—"],
      byPillar: byPillar,
    };
  }

  root.Shensha = { compute: compute };
})(typeof window !== "undefined" ? window : global);
