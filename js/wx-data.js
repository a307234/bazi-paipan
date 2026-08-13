/** 五行干支公共常量 — 供各模块共用，避免口径漂移 */
(function (root) {
  var GAN_WX = {
    甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土", 己: "土",
    庚: "金", 辛: "金", 壬: "水", 癸: "水"
  };
  var ZHI_WX = {
    子: "水", 丑: "土", 寅: "木", 卯: "木", 辰: "土", 巳: "火",
    午: "火", 未: "土", 申: "金", 酉: "金", 戌: "土", 亥: "水"
  };
  var WX_ORDER = ["木", "火", "土", "金", "水"];
  var WUXING_COLOR = {
    木: "#2ecc71",
    火: "#e74c3c",
    土: "#f39c12",
    金: "#f1c40f",
    水: "#3498db"
  };

  root.BaziWxData = {
    GAN_WX: GAN_WX,
    ZHI_WX: ZHI_WX,
    WX_ORDER: WX_ORDER,
    WUXING_COLOR: WUXING_COLOR
  };
})(typeof window !== "undefined" ? window : global);
