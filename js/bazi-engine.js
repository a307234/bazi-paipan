/** 八字排盘核心 — 基于 lunar-javascript */
(function (root) {
  var GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
  var ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

  // 十神对照表（日干 vs 目标干）
  var SHISHEN_TABLE = {
    甲:{甲:"比肩",乙:"劫财",丙:"食神",丁:"伤官",戊:"偏财",己:"正财",庚:"七杀",辛:"正官",壬:"偏印",癸:"正印"},
    乙:{乙:"比肩",甲:"劫财",丁:"食神",丙:"伤官",己:"偏财",戊:"正财",辛:"七杀",庚:"正官",癸:"偏印",壬:"正印"},
    丙:{丙:"比肩",丁:"劫财",戊:"食神",己:"伤官",庚:"偏财",辛:"正财",壬:"七杀",癸:"正官",甲:"偏印",乙:"正印"},
    丁:{丁:"比肩",丙:"劫财",己:"食神",戊:"伤官",辛:"偏财",庚:"正财",癸:"七杀",壬:"正官",乙:"偏印",甲:"正印"},
    戊:{戊:"比肩",己:"劫财",庚:"食神",辛:"伤官",壬:"偏财",癸:"正财",甲:"七杀",乙:"正官",丙:"偏印",丁:"正印"},
    己:{己:"比肩",戊:"劫财",辛:"食神",庚:"伤官",癸:"偏财",壬:"正财",乙:"七杀",甲:"正官",丁:"偏印",丙:"正印"},
    庚:{庚:"比肩",辛:"劫财",壬:"食神",癸:"伤官",甲:"偏财",乙:"正财",丙:"七杀",丁:"正官",戊:"偏印",己:"正印"},
    辛:{辛:"比肩",庚:"劫财",癸:"食神",壬:"伤官",乙:"偏财",甲:"正财",丁:"七杀",丙:"正官",己:"偏印",戊:"正印"},
    壬:{壬:"比肩",癸:"劫财",甲:"食神",乙:"伤官",丙:"偏财",丁:"正财",戊:"七杀",己:"正官",庚:"偏印",辛:"正印"},
    癸:{癸:"比肩",壬:"劫财",乙:"食神",甲:"伤官",丁:"偏财",丙:"正财",己:"七杀",戊:"正官",辛:"偏印",庚:"正印"}
  };

  // 十神简要说明
  var SHISHEN_DESC = {
    "比肩":"同辈助力，竞争亦多，宜合作共赢",
    "劫财":"人际活跃，开销较大，慎防破财",
    "食神":"才华展现，口福享乐，利于创作",
    "伤官":"灵感迸发，言语犀利，谨防口舌",
    "偏财":"意外之财，投资机遇，大胆尝试",
    "正财":"稳定收入，工作进账，按部就班",
    "七杀":"压力挑战，权威压制，迎难而上",
    "正官":"事业规范，名声提升，守法自律",
    "偏印":"偏门学问，独立思考，宜深度学习",
    "正印":"贵人扶持，学业有成，利于考证",
    "日主":"本命之年，诸事反复，宜低调守成"
  };

  function liuNianDesc(dayGan, dayZhi, lnGz) {
    var lnGan = lnGz.charAt(0);
    var lnZhi = lnGz.charAt(1);
    var parts = [];
    // 天干十神
    var ss = (SHISHEN_TABLE[dayGan] || {})[lnGan];
    if (ss) parts.push(lnGan + "为" + ss + "，" + (SHISHEN_DESC[ss] || ""));
    // 地支与日支关系
    if (lnZhi === dayZhi) {
      parts.push("值太岁（本命），变动较大，宜守不宜攻");
    } else {
      var chongMap = {"子":"午","午":"子","丑":"未","未":"丑","寅":"申","申":"寅","卯":"酉","酉":"卯","辰":"戌","戌":"辰","巳":"亥","亥":"巳"};
      if (chongMap[lnZhi] === dayZhi) parts.push("冲日支，变动奔波，防突发变故");
      var heMap = {"子":"丑","丑":"子","寅":"亥","亥":"寅","卯":"戌","戌":"卯","辰":"酉","酉":"辰","巳":"申","申":"巳","午":"未","未":"午"};
      if (heMap[lnZhi] === dayZhi) parts.push("合日支，人缘和合，易得帮扶");
    }
    return parts.join("；") || "平运之年，按部就班";
  }

  function buildPillar(ec, getters, label) {
    var hide = getters.hideGan();
    var ssZhi = getters.shishenZhi();
    var canggan = hide.map(function (g, i) {
      return {
        text: g,
        shishen: ssZhi[i] || "",
      };
    });

    return {
      label: label,
      ganzhi: getters.ganzhi(),
      gan: getters.gan(),
      zhi: getters.zhi(),
      shishenGan: getters.shishenGan(),
      shishenZhi: ssZhi,
      canggan: canggan,
      xunkong: getters.xunkong(),
      nayin: getters.nayin(),
      wuxing: getters.wuxing(),
      dishi: getters.dishi ? getters.dishi() : "",
    };
  }

  function calcTrueSolarTime(year, month, day, hour, minute, lng) {
    var d = new Date(year, month - 1, day);
    var start = new Date(year, 0, 1);
    var dayOfYear = Math.floor((d - start) / (1000 * 60 * 60 * 24)) + 1;

    var B = 2 * Math.PI * (dayOfYear - 81) / 365;
    var eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);

    var lngCorrection = (lng - 120) * 4;
    var totalMinutes = hour * 60 + minute + eot + lngCorrection;

    while (totalMinutes < 0) totalMinutes += 1440;
    while (totalMinutes >= 1440) totalMinutes -= 1440;

    var correctedHour = Math.floor(totalMinutes / 60);
    var correctedMinute = Math.round(totalMinutes % 60);

    if (correctedMinute >= 60) {
      correctedHour += 1;
      correctedMinute -= 60;
    }
    if (correctedHour >= 24) correctedHour -= 24;

    return {
      hour: correctedHour,
      minute: correctedMinute,
      eot: Math.round(eot * 10) / 10,
      lngCorrection: Math.round(lngCorrection * 10) / 10,
      offsetMinutes: Math.round((eot + lngCorrection) * 10) / 10
    };
  }

  function compute(opts) {
    var year = opts.year;
    var month = opts.month;
    var day = opts.day;
    var hour = opts.hour;
    var minute = opts.minute || 0;
    var gender = opts.gender;
    var calendarType = opts.calendarType || "solar";
    var birthplace = opts.birthplace || null;
    var useTrueSolar = opts.useTrueSolar !== false;

    var solar;
    if (calendarType === "lunar") {
      var tmpLunar = Lunar.fromYmdHms(year, month, day, hour, minute, 0);
      solar = tmpLunar.getSolar();
    } else {
      solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
    }

    var trueSolarInfo = null;
    var finalHour = hour;
    var finalMinute = minute;
    if (useTrueSolar && birthplace && birthplace.lng != null) {
      trueSolarInfo = calcTrueSolarTime(
        solar.getYear(), solar.getMonth(), solar.getDay(),
        hour, minute, birthplace.lng
      );
      finalHour = trueSolarInfo.hour;
      finalMinute = trueSolarInfo.minute;
      solar = Solar.fromYmdHms(
        solar.getYear(), solar.getMonth(), solar.getDay(),
        finalHour, finalMinute, 0
      );
    }

    var isLateZi = (finalHour >= 23);
    var lunar = solar.getLunar();
    var ec = lunar.getEightChar();
    ec.setSect(2);

    var pillars = [
      buildPillar(ec, {
        ganzhi: function() { return ec.getYear(); },
        gan: function() { return ec.getYearGan(); },
        zhi: function() { return ec.getYearZhi(); },
        hideGan: function() { return ec.getYearHideGan(); },
        shishenGan: function() { return ec.getYearShiShenGan(); },
        shishenZhi: function() { return ec.getYearShiShenZhi(); },
        xunkong: function() { return ec.getYearXunKong(); },
        nayin: function() { return ec.getYearNaYin(); },
        wuxing: function() { return ec.getYearWuXing(); },
        dishi: function() { return ec.getYearDiShi(); },
      }, "年柱"),
      buildPillar(ec, {
        ganzhi: function() { return ec.getMonth(); },
        gan: function() { return ec.getMonthGan(); },
        zhi: function() { return ec.getMonthZhi(); },
        hideGan: function() { return ec.getMonthHideGan(); },
        shishenGan: function() { return ec.getMonthShiShenGan(); },
        shishenZhi: function() { return ec.getMonthShiShenZhi(); },
        xunkong: function() { return ec.getMonthXunKong(); },
        nayin: function() { return ec.getMonthNaYin(); },
        wuxing: function() { return ec.getMonthWuXing(); },
        dishi: function() { return ec.getMonthDiShi(); },
      }, "月柱"),
      buildPillar(ec, {
        ganzhi: function() { return ec.getDay(); },
        gan: function() { return ec.getDayGan(); },
        zhi: function() { return ec.getDayZhi(); },
        hideGan: function() { return ec.getDayHideGan(); },
        shishenGan: function() { return ec.getDayShiShenGan(); },
        shishenZhi: function() { return ec.getDayShiShenZhi(); },
        xunkong: function() { return ec.getDayXunKong(); },
        nayin: function() { return ec.getDayNaYin(); },
        wuxing: function() { return ec.getDayWuXing(); },
        dishi: function() { return ec.getDayDiShi(); },
      }, "日元"),
      buildPillar(ec, {
        ganzhi: function() { return ec.getTime(); },
        gan: function() { return ec.getTimeGan(); },
        zhi: function() { return ec.getTimeZhi(); },
        hideGan: function() { return ec.getTimeHideGan(); },
        shishenGan: function() { return ec.getTimeShiShenGan(); },
        shishenZhi: function() { return ec.getTimeShiShenZhi(); },
        xunkong: function() { return ec.getTimeXunKong(); },
        nayin: function() { return ec.getTimeNaYin(); },
        wuxing: function() { return ec.getTimeWuXing(); },
        dishi: function() { return ec.getTimeDiShi(); },
      }, "时柱"),
    ];

    // 晚子时处理：日柱用当日，时柱用次日日干推算时干（五鼠遁）
    if (isLateZi && finalHour >= 23) {
      var nextSolar = solar.next(1);
      var nextLunar = nextSolar.getLunar();
      var nextEc = nextLunar.getEightChar();
      nextEc.setSect(2);
      var nextDayGan = nextEc.getDayGan();

      // 五鼠遁：日上起时法
      // 甲己还加甲，乙庚丙作初，丙辛从戊起，丁壬庚子居，戊癸何方发，壬子是真途
      var wushuStart = {"甲":"甲","己":"甲", "乙":"丙","庚":"丙", "丙":"戊","辛":"戊", "丁":"庚","壬":"庚", "戊":"壬","癸":"壬"};
      var baseGan = wushuStart[nextDayGan] || "甲";
      var timeZhi = "子"; // 23点必然是子时

      // 时干 = 五鼠遁起始天干 + 时支偏移
      var baseIdx = GAN.indexOf(baseGan);
      var zhiIdx = ZHI.indexOf(timeZhi);
      var timeGan = GAN[(baseIdx + zhiIdx) % 10];

      // 更新时柱
      pillars[3].ganzhi = timeGan + timeZhi;
      pillars[3].gan = timeGan;
      pillars[3].zhi = timeZhi;
      pillars[3].label = "时柱(晚子)";

      // 重新计算时柱十神：日干对时干的关系
      var dayGanForSs = ec.getDayGan();
      var ssTable = SHISHEN_TABLE[dayGanForSs] || {};
      pillars[3].shishenGan = ssTable[timeGan] || "";
    }

    var shensha = Shensha.compute(ec);
    pillars.forEach(function(p, i) {
      p.shensha = shensha.byPillar[i];
    });

    var dayGan = ec.getDayGan();
    var dayZhi = ec.getDayZhi();
    var shengshi = (typeof Shengshi !== "undefined" && Shengshi.analyze)
      ? Shengshi.analyze({
          dayGan: dayGan,
          monthZhi: ec.getMonthZhi(),
          pillars: pillars
        })
      : null;

    var geju = Geju.analyze(ec, {
      pillars: pillars,
      shensha: shensha,
      shengshi: shengshi
    });
    var chenggu = Chenggu.compute(lunar, ec, gender);
    var genderText = gender === 1 ? "男（乾造）" : "女（坤造）";
    var shichen = BaziCalendar.hourToShichen(finalHour, finalMinute);

    // 大运流年
    var yun = ec.getYun(gender, 2);
    var daYunList = [];
    var daYunArr = yun.getDaYun(8);
    var currentYear = new Date().getFullYear();
    var liuNianCurrent = null;

    for (var i = 0; i < daYunArr.length; i++) {
      var dy = daYunArr[i];
      var liuNianArr = dy.getLiuNian(10);
      var liuNianList = [];
      for (var j = 0; j < liuNianArr.length; j++) {
        var ln = liuNianArr[j];
        var lnGz = ln.getGanZhi();
        var lnItem = {
          year: ln.getYear(),
          age: ln.getAge(),
          ganzhi: lnGz,
          desc: liuNianDesc(dayGan, dayZhi, lnGz)
        };
        liuNianList.push(lnItem);
        if (ln.getYear() === currentYear) {
          liuNianCurrent = lnItem;
          liuNianCurrent.daYunIndex = i;
        }
      }
      daYunList.push({
        index: i,
        startAge: dy.getStartAge(),
        endAge: dy.getEndAge(),
        startYear: dy.getStartYear(),
        endYear: dy.getEndYear(),
        ganzhi: dy.getGanZhi(),
        liuNian: liuNianList,
        isCurrent: (currentYear >= dy.getStartYear() && currentYear <= dy.getEndYear())
      });
    }

    return {
      solar: { year: solar.getYear(), month: solar.getMonth(), day: solar.getDay(), hour: finalHour, minute: finalMinute },
      solarOriginal: { year: year, month: month, day: day, hour: hour, minute: minute },
      lunar: {
        text: lunar.toString(),
        full: lunar.getYearInGanZhi() + "年 " + lunar.getMonthInChinese() + "月" + lunar.getDayInChinese(),
      },
      gender: gender,
      genderText: genderText,
      calendarType: calendarType,
      shichen: shichen,
      isLateZi: isLateZi,
      trueSolarInfo: trueSolarInfo,
      birthplace: birthplace,
      pillars: pillars,
      shenshaAll: shensha.all,
      geju: geju,
      shengshi: shengshi,
      ganNotes: [],
      zhiNotes: [],
      chenggu: chenggu,
      yun: {
        startYear: yun.getStartYear(),
        startMonth: yun.getStartMonth(),
        startDay: yun.getStartDay(),
        isForward: yun.isForward(),
        daYun: daYunList,
        liuNianCurrent: liuNianCurrent
      },
      meta: {
        shengxiao: lunar.getYearShengXiao(),
        jieqi: lunar.getJieQi() || "",
        taiyuan: ec.getTaiYuan(),
        minggong: ec.getMingGong(),
        shengong: ec.getShenGong(),
      },
    };
  }

  root.BaziEngine = { compute: compute };
})(typeof window !== "undefined" ? window : global);
