/** 格局简析 — 以月令本气与日主关系为主 */
(function (root) {
  const SHISHEN_NAME = {
    比肩: "比劫", 劫财: "比劫", 食神: "食伤", 伤官: "食伤",
    偏财: "财", 正财: "财", 七杀: "官杀", 正官: "官杀",
    偏印: "印", 正印: "印",
  };

  const GAN_WX = {
    甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土", 己: "土",
    庚: "金", 辛: "金", 壬: "水", 癸: "水",
  };

  const ZHI_WX = {
    子: "水", 丑: "土", 寅: "木", 卯: "木", 辰: "土", 巳: "火",
    午: "火", 未: "土", 申: "金", 酉: "金", 戌: "土", 亥: "水",
  };

  const HIDE_GAN = {
    子: ["癸"], 丑: ["己", "癸", "辛"], 寅: ["甲", "丙", "戊"], 卯: ["乙"],
    辰: ["戊", "乙", "癸"], 巳: ["丙", "戊", "庚"], 午: ["丁", "己"], 未: ["己", "丁", "乙"],
    申: ["庚", "壬", "戊"], 酉: ["辛"], 戌: ["戊", "辛", "丁"], 亥: ["壬", "甲"],
  };

  const SHISHEN_TABLE = {
    甲: { 甲: "比肩", 乙: "劫财", 丙: "食神", 丁: "伤官", 戊: "偏财", 己: "正财", 庚: "七杀", 辛: "正官", 壬: "偏印", 癸: "正印" },
    乙: { 乙: "比肩", 甲: "劫财", 丁: "食神", 丙: "伤官", 己: "偏财", 戊: "正财", 辛: "七杀", 庚: "正官", 癸: "偏印", 壬: "正印" },
    丙: { 丙: "比肩", 丁: "劫财", 戊: "食神", 己: "伤官", 庚: "偏财", 辛: "正财", 壬: "七杀", 癸: "正官", 甲: "偏印", 乙: "正印" },
    丁: { 丁: "比肩", 丙: "劫财", 己: "食神", 戊: "伤官", 辛: "偏财", 庚: "正财", 癸: "七杀", 壬: "正官", 乙: "偏印", 甲: "正印" },
    戊: { 戊: "比肩", 己: "劫财", 庚: "食神", 辛: "伤官", 壬: "偏财", 癸: "正财", 甲: "七杀", 乙: "正官", 丙: "偏印", 丁: "正印" },
    己: { 己: "比肩", 戊: "劫财", 辛: "食神", 庚: "伤官", 癸: "偏财", 壬: "正财", 乙: "七杀", 甲: "正官", 丁: "偏印", 丙: "正印" },
    庚: { 庚: "比肩", 辛: "劫财", 壬: "食神", 癸: "伤官", 甲: "偏财", 乙: "正财", 丙: "七杀", 丁: "正官", 戊: "偏印", 己: "正印" },
    辛: { 辛: "比肩", 庚: "劫财", 癸: "食神", 壬: "伤官", 乙: "偏财", 甲: "正财", 丁: "七杀", 丙: "正官", 己: "偏印", 戊: "正印" },
    壬: { 壬: "比肩", 癸: "劫财", 甲: "食神", 乙: "伤官", 丙: "偏财", 丁: "正财", 戊: "七杀", 己: "正官", 庚: "偏印", 辛: "正印" },
    癸: { 癸: "比肩", 壬: "劫财", 乙: "食神", 甲: "伤官", 丁: "偏财", 丙: "正财", 己: "七杀", 戊: "正官", 辛: "偏印", 庚: "正印" },
  };

  function getShiShen(dayGan, targetGan) {
    return (SHISHEN_TABLE[dayGan] || {})[targetGan] || "";
  }

  function analyze(ec) {
    const dayGan = ec.getDayGan();
    const monthZhi = ec.getMonthZhi();
    const monthGan = ec.getMonthGan();
    const hide = HIDE_GAN[monthZhi] || [];
    const benqi = hide[0];
    const benqiSS = benqi ? getShiShen(dayGan, benqi) : "";
    const monthGanSS = getShiShen(dayGan, monthGan);

    const lines = [];
    lines.push(`日主${dayGan}${GAN_WX[dayGan]}，生于${monthZhi}月（月令${ZHI_WX[monthZhi]}旺）`);

    if (benqiSS) {
      lines.push(`月令本气${benqi}，相对日主为「${benqiSS}」`);
      const ge = benqiSS === "正官" ? "正官格" : benqiSS === "七杀" ? "七杀格" :
        benqiSS === "正财" ? "正财格" : benqiSS === "偏财" ? "偏财格" :
        benqiSS === "正印" ? "正印格" : benqiSS === "偏印" ? "偏印格" :
        benqiSS === "食神" ? "食神格" : benqiSS === "伤官" ? "伤官格" :
        benqiSS === "比肩" ? "比劫月旺" : benqiSS === "劫财" ? "劫财月旺" : `${benqiSS}当令`;
      lines.push(`倾向格局：${ge}（须结合透干、通根再论）`);
    }

    if (monthGanSS && monthGanSS !== benqiSS) {
      lines.push(`月干${monthGan}透${monthGanSS}，与月令本气${benqiSS ? "并看" : "参用"}`);
    }

    const tonggen = [ec.getYearZhi(), ec.getDayZhi(), ec.getTimeZhi()].filter((z) => ZHI_WX[z] === GAN_WX[dayGan]);
    if (tonggen.length) {
      lines.push(`日主在${tonggen.join("、")}有根，身势${tonggen.length >= 2 ? "偏强" : "中等"}`);
    } else {
      lines.push("日主四柱少同类根气，身势偏弱，宜印比扶助");
    }

    const cat = SHISHEN_NAME[benqiSS] || "杂气";
    lines.push(`五行侧重：月令属${cat}系，宜平衡${GAN_WX[dayGan]}气之太过与不足`);

    return lines;
  }

  root.Geju = { analyze };
})(typeof window !== "undefined" ? window : global);
