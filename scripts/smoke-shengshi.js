/* quick smoke test for shengshi + engine */
var fs = require("fs");
var vm = require("vm");
var ctx = { console: console, Date: Date, Math: Math };
ctx.window = ctx;
ctx.global = ctx;
vm.createContext(ctx);
[
  "lib/lunar.js",
  "js/calendar.js",
  "js/shengshi.js",
  "js/shensha.js",
  "js/geju.js",
  "js/chenggu.js",
  "js/bazi-engine.js"
].forEach(function (f) {
  vm.runInContext(fs.readFileSync(f, "utf8"), ctx);
});

var r = ctx.BaziEngine.compute({
  year: 1990, month: 5, day: 15, hour: 12, minute: 0,
  gender: 1, calendarType: "solar",
  birthplace: { name: "北京", lng: 116.4, lat: 39.9 },
  useTrueSolar: false
});

console.log("pillars:", r.pillars.map(function (p) { return p.ganzhi; }).join(" "));
console.log("level:", r.shengshi.level);
console.log("xi:", r.shengshi.xiYong.join("、"), "| ji:", r.shengshi.jiShen.join("、"));
console.log("percent:", JSON.stringify(r.shengshi.percent));
console.log("flags:", JSON.stringify(r.shengshi.flags));
console.log("yun:", r.yun.startYear + "-" + r.yun.startMonth + "-" + r.yun.startDay, r.yun.isForward ? "顺" : "逆");
console.log("dayun:", r.yun.daYun.slice(0, 4).map(function (d) {
  return d.ganzhi + "(" + d.startAge + "岁/" + d.startYear + ")";
}).join(" "));
