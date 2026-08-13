/** Smoke tests for recent optimizations */
var assert = require("assert");
var path = require("path");
var root = path.join(__dirname, "..");
var L = require(path.join(root, "lib/lunar.js"));
global.Solar = L.Solar;
global.Lunar = L.Lunar;
global.LunarYear = L.LunarYear;

function load(p) {
  var fs = require("fs");
  var vm = require("vm");
  var full = path.join(root, p);
  vm.runInThisContext(fs.readFileSync(full, "utf8"), { filename: full });
}

[
  "js/wx-data.js",
  "js/cities.js",
  "js/calendar.js",
  "js/shensha.js",
  "js/relations.js",
  "js/geju.js",
  "js/shengshi.js",
  "js/chenggu.js",
  "js/bazi-engine.js"
].forEach(load);

var passed = 0;
function ok(name) {
  passed++;
  console.log("OK  " + name);
}

// 1 city matching
assert.strictEqual(BaziCities.find("长"), null, "short prefix must not bind");
assert.ok(BaziCities.findMatches("长", 5).length > 1);
assert.strictEqual(BaziCities.find("长沙").n, "长沙");
assert.strictEqual(BaziCities.findExact("长沙").n, "长沙");
ok("city exact / ambiguous");

// 2 leap month
assert.strictEqual(BaziCalendar.leapMonthOfYear(2023), 2);
var normal = BaziEngine.compute({
  year: 2023, month: 2, day: 1, hour: 12, minute: 0, gender: 1,
  calendarType: "lunar", lunarLeap: false, useTrueSolar: false
});
var leap = BaziEngine.compute({
  year: 2023, month: 2, day: 1, hour: 12, minute: 0, gender: 1,
  calendarType: "lunar", lunarLeap: true, useTrueSolar: false
});
assert.ok(normal.lunar.full.indexOf("闰") < 0);
assert.ok(leap.lunar.full.indexOf("闰") >= 0);
assert.notStrictEqual(
  normal.pillars.map(function (p) { return p.ganzhi; }).join(""),
  leap.pillars.map(function (p) { return p.ganzhi; }).join("")
);
ok("lunar leap month differs from normal");

// 3 true solar without city should not crash
var noCity = BaziEngine.compute({
  year: 1991, month: 8, day: 14, hour: 12, minute: 0, gender: 1,
  calendarType: "solar", useTrueSolar: true, birthplace: null
});
assert.ok(noCity.pillars && noCity.pillars.length === 4);
ok("true solar with null birthplace safe");

// 4 shared wx data
assert.strictEqual(BaziWxData.GAN_WX["甲"], "木");
assert.strictEqual(BaziWxData.ZHI_WX["子"], "水");
ok("wx-data shared constants");

// 5 full chart + geju/shengshi/relations
var r = BaziEngine.compute({
  year: 1991, month: 8, day: 14, hour: 12, minute: 0, gender: 1,
  calendarType: "solar", useTrueSolar: false,
  birthplace: { name: "长沙", lng: 113.0, lat: 28.2, n: "长沙", p: "湖南" }
});
assert.ok(r.shengshi && r.shengshi.level);
assert.ok(r.geju && r.geju.glance);
assert.ok(r.geju.yiYi.rows.some(function (row) { return row.label === "行业"; }));
assert.ok(r.geju.yiYi.rows.every(function (row) { return row.label.indexOf("适宜") !== 0; }));
var pack = Relations.fromPillars(r.pillars, r.shengshi);
assert.ok(pack.natalCards);
var card = pack.natalCards[0];
if (card) {
  assert.ok((card.plain || "").indexOf("【身势】") < 0, "plain should not embed 身势");
}
ok("chart + geju labels + relations plain");

// 6 shengshi lines slim
assert.ok(r.shengshi.lines.length <= 2);
ok("shengshi lines slim");

// 7 vsExternal with shengshi
var n = r.pillars.map(function (p) { return p.gan; });
var z = r.pillars.map(function (p) { return p.zhi; });
var yun = Relations.vsExternalCards(n, z, "壬", "申", "liunian", "流年", r.shengshi);
assert.ok(Array.isArray(yun));
ok("relations vsExternal");

console.log("\nAll " + passed + " checks passed.");
