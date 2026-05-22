/** 月历：节气、农历、日干支 */
(function (root) {
  const WEEK = ["日", "一", "二", "三", "四", "五", "六"];

  function daysInMonth(y, m) {
    return new Date(y, m, 0).getDate();
  }

  function buildMonth(year, month) {
    const total = daysInMonth(year, month);
    const first = new Date(year, month - 1, 1);
    const startPad = first.getDay();
    const cells = [];

    for (let i = 0; i < startPad; i++) {
      cells.push({ empty: true });
    }

    for (let d = 1; d <= total; d++) {
      const solar = Solar.fromYmd(year, month, d);
      const lunar = solar.getLunar();
      const jq = lunar.getJieQi();
      const lunarText = lunar.getMonthInChinese() + "月" + lunar.getDayInChinese();
      let dayGz;
      try {
        const ec = lunar.getEightChar();
        ec.setSect(2);
        dayGz = ec.getDay();
      } catch (e) {
        dayGz = lunar.getDayInGanZhi();
      }
      cells.push({
        empty: false,
        year,
        month,
        day: d,
        jieqi: jq || "",
        lunar: lunarText,
        lunarShort: lunar.getDayInChinese(),
        rgz: dayGz,
        solar,
        lunarObj: lunar,
        isToday: isToday(year, month, d),
      });
    }
    return { year, month, cells, weekLabels: WEEK };
  }

  function isToday(y, m, d) {
    const n = new Date();
    return n.getFullYear() === y && n.getMonth() + 1 === m && n.getDate() === d;
  }

  const SHICHEN = [
    { name: "子时", range: "23:00–00:59", zhi: "子", hour: 0 },
    { name: "丑时", range: "01:00–02:59", zhi: "丑", hour: 1 },
    { name: "寅时", range: "03:00–04:59", zhi: "寅", hour: 3 },
    { name: "卯时", range: "05:00–06:59", zhi: "卯", hour: 5 },
    { name: "辰时", range: "07:00–08:59", zhi: "辰", hour: 7 },
    { name: "巳时", range: "09:00–10:59", zhi: "巳", hour: 9 },
    { name: "午时", range: "11:00–12:59", zhi: "午", hour: 11 },
    { name: "未时", range: "13:00–14:59", zhi: "未", hour: 13 },
    { name: "申时", range: "15:00–16:59", zhi: "申", hour: 15 },
    { name: "酉时", range: "17:00–18:59", zhi: "酉", hour: 17 },
    { name: "戌时", range: "19:00–20:59", zhi: "戌", hour: 19 },
    { name: "亥时", range: "21:00–22:59", zhi: "亥", hour: 21 },
  ];

  function hourToShichen(h, min) {
    const hm = h + (min || 0) / 60;
    if (hm >= 23 || hm < 1) return SHICHEN[0];
    if (hm < 3) return SHICHEN[1];
    if (hm < 5) return SHICHEN[2];
    if (hm < 7) return SHICHEN[3];
    if (hm < 9) return SHICHEN[4];
    if (hm < 11) return SHICHEN[5];
    if (hm < 13) return SHICHEN[6];
    if (hm < 15) return SHICHEN[7];
    if (hm < 17) return SHICHEN[8];
    if (hm < 19) return SHICHEN[9];
    if (hm < 21) return SHICHEN[10];
    return SHICHEN[11];
  }

  root.BaziCalendar = {
    buildMonth,
    SHICHEN,
    hourToShichen,
    WEEK,
  };
})(typeof window !== "undefined" ? window : global);
