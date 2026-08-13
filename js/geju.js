/** 命格综评 — 格局 / 十神 / 神煞 / 适宜参考（白话） */
(function (root) {
  var _wx = root.BaziWxData || {};
  var GAN_WX = _wx.GAN_WX || {
    甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土", 己: "土",
    庚: "金", 辛: "金", 壬: "水", 癸: "水"
  };

  var MONTH_NAME = {
    子: "仲冬", 丑: "季冬", 寅: "孟春", 卯: "仲春", 辰: "季春", 巳: "孟夏",
    午: "仲夏", 未: "季夏", 申: "孟秋", 酉: "仲秋", 戌: "季秋", 亥: "孟冬"
  };

  var HIDE_GAN = {
    子: ["癸"], 丑: ["己", "癸", "辛"], 寅: ["甲", "丙", "戊"], 卯: ["乙"],
    辰: ["戊", "乙", "癸"], 巳: ["丙", "戊", "庚"], 午: ["丁", "己"], 未: ["己", "丁", "乙"],
    申: ["庚", "壬", "戊"], 酉: ["辛"], 戌: ["戊", "辛", "丁"], 亥: ["壬", "甲"]
  };

  var SHISHEN_TABLE = {
    甲: { 甲: "比肩", 乙: "劫财", 丙: "食神", 丁: "伤官", 戊: "偏财", 己: "正财", 庚: "七杀", 辛: "正官", 壬: "偏印", 癸: "正印" },
    乙: { 乙: "比肩", 甲: "劫财", 丁: "食神", 丙: "伤官", 己: "偏财", 戊: "正财", 辛: "七杀", 庚: "正官", 癸: "偏印", 壬: "正印" },
    丙: { 丙: "比肩", 丁: "劫财", 戊: "食神", 己: "伤官", 庚: "偏财", 辛: "正财", 壬: "七杀", 癸: "正官", 甲: "偏印", 乙: "正印" },
    丁: { 丁: "比肩", 丙: "劫财", 己: "食神", 戊: "伤官", 辛: "偏财", 庚: "正财", 癸: "七杀", 壬: "正官", 乙: "偏印", 甲: "正印" },
    戊: { 戊: "比肩", 己: "劫财", 庚: "食神", 辛: "伤官", 壬: "偏财", 癸: "正财", 甲: "七杀", 乙: "正官", 丙: "偏印", 丁: "正印" },
    己: { 己: "比肩", 戊: "劫财", 辛: "食神", 庚: "伤官", 癸: "偏财", 壬: "正财", 乙: "七杀", 甲: "正官", 丁: "偏印", 丙: "正印" },
    庚: { 庚: "比肩", 辛: "劫财", 壬: "食神", 癸: "伤官", 甲: "偏财", 乙: "正财", 丙: "七杀", 丁: "正官", 戊: "偏印", 己: "正印" },
    辛: { 辛: "比肩", 庚: "劫财", 癸: "食神", 壬: "伤官", 乙: "偏财", 甲: "正财", 丁: "七杀", 丙: "正官", 己: "偏印", 戊: "正印" },
    壬: { 壬: "比肩", 癸: "劫财", 甲: "食神", 乙: "伤官", 丙: "偏财", 丁: "正财", 戊: "七杀", 己: "正官", 庚: "偏印", 辛: "正印" },
    癸: { 癸: "比肩", 壬: "劫财", 乙: "食神", 甲: "伤官", 丁: "偏财", 丙: "正财", 己: "七杀", 戊: "正官", 辛: "偏印", 庚: "正印" }
  };

  var SS_TO_GE = {
    "正官": "正官格", "七杀": "七杀格",
    "正财": "正财格", "偏财": "偏财格",
    "正印": "正印格", "偏印": "偏印格",
    "食神": "食神格", "伤官": "伤官格",
    "比肩": "建禄格", "劫财": "劫财格"
  };

  /** 格局大类（面诊口述用） */
  var GE_CATEGORY = {
    "正官格": { cat: "官杀类", catFull: "官杀类 · 正格", family: "官", focus: "名分、规则、责任" },
    "七杀格": { cat: "官杀类", catFull: "官杀类 · 正格", family: "杀", focus: "压力、挑战、权威" },
    "正财格": { cat: "财星类", catFull: "财星类 · 正格", family: "财", focus: "正当财禄、积蓄" },
    "偏财格": { cat: "财星类", catFull: "财星类 · 正格", family: "财", focus: "机会财、流动财" },
    "正印格": { cat: "印星类", catFull: "印星类 · 正格", family: "印", focus: "学业、贵人、庇护" },
    "偏印格": { cat: "印星类", catFull: "印星类 · 正格", family: "印", focus: "偏门专精、独立思考" },
    "食神格": { cat: "食伤类", catFull: "食伤类 · 正格", family: "食", focus: "才华、表达、口福" },
    "伤官格": { cat: "食伤类", catFull: "食伤类 · 正格", family: "伤", focus: "锋芒、创意、突破" },
    "建禄格": { cat: "禄刃类", catFull: "禄刃类 · 正格", family: "禄", focus: "自立、执行、本体气势" },
    "劫财格": { cat: "禄刃类", catFull: "禄刃类 · 正格", family: "刃", focus: "争夺、分财、社交热" }
  };

  /** 破格/成格检查用的十神对抗关系 */
  var GE_BREAK_CHECKS = {
    "正官格": {
      breakSs: ["伤官"],
      breakTip: "伤官见官：锋芒冲名分，易顶撞规则、损职级口碑",
      helpSs: ["印", "财"],
      helpTip: "印护官、财生官，格清更易得名分"
    },
    "七杀格": {
      breakSs: [],
      breakTip: "杀重无制无化，易成高压攻身",
      needCtrl: true,
      helpSs: ["食神", "伤官", "印"],
      helpTip: "食伤制杀或印化杀，七杀方成权威可用"
    },
    "正财格": {
      breakSs: ["比肩", "劫财"],
      breakTip: "比劫夺财：争竞分财、合伙易散财",
      helpSs: ["官", "食"],
      helpTip: "身旺有官护财、或食伤生财更稳"
    },
    "偏财格": {
      breakSs: ["比肩", "劫财"],
      breakTip: "比劫夺财：机会财易被分、花销失控",
      helpSs: ["官", "食"],
      helpTip: "身能任财且有制比，偏财方成气候"
    },
    "正印格": {
      breakSs: ["正财", "偏财"],
      breakTip: "财星破印：学业靠山、资质平台易受冲",
      helpSs: ["官"],
      helpTip: "官印相生，印格更清贵"
    },
    "偏印格": {
      breakSs: ["正财", "偏财"],
      breakTip: "财破枭印：专注与贵人线易被物质事务打断",
      helpSs: ["官", "杀"],
      helpTip: "杀印相生，专精路线更稳"
    },
    "食神格": {
      breakSs: ["偏印"],
      breakTip: "枭神夺食：才华表达被压抑、思路易卡",
      helpSs: ["财"],
      helpTip: "食神生财，才华易变现"
    },
    "伤官格": {
      breakSs: ["正官"],
      breakTip: "伤官见官：才气冲名分，口舌官非风险升",
      helpSs: ["财", "印"],
      helpTip: "伤官生财或印制伤，锋芒可转成成果"
    },
    "建禄格": {
      breakSs: [],
      breakTip: "有禄无用：身旺无财官食伤可任，易空旺",
      needYong: true,
      helpSs: ["财", "官", "食", "伤"],
      helpTip: "禄旺宜任财官或泄秀，方有用武之地"
    },
    "劫财格": {
      breakSs: [],
      breakTip: "劫旺无制：分财争竞过重，合作易伤",
      needYong: true,
      helpSs: ["财", "官", "食"],
      helpTip: "有财可夺之象但需官制约，或泄秀成才"
    }
  };

  var GE_INFO = {
    "正官格": {
      mean: "命局主色调偏规矩、责任、名分。做事常要对齐规则与上级期待。",
      how: "以月令本气相对日主为「正官」取格：月令之气克身且阴阳异性，名分、约束成为命局主旋律。",
      pros: ["有规则意识，易获组织信任", "适合走正规路径与长期积累", "责任心强，易得职级名分"],
      cons: ["压力与约束感偏重", "过刚易压抑自我", "逢伤官冲克时名分易受冲击"],
      jobs: ["公共管理", "体制内", "企业管理", "法律合规", "教育教务", "项目管理"]
    },
    "七杀格": {
      mean: "命局主色调偏压力、挑战、竞争。环境推着你成长，也容易紧迫。",
      how: "以月令本气相对日主为「七杀」取格：月令克身且阴阳同性，压力与竞争成为主色调。",
      pros: ["抗压与爆发力强", "适合攻坚、突破、非常规挑战", "成则可立权威"],
      cons: ["长期高压易躁、易伤", "身弱时官杀攻身更明显", "需印星化杀或食伤制杀才稳"],
      jobs: ["军警安保", "应急处理", "竞技体育", "外科医护", "销售攻坚", "创业开拓"]
    },
    "正财格": {
      mean: "命局主色调偏踏实求财、稳定收入。钱财多靠本职与积累。",
      how: "以月令本气相对日主为「正财」取格：月令为我所克且阴阳异性，正当财禄成为主旋律。",
      pros: ["求财踏实，利于积蓄置业", "对现实利益敏感度高", "适合细水长流的经营"],
      cons: ["身弱时财多身弱、为钱所累", "过俭或过虑金钱", "投机心太重则破格"],
      jobs: ["财务会计", "实业经营", "银行保险", "采购供应链", "稳健销售"]
    },
    "偏财格": {
      mean: "命局主色调偏机会财、流动性。对商机与人脉变现更敏感。",
      how: "以月令本气相对日主为「偏财」取格：月令为我所克且阴阳同性，机会财、横财象更突出。",
      pros: ["嗅觉活，人脉与商机转化快", "适合商务拓展与多元收入", "手面宽、场面感强"],
      cons: ["开销大、钱来钱去", "身弱难任财", "忌赌性投机、无纪律扩张"],
      jobs: ["贸易商务", "投资理财", "商务拓展", "中介经纪", "多元副业"]
    },
    "正印格": {
      mean: "命局主色调偏学习、庇护、贵人。易得平台与长辈支持。",
      how: "以月令本气相对日主为「正印」取格：月令生日主且阴阳异性，生扶、庇护、学业成为主气。",
      pros: ["利于进修、考证、借平台", "贵人与长辈缘较好", "心性偏稳，有靠山感"],
      cons: ["身强印多易懒散依赖", "名誉事务缠身", "逢财破印时学业靠山受冲"],
      jobs: ["教育培训", "文化出版", "咨询顾问", "研究文职", "品牌公关"]
    },
    "偏印格": {
      mean: "命局主色调偏独立思考、偏门专长。兴趣常不走常规赛道。",
      how: "以月令本气相对日主为「偏印」取格：月令生日主且阴阳同性，偏门学问、独特思路成主调。",
      pros: ["适合专精冷门与研究", "独立思考、非常规解题", "技艺路线可走深"],
      cons: ["易孤僻、学而不化", "身强印多更懒散", "人际上略清冷"],
      jobs: ["技术研发", "设计策划", "信息技术", "小众专业", "文化玄学兴趣向"]
    },
    "食神格": {
      mean: "命局主色调偏才华、表达、享乐。审美与动手创作往往不弱。",
      how: "以月令本气相对日主为「食神」取格：月令为日主所生且阴阳同性，泄秀、才华、口福成主气。",
      pros: ["表达与审美力较好", "利于技艺、内容、生活美学变现", "心态相对和缓"],
      cons: ["身弱再泄易虚", "享乐过度损进取", "才华若不落地则空转"],
      jobs: ["餐饮美食", "艺术设计", "内容创作", "自由职业", "生活美学"]
    },
    "伤官格": {
      mean: "命局主色调偏锋芒、点子多、不喜死板约束。悟性高也易直言。",
      how: "以月令本气相对日主为「伤官」取格：月令为日主所生且阴阳异性，才气锋芒、叛逆表达成主调。",
      pros: ["创意与悟性高", "适合创新、表达、技术突破", "不服输、推进力强"],
      cons: ["易顶撞规则与权威", "言语伤人、人际关系摩擦", "身弱更易怀才不遇"],
      jobs: ["创意传媒", "互联网产品", "演艺表演", "技术创新", "自由表达"]
    },
    "建禄格": {
      mean: "月令日主同类当令，自身气场偏强，独立好胜，不爱求人。",
      how: "以月令本气与日主同为「比肩」取格（建禄）：月令日主临官得禄，自身气势当令。",
      pros: ["独立自主、执行力强", "不爱求人，适合自立门户", "身强时更能任财官"],
      cons: ["过刚易孤立、争竞", "合伙易分财分权", "身过旺需克泄才平衡"],
      jobs: ["自主创业", "技术骨干", "销售开拓", "自由执业", "强执行岗位"]
    },
    "劫财格": {
      mean: "月令偏争夺、分财、社交活跃。人缘热闹，花销与竞争感也强。",
      how: "以月令本气相对日主为「劫财」取格：月令与日主同五行而阴阳异性，争夺、分财、社交热成主气。",
      pros: ["人缘活、团队作战力强", "适合人脉型商务", "身弱时劫财可助身"],
      cons: ["开销大、易分财", "感情金钱边界易糊", "争竞心重伤合作"],
      jobs: ["合伙生意", "团队销售", "活动运营", "社交商务", "人脉型岗位"]
    }
  };

  var WX_JOBS = {
    木: ["教育文化", "出版传媒", "家具园艺", "服装纺织"],
    火: ["能源电力", "餐饮娱乐", "影视广告", "光电科技"],
    土: ["房地产", "建筑建材", "农业土产", "中介咨询"],
    金: ["金融银行", "法律军警", "五金机械", "汽车制造"],
    水: ["物流航运", "旅游酒店", "水利环保", "互联网资讯"]
  };

  var WX_COLORS = {
    木: ["青绿", "翠绿", "墨绿"],
    火: ["朱红", "橙红", "紫"],
    土: ["米黄", "土黄", "棕"],
    金: ["白", "金", "银灰"],
    水: ["黑", "深蓝", "玄青"]
  };

  var WX_NUMBERS = {
    木: ["3", "8"],
    火: ["2", "7"],
    土: ["5", "0"],
    金: ["4", "9"],
    水: ["1", "6"]
  };

  // 喜用五行 → 适宜生肖（地支五行）
  var WX_SHENGXIAO = {
    木: ["虎", "兔"],
    火: ["蛇", "马"],
    土: ["牛", "龙", "羊", "狗"],
    金: ["猴", "鸡"],
    水: ["鼠", "猪"]
  };

  // 喜用五行 → 西洋星座（火土风水四象；金并入理性土/风）
  var WX_ZODIAC = {
    木: ["双子座", "天秤座", "水瓶座"],
    火: ["白羊座", "狮子座", "射手座"],
    土: ["金牛座", "处女座", "摩羯座"],
    金: ["处女座", "摩羯座", "天秤座"],
    水: ["巨蟹座", "天蝎座", "双鱼座"]
  };

  var WX_ATTR = {
    木: "木属/木命",
    火: "火属/火命",
    土: "土属/土命",
    金: "金属/金命",
    水: "水属/水命"
  };

  var SS_PLAIN = {
    "比肩": "同辈助力，也有竞争",
    "劫财": "人缘活、开销大，防分财",
    "食神": "才华口福，表达欲强",
    "伤官": "点子多、说话直，防顶撞",
    "偏财": "机会财、手面宽",
    "正财": "稳定进账、踏实理财",
    "七杀": "压力挑战，逼你变强",
    "正官": "规则名分，责任约束",
    "偏印": "偏门学问，独立思考",
    "正印": "贵人学业，庇护支持",
    "日主": "本命自身"
  };

  // 十神详解：来源 / 影响 / 化解·用法（随身强弱变化）
  var SHISHEN_DETAIL = {
    "比肩": {
      from: "与日主同五行、同阴阳。例：日主甲，见另一甲。",
      effect: {
        强: "再增同类，易固执、争竞、分财，朋友同事抢戏。",
        弱: "如同援兵，增强自信与行动力，利于自立。",
        中: "自主与竞争并存，把握分寸即可。"
      },
      resolve: {
        强: "化解：用官杀制约、用食伤泄秀；合伙先定规则，钱财分开算。",
        弱: "用法：多与同辈协作、打出名号；适合需要魄力的岗位。",
        中: "用法：独立承担一块业务，同时保留协商空间。"
      }
    },
    "劫财": {
      from: "与日主同五行、阴阳不同。例：日主甲，见乙。",
      effect: {
        强: "开销大、人缘热闹也易分财，争夺感强。",
        弱: "助力明显，人脉能变成资源，推动行动。",
        中: "社交活跃，花销与机会同在。"
      },
      resolve: {
        强: "化解：预算分账、少冲动合伙；感情金钱边界划清。",
        弱: "用法：借人脉办事、团队作战；把热闹变成订单。",
        中: "用法：社交有主题，消费有上限。"
      }
    },
    "食神": {
      from: "日主所生、阴阳相同。例：日主甲，见丙（木生火，同阳）。",
      effect: {
        强: "泄身有功：才华、口福、表达顺，易落地成作品。",
        弱: "再泄易虚：想法多、力气不够，说完就累。",
        中: "创意与享受欲适中，适合把兴趣做成技能。"
      },
      resolve: {
        强: "用法：写作、技艺、餐饮审美类输出；把爱好产品化。",
        弱: "化解：先补印比再求表现；少空耗口舌，做一件成一件。",
        中: "用法：固定输出节奏，别只停留在舒服区。"
      }
    },
    "伤官": {
      from: "日主所生、阴阳不同。例：日主甲，见丁。",
      effect: {
        强: "锋芒、点子多，利于创新；也易顶撞规则、言语伤人。",
        弱: "心高气傲但支撑不足，易怀才不遇或因直言吃亏。",
        中: "悟性高、不服输，表达需带一点礼貌。"
      },
      resolve: {
        强: "用法：创意、技术、表达类工作；关键场合先想后果再开口。",
        弱: "化解：用印星制伤、先立身再逞才；少在气头上决策。",
        中: "用法：锋芒用在作品上，对人留余地。"
      }
    },
    "偏财": {
      from: "日主所克、阴阳相同。例：日主甲，见戊（木克土）。",
      effect: {
        强: "身能任财：机会财、人脉财更易抓到。",
        弱: "财多身弱：目标多却扛不住，易为钱所累。",
        中: "手面宽、求财活，需量力。"
      },
      resolve: {
        强: "用法：商务拓展、投资机会可积极评估；分散风险。",
        弱: "化解：先稳定主业与积蓄；大额机会冷静期，忌加杠杆硬上。",
        中: "用法：正偏财搭配，投机比例设上限。"
      }
    },
    "正财": {
      from: "日主所克、阴阳不同。例：日主甲，见己。",
      effect: {
        强: "稳定进账、理财踏实，利于置业与长期规划。",
        弱: "求财心切但体力/资源不够，易焦虑。",
        中: "重视现实利益，按部就班较舒服。"
      },
      resolve: {
        强: "用法：本职深耕、稳健理财、置业规划。",
        弱: "化解：降低不必要开支；先提升能力再谈扩财。",
        中: "用法：记账+目标储蓄，细水长流。"
      }
    },
    "七杀": {
      from: "克日主、阴阳相同。例：日主甲，见庚（金克木）。",
      effect: {
        强: "压力可化为权威与突破，利于拼搏、管理、高挑战岗位。",
        弱: "官杀攻身：压抑、是非、突发压力更重。",
        中: "责任感与紧迫感并存。"
      },
      resolve: {
        强: "用法：承接挑战型任务；用食伤制杀或印化杀，压力变业绩。",
        弱: "化解：印星化杀、比劫护身；减少同时开多条高压线。",
        中: "用法：压力项目排期，一张一张拿下。"
      }
    },
    "正官": {
      from: "克日主、阴阳不同。例：日主甲，见辛。",
      effect: {
        强: "有官有制：规则、名分、职责清晰，利于体制与管理路径。",
        弱: "约束过重，易喘不过气或怕做错事。",
        中: "守规矩、要面子，适合稳定平台。"
      },
      resolve: {
        强: "用法：走正规晋升、合规管理；把责任写成成果。",
        弱: "化解：印星护身、少主动加码责任；岗位选择量力。",
        中: "用法：职责内做到位，职责外量力帮忙。"
      }
    },
    "偏印": {
      from: "生日主、阴阳相同。例：日主甲，见壬（水生木）。",
      effect: {
        强: "印多易懒散、想法偏门，或学而不化。",
        弱: "偏门学问、独特思路能生身，利于专精冷门。",
        中: "独立思考强，兴趣不一定大众。"
      },
      resolve: {
        强: "化解：用财制印，逼自己落地；少空学，要作品。",
        弱: "用法：深耕一门专长；拜师进修很有用。",
        中: "用法：把偏门做成差异化竞争力。"
      }
    },
    "正印": {
      from: "生日主、阴阳不同。例：日主甲，见癸。",
      effect: {
        强: "庇护过多易依赖、少冲劲，或名誉事务缠身。",
        弱: "贵人、学业、平台最能补身，利于借力成长。",
        中: "学习与靠山感平稳。"
      },
      resolve: {
        强: "化解：见财制印，主动扛事练肌肉；忌一味等安排。",
        弱: "用法：考证、进修、找贵人贵平台；接受帮助并兑现结果。",
        中: "用法：保持学习习惯，贵人关系常维护。"
      }
    }
  };

  var SS_GROUP = {
    "比肩": "比劫", "劫财": "比劫",
    "食神": "食伤", "伤官": "食伤",
    "偏财": "财星", "正财": "财星",
    "七杀": "官杀", "正官": "官杀",
    "偏印": "印星", "正印": "印星"
  };

  // 神煞：来源 / 影响 / 化解或用法
  var SHENSHA_DETAIL = {
    "天乙贵人": {
      kind: "吉",
      from: "古人以北极旁「天乙」星主解厄护命；日主五行得对应贵人支相助，便如得贵星照护，故成此神。",
      effect: "遇事易得人帮忙，关键时刻有人搭把手；贵人未必是大人物，也可能是同事、朋友。",
      usage: "遇困难主动求助、维护好人缘；投桃报李，勿把贵人当理所应当。"
    },
    "文昌贵人": {
      kind: "吉",
      from: "文昌星传统主科名、文章、智识；日主临其照临之位，文气注入命盘，遂成文昌。",
      effect: "利于学习、考试、写作、动脑类事务，思路相对清楚。",
      usage: "把时间投在进修、考证、内容产出上；写下来、交出去，比空想更见效。"
    },
    "太极贵人": {
      kind: "吉",
      from: "太极象征本源与悟道；日主得太极之气，易生探究本源、钻研玄理的倾向，故成此神。",
      effect: "悟性、钻研欲较强，适合深入一门学问或技艺。",
      usage: "选一个方向深耕；定期把所学讲给别人听，防钻牛角尖。"
    },
    "福星贵人": {
      kind: "吉",
      from: "福星主安泰、少灾；日主得福星之位，命气偏于平稳、温养，故成福星。",
      effect: "生活面相对有福气，少些无谓折腾，心态易回稳。",
      usage: "保持作息与日常仪式感；用规律生活托住福气，别透支身体。"
    },
    "国印贵人": {
      kind: "吉",
      from: "国印象征权印、文书、名分；日主临印信之象，公职文书之气入盘，故成国印。",
      effect: "与公职、印章、文书、资质认证类事务较有缘。",
      usage: "证件、合同、资质手续认真对待；适合走正规、合规路径。"
    },
    "天厨贵人": {
      kind: "吉",
      from: "天厨主食禄、口福；日主得天厨照临，食禄之气入命，故成天厨。",
      effect: "口福、食禄较好，也与餐饮、食品相关际遇有关。",
      usage: "饮食有节；若从业餐饮、食品更贴合，仍要卫生与合规。"
    },
    "学堂": {
      kind: "吉",
      from: "学堂为日主「长生」之位，如人之初生入学，学问之气初开，故成学堂。",
      effect: "利于求学、进修、技能入门阶段。",
      usage: "抓住学习窗口期；入学、培训、拜师宜主动推进。"
    },
    "词馆": {
      kind: "吉",
      from: "词馆为日主临官、功名显达之位，文词、名位之气汇聚，故成词馆。",
      effect: "利于文章、表达、文案类输出。",
      usage: "多写多讲；把表达沉淀成作品或作品集。"
    },
    "禄神": {
      kind: "吉",
      from: "禄为日干「临官」之地，如人得俸禄、正当饭碗；日主禄位入盘，禄神乃生。",
      effect: "有禄可享，偏正财、本职收入、正当来路。",
      usage: "守住主业与正当收入；勿因小利坏了稳定饭碗。"
    },
    "羊刃": {
      kind: "凶",
      from: "羊刃即日干「帝旺」之位，气旺到极处如利刃出鞘；过刚则易伤，故成凶神。",
      effect: "性格刚锐、有魄力，也易急躁、好胜、遇事易硬刚。",
      resolve: "遇事先停三秒再反应；用制度与流程约束冲动；以印星、食神泄秀，比硬扛更好。"
    },
    "红艳": {
      kind: "平",
      from: "红艳取桃花、美色之象；日主临其位，情欲、魅力之气偏显，故成红艳。",
      effect: "异性缘、魅力、感情戏更容易出现。",
      usage: "魅力用在正当社交与表达上。",
      resolve: "感情界线清晰，忌暧昧不清导致纠纷。"
    },
    "金舆": {
      kind: "吉",
      from: "金舆象车驾、仪仗，主移动与体面；日主得金舆之位，车马排场之气入盘，故成此神。",
      effect: "偏车马、出行、体面配置，移动与排场感更强。",
      usage: "出行计划周全；大额消费量力而行，体面不等于攀比。"
    },
    "驿马": {
      kind: "平",
      from: "三合局「冲」其帝旺之位为驿马，如驿站奔驰、不得安居；动气入盘，故成驿马。",
      effect: "走动多：出差、调动、搬迁、跑业务的概率更高。",
      usage: "适合主动跑动型工作，把「动」变成业绩。",
      resolve: "行程预留弹性，证件行李备份；忌临时起意的远行冒险。"
    },
    "桃花": {
      kind: "平",
      from: "三合局「沐浴」之位为咸池（桃花），如人沐浴无遮、色气外露；情缘之气入盘，故成桃花。",
      effect: "人际魅力、社交与感情机会增多，也易招桃花纠纷。",
      usage: "社交可用，感情宜专一经营。",
      resolve: "公开场合言行检点，重要关系早点说清楚。"
    },
    "华盖": {
      kind: "平",
      from: "三合局「墓库」之位为华盖，气收藏于库，清高孤寂；宗教、艺术、玄思之气由此生。",
      effect: "清高、孤傲、思辨强，适合研究、艺术、信仰，也易孤独。",
      usage: "把孤独变成专注与作品。",
      resolve: "定期参与小圈子交流，防自我封闭。"
    },
    "将星": {
      kind: "吉",
      from: "三合局「帝旺」中神为将星，如主帅居中调度；权威、统御之气入盘，故成将星。",
      effect: "有管人管事的气场，适合带团队或扛责任。",
      usage: "主动承担可控责任；以身作则，少只会下命令。"
    },
    "劫煞": {
      kind: "凶",
      from: "三合局「绝」地为劫煞，气绝则易被夺、被截；阻滞破耗之象由此生。",
      effect: "防突发阻滞、破耗、计划被截胡。",
      resolve: "重要事项留备份与保险；大额支出与合同多一道审核；遇阻先止损再进攻。"
    },
    "亡神": {
      kind: "凶",
      from: "三合局特定死绝之位为亡神，心思易游荡、失焦；多虑妄念之象由此生。",
      effect: "心思活、点子多，也易多虑、想偏、钻牛角尖。",
      resolve: "重要决策写下来冷静一夜；找信任的人当「现实校对」；少熬夜胡思乱想。"
    },
    "孤辰": {
      kind: "凶",
      from: "相对年/日支前一位为孤辰，如人落单、少伴；孤寡之气入盘，故成孤辰。",
      effect: "内心独立，人际上略清冷，习惯自己扛。",
      resolve: "主动维持两三位深交；团体活动从旁听练到参与；不必强求八面玲珑。"
    },
    "寡宿": {
      kind: "凶",
      from: "相对年/日支后一位为寡宿，与孤辰成对，主独处、聚少离多；寡合之气由此生。",
      effect: "独处时间多，感情节奏偏慢，或聚少离多。",
      resolve: "感情上增加稳定相处频率；接受慢热，忌因寂寞仓促承诺。"
    },
    "吊客": {
      kind: "凶",
      from: "年/日支后二辰为吊客，传统主吊丧、忧戚；悲感、代人操心之象入盘，故成吊客。",
      effect: "易操心他人之事，也易被负面情绪感染。",
      resolve: "共情有度，先守住自己的情绪边界；少长时间浸泡负面资讯。"
    },
    "天罗地网": {
      kind: "凶",
      from: "戌亥相裹为天罗、辰巳相裹为地网，如网罗困住；束缚、难脱之象入盘，故成此煞。",
      effect: "易感束缚、拖延、进退两难，事情缠住不易干脆。",
      resolve: "把大事拆成小步骤；找旁观者帮忙做选择；该断则断，忌无限纠结。"
    },
    "魁罡贵人": {
      kind: "平",
      from: "日柱落庚戌、庚辰、戊戌、壬辰，土金气重而刚明，古人谓之魁罡；刚明过极则成双刃。",
      effect: "头脑精明、做事果断，也易刚愎自用、吃性格亏。",
      usage: "果断用在专业判断与执行上。",
      resolve: "重大决定强制听取反对意见；忌当众硬刚面子。"
    },
    "天德贵人": {
      kind: "吉",
      from: "月令所值「天德」之干入命，如得当月天德照临；厚德化解之气入盘，故成天德。",
      effect: "逢凶易化，心性偏厚道，挫折后较易回稳。",
      usage: "保持善意与规则意识；出事时先合法合规处理，再谈进退。"
    },
    "月德贵人": {
      kind: "吉",
      from: "月建三合所值「月德」之干入命，如得月中德星；温和、少走极端之气由此生。",
      effect: "人缘与心性较好，少走极端。",
      usage: "合作协商优先；情绪上来时提醒自己留余地。"
    },
    "天医": {
      kind: "吉",
      from: "月令前一辰为天医，主医药、救治；医养之气入盘，故成天医。",
      effect: "与医药、健康、调理类事务有缘，也提醒关注身体。",
      usage: "定期体检；若走医护、养生赛道更贴合；有不适早治，勿硬扛。"
    },
    "阴阳差错": {
      kind: "凶",
      from: "日柱落在特定阴阳错配干支，婚配礼数上阴阳不调；差错、别扭之象由此生。",
      effect: "婚恋礼仪、手续、仪式感上易出岔子或别扭。",
      resolve: "婚恋相关手续、礼数多核对；沟通直接清楚，少靠暗示。"
    },
    "十恶大败": {
      kind: "凶",
      from: "日柱落在古诀所定「十恶大败」日，传统主财禄易散；今多作理财纪律警示，非宿命定论。",
      effect: "理财上更需纪律，忌冲动破耗；不必恐慌。",
      resolve: "强制储蓄与预算；大额投资设冷静期；忌赌徒式加杠杆。"
    },
    "勾绞": {
      kind: "凶",
      from: "地支相勾相绞，如绳结纠缠；人际约定不清时易越缠越紧，故成勾绞。",
      effect: "人际易纠缠，约定不清时容易扯皮。",
      resolve: "合作先写书面约定；感情与金钱边界分开；及时止损比死缠有用。"
    },
    "咸池": {
      kind: "平",
      from: "即桃花：三合沐浴位入盘，色气、情缘外露，故成咸池。",
      effect: "感情社交活跃，魅力强。",
      usage: "魅力用在明处，关系说在前头。",
      resolve: "忌暧昧不清，重要关系早点定性。"
    }
  };

  function getShiShen(dayGan, targetGan) {
    return (SHISHEN_TABLE[dayGan] || {})[targetGan] || "";
  }

  function uniq(arr) {
    var seen = {};
    return arr.filter(function (x) {
      if (!x || seen[x]) return false;
      seen[x] = true;
      return true;
    });
  }

  /** 盘中五行：天干 + 地支藏干，标有/缺 */
  var WX_ORDER = ["木", "火", "土", "金", "水"];

  function scanChartWuxing(pillars, dayGan, dayWx) {
    var hit = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
    var sources = { 木: [], 火: [], 土: [], 金: [], 水: [] };

    (pillars || []).forEach(function (p) {
      var gw = GAN_WX[p.gan];
      if (gw) {
        hit[gw] += 1;
        var t = (p.label || "") + "干" + p.gan;
        if (sources[gw].indexOf(t) < 0) sources[gw].push(t);
      }
      var hides = HIDE_GAN[p.zhi] || [];
      hides.forEach(function (hg) {
        var hw = GAN_WX[hg];
        if (!hw) return;
        hit[hw] += 1;
        var t2 = (p.label || "") + "支" + p.zhi + "藏" + hg;
        if (sources[hw].indexOf(t2) < 0) sources[hw].push(t2);
      });
    });

    var present = [];
    var missing = [];
    var items = WX_ORDER.map(function (wx) {
      var n = hit[wx] || 0;
      var has = n > 0;
      if (has) present.push(wx);
      else missing.push(wx);
      return {
        wx: wx,
        has: has,
        count: n,
        flag: has ? String(n) : "缺",
        sources: sources[wx] || []
      };
    });

    var attrText = dayWx ? (dayWx + "命") : "";
    var summary = missing.length
      ? ("缺" + missing.join("、"))
      : "五行俱全";

    return {
      dayGan: dayGan || "",
      dayWx: dayWx || "",
      attrText: attrText,
      present: present,
      missing: missing,
      items: items,
      summary: summary
    };
  }

  function countShiShen(pillars) {
    var counts = {};
    var stemList = [];
    var origins = {};

    function pushOrigin(ss, text) {
      if (!ss || ss === "日主") return;
      if (!origins[ss]) origins[ss] = [];
      if (origins[ss].indexOf(text) < 0) origins[ss].push(text);
    }

    pillars.forEach(function (p, idx) {
      var ss = p.shishenGan;
      if (idx === 2) ss = "日主";
      if (ss) {
        counts[ss] = (counts[ss] || 0) + 1;
        if (idx !== 2) {
          stemList.push(p.label + p.gan + "为" + ss);
          pushOrigin(ss, p.label + "干" + p.gan);
        }
      }
      (p.canggan || []).forEach(function (c) {
        if (c.shishen) {
          counts[c.shishen] = (counts[c.shishen] || 0) + 0.5;
          var hg = c.text || c.gan || "";
          pushOrigin(c.shishen, p.label + "支" + p.zhi + "藏" + hg);
        }
      });
    });

    var groups = { 比劫: 0, 食伤: 0, 财星: 0, 官杀: 0, 印星: 0 };
    Object.keys(counts).forEach(function (ss) {
      var g = SS_GROUP[ss];
      if (g) groups[g] += counts[ss];
    });

    var sortedGroups = Object.keys(groups)
      .map(function (k) { return { name: k, n: Math.round(groups[k] * 10) / 10 }; })
      .filter(function (x) { return x.n > 0; })
      .sort(function (a, b) { return b.n - a.n; });

    return { counts: counts, stemList: stemList, groups: sortedGroups, origins: origins };
  }

  function strengthSideOf(shengshi) {
    var level = (shengshi && shengshi.level) || "";
    if (level === "身强" || level === "偏强") return "强";
    if (level === "身弱" || level === "偏弱") return "弱";
    return "中";
  }

  /** 十神相对日主的五行（扶抑用神对照） */
  function shiShenWx(name, dayWx) {
    var g = SS_GROUP[name];
    if (!dayWx || !g) return "";
    var SHENG_WO = { 木: "水", 火: "木", 土: "火", 金: "土", 水: "金" };
    var WO_SHENG = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
    var WO_KE = { 木: "土", 火: "金", 土: "水", 金: "木", 水: "火" };
    var KE_WO = { 木: "金", 火: "水", 土: "木", 金: "火", 水: "土" };
    if (g === "比劫") return dayWx;
    if (g === "印星") return SHENG_WO[dayWx];
    if (g === "食伤") return WO_SHENG[dayWx];
    if (g === "财星") return WO_KE[dayWx];
    if (g === "官杀") return KE_WO[dayWx];
    return "";
  }

  /** 按当前身势标喜/忌/平（优先类别，其次五行） */
  function markShiShenXiJi(name, shengshi, dayWx) {
    var group = SS_GROUP[name] || "";
    var xiCats = (shengshi && shengshi.xiCats) || [];
    var jiCats = (shengshi && shengshi.jiCats) || [];
    var xiYong = (shengshi && shengshi.xiYong) || [];
    var jiShen = (shengshi && shengshi.jiShen) || [];
    var wx = shiShenWx(name, dayWx);

    function catHit(list) {
      return list.some(function (c) {
        return c === group || (c && c.indexOf(group) === 0);
      });
    }

    if (catHit(xiCats) || (wx && xiYong.indexOf(wx) >= 0)) {
      return { flag: "喜", wx: wx, group: group };
    }
    if (catHit(jiCats) || (wx && jiShen.indexOf(wx) >= 0)) {
      return { flag: "忌", wx: wx, group: group };
    }
    return { flag: "平", wx: wx, group: group };
  }

  function describeShiShen(ssInfo, shengshi, dayGan, dayWx) {
    var side = strengthSideOf(shengshi);
    var names = Object.keys(ssInfo.counts || {})
      .filter(function (k) { return k !== "日主"; })
      .sort(function (a, b) { return ssInfo.counts[b] - ssInfo.counts[a]; })
      .slice(0, 8);

    function stripAction(s) {
      return String(s || "").replace(/^(用法|化解)[：:]\s*/, "");
    }
    function pickByPrefix(map, preferSide, prefix) {
      var order = [preferSide, "中", "弱", "强"];
      for (var i = 0; i < order.length; i++) {
        var t = map && map[order[i]];
        if (t && t.indexOf(prefix) === 0) return stripAction(t);
      }
      return stripAction((map && (map[preferSide] || map["中"])) || "");
    }

    var items = names.map(function (name) {
      var d = SHISHEN_DETAIL[name];
      var mark = markShiShenXiJi(name, shengshi, dayWx);
      var chartFrom = (ssInfo.origins && ssInfo.origins[name]) ? ssInfo.origins[name].join("、") : "";
      var fromBase = d
        ? String(d.from || "").replace(/。?例：[^。]+。?/g, "。").replace(/。。+/g, "。").trim()
        : "";
      var from = fromBase
        ? (fromBase + (chartFrom ? " 本盘见于：" + chartFrom + "。" : (fromBase.slice(-1) === "。" ? "" : "。")))
        : (chartFrom ? "本盘见于：" + chartFrom + "。" : "由日主与其余干支推得。");
      var effect = d && d.effect
        ? (d.effect[side] || d.effect["中"])
        : ((SS_PLAIN[name] || "作性格与际遇参考") + "。");
      var rmap = (d && d.resolve) || {};
      var item = {
        name: name,
        flag: mark.flag,
        wx: mark.wx,
        group: mark.group,
        from: from,
        effect: effect,
        usage: "",
        resolve: "",
        actionLabel: "",
        action: ""
      };
      if (mark.flag === "喜") {
        item.actionLabel = "用法";
        item.action = pickByPrefix(rmap, side, "用法");
        item.usage = item.action;
      } else if (mark.flag === "忌") {
        item.actionLabel = "化解";
        item.action = pickByPrefix(rmap, side, "化解");
        item.resolve = item.action;
      } else {
        item.usage = pickByPrefix(rmap, side, "用法");
        item.resolve = pickByPrefix(rmap, side, "化解");
        // 若两侧文案相同（只取到同一句），只留一条
        if (item.usage && item.usage === item.resolve) {
          var raw = rmap[side] || rmap["中"] || "";
          if (raw.indexOf("化解") === 0) {
            item.usage = "";
          } else {
            item.resolve = "";
          }
        }
      }
      return item;
    });

    var order = { 喜: 0, 忌: 1, 平: 2 };
    items.sort(function (a, b) {
      var da = order[a.flag] != null ? order[a.flag] : 9;
      var db = order[b.flag] != null ? order[b.flag] : 9;
      if (da !== db) return da - db;
      return (ssInfo.counts[b.name] || 0) - (ssInfo.counts[a.name] || 0);
    });

    var lines = [];
    items.forEach(function (it) {
      lines.push("【" + it.name + "·" + it.flag + "】");
      lines.push("来源：" + it.from);
      lines.push("影响：" + it.effect);
      if (it.flag === "平") {
        if (it.usage) lines.push("用法：" + it.usage);
        if (it.resolve) lines.push("化解：" + it.resolve);
      } else if (it.action) {
        lines.push(it.actionLabel + "：" + it.action);
      }
    });

    return { tags: names, lines: lines, items: items, side: side };
  }

  function pickIndustries(geKey, shengshi) {
    var base = (GE_INFO[geKey] && GE_INFO[geKey].jobs) ? GE_INFO[geKey].jobs.slice() : ["综合管理", "专业服务"];
    var extra = [];
    if (shengshi && shengshi.xiYong && shengshi.xiYong.length) {
      shengshi.xiYong.forEach(function (wx) {
        (WX_JOBS[wx] || []).forEach(function (j) { extra.push(j); });
      });
    }
    return uniq(base.concat(extra)).slice(0, 8);
  }

  function mergeWxLists(xiYong, table) {
    var out = [];
    (xiYong || []).forEach(function (wx) {
      (table[wx] || []).forEach(function (x) {
        if (out.indexOf(x) < 0) out.push(x);
      });
    });
    return out;
  }

  function hasShiShenInChart(pillars, names) {
    var set = {};
    (names || []).forEach(function (n) { set[n] = true; });
    var hit = [];
    (pillars || []).forEach(function (p) {
      if (p.shishenGan && set[p.shishenGan] && hit.indexOf(p.shishenGan) < 0) hit.push(p.shishenGan);
      (p.canggan || []).forEach(function (c) {
        if (c.shishen && set[c.shishen] && hit.indexOf(c.shishen) < 0) hit.push(c.shishen);
      });
    });
    return hit;
  }

  function hasFamilyInChart(pillars, familyKeys) {
    // familyKeys like ["印"] matches 正印/偏印; ["官"] matches 正官; ["杀"] matches 七杀; ["财"] matches 正偏财; ["食"]食神 ["伤"]伤官
    var map = {
      印: ["正印", "偏印"],
      官: ["正官"],
      杀: ["七杀"],
      财: ["正财", "偏财"],
      食: ["食神"],
      伤: ["伤官"],
      比: ["比肩"],
      劫: ["劫财"]
    };
    var names = [];
    (familyKeys || []).forEach(function (k) {
      (map[k] || [k]).forEach(function (n) {
        if (names.indexOf(n) < 0) names.push(n);
      });
    });
    return hasShiShenInChart(pillars, names);
  }

  /**
   * 格局档次：上等成格 / 中等成格 / 偏弱成格 / 破格待救
   * 评分仅供面诊排序参考，非命理绝对值。
   */
  function evaluateGeGrade(opts) {
    var geKey = opts.geKey;
    var benqiSS = opts.benqiSS;
    var monthGanSS = opts.monthGanSS;
    var shengshi = opts.shengshi;
    var pillars = opts.pillars || [];
    var reasons = [];
    var criteria = [];
    var score = 60; // 起步：月令取格成立

    criteria.push("① 取格法：以月令地支「本气」相对日主之十神定格（子平正格常法）。");
    criteria.push("② 透清：月干（或年时干）透出与格神同类，格气更显。");
    criteria.push("③ 身任：身强能任财官食伤；身弱需印比生扶，否则格气难兑现。");
    criteria.push("④ 成破：视该格忌见之十神（如伤官见官、财破印、枭神夺食等）是否明显。");
    criteria.push("⑤ 护格：是否有制化、护卫（如杀有制、官有印、食伤生财等）。");

    if (!benqiSS) {
      return {
        grade: "格未清晰",
        gradeTone: "平",
        score: 40,
        summary: "月令本气未能明确归入常见八格/禄刃，暂以杂气论，需结合透干与身势细断。",
        reasons: ["月令本气十神不明，无法按标准正格定档"],
        criteria: criteria
      };
    }

    reasons.push("月令本气为「" + benqiSS + "」，取「" + geKey + "」成立（正格基线）。");

    // 透干
    if (monthGanSS && monthGanSS === benqiSS) {
      score += 12;
      reasons.push("月干透出格神「" + monthGanSS + "」，格气透清，档次上浮。");
    } else if (monthGanSS) {
      score -= 4;
      reasons.push("月干另透「" + monthGanSS + "」，与月令主格不完全一致，主气略杂。");
    } else {
      reasons.push("月干未透格神，格在令中、气藏支内，需靠运透或通根发挥。");
    }

    // 身任
    var level = (shengshi && shengshi.level) || "";
    var check = GE_BREAK_CHECKS[geKey] || {};
    var isStrong = level === "身强" || level === "偏强";
    var isWeak = level === "身弱" || level === "偏弱";
    var isMid = level === "中和" || !level;

    if (geKey === "建禄格" || geKey === "劫财格" || geKey.indexOf("印") >= 0) {
      // 禄刃/印：身弱时格神反可助身；身过旺需有泄耗
      if (isWeak) {
        score += 6;
        reasons.push("身势「" + level + "」，" + geKey + "之助身象较有用，档次略升。");
      } else if (isStrong) {
        score -= 2;
        reasons.push("身势「" + level + "」，禄/印再助易过刚，需财官食伤疏导。");
      } else if (isMid && level) {
        score += 3;
        reasons.push("身势「" + level + "」，与" + geKey + "搭配相对平稳。");
      }
    } else {
      // 财官食伤格：宜身强能任
      if (isStrong) {
        score += 10;
        reasons.push("身势「" + level + "」，较能任" + geKey.replace("格", "") + "，格局力量易兑现。");
      } else if (isWeak) {
        score -= 12;
        reasons.push("身势「" + level + "」，恐难任" + geKey.replace("格", "") + "，格气有而身力不足。");
      } else if (level) {
        score += 4;
        reasons.push("身势「" + level + "」，任格能力中等，发挥看大运补足。");
      }
    }

    // 破格
    var breakHit = hasShiShenInChart(pillars, check.breakSs || []);
    if (breakHit.length) {
      score -= 14;
      reasons.push("见破格因子「" + breakHit.join("、") + "」：" + (check.breakTip || "格气受损") + "。");
    }

    // 七杀需制化
    if (check.needCtrl) {
      var ctrl = hasFamilyInChart(pillars, check.helpSs || []);
      if (ctrl.length) {
        score += 8;
        reasons.push("七杀有制化（见" + ctrl.join("、") + "），" + (check.helpTip || "可用") + "。");
      } else {
        score -= 10;
        reasons.push("七杀制化不明显，" + (check.breakTip || "压力易攻身") + "。");
      }
    }

    // 禄刃需有用神
    if (check.needYong) {
      var yong = hasFamilyInChart(pillars, check.helpSs || []);
      if (yong.length) {
        score += 8;
        reasons.push("禄/刃有所任（见" + yong.join("、") + "），" + (check.helpTip || "有用武之地") + "。");
      } else {
        score -= 8;
        reasons.push(check.breakTip || "有禄无用，需运上补财官食伤。");
      }
    }

    // 护格（非强制）
    if (!check.needCtrl && !check.needYong && check.helpSs && check.helpSs.length) {
      var help = hasFamilyInChart(pillars, check.helpSs);
      if (help.length) {
        score += 5;
        reasons.push("见护格/成格辅助（" + help.join("、") + "）：" + (check.helpTip || "格更稳") + "。");
      }
    }

    if (score > 100) score = 100;
    if (score < 0) score = 0;

    var grade, gradeTone, summary;
    if (score >= 78) {
      grade = "上等成格";
      gradeTone = "利";
      summary = "格神清晰，身势与护卫大体相配，破格不重——面诊可作「主旋律明确、可顺势做强」来讲。";
    } else if (score >= 62) {
      grade = "中等成格";
      gradeTone = "平";
      summary = "格局成立且可用，但有透干不纯、身任不足或小破之处——宜扬长避短，用大运补缺。";
    } else if (score >= 48) {
      grade = "偏弱成格";
      gradeTone = "平";
      summary = "格名虽在，力量或身任偏弱——先扶身/护格，再谈格局红利，切忌硬扛格象。";
    } else {
      grade = "破格待救";
      gradeTone = "慎";
      summary = "破格因子或身不任格较明显——当面重点讲「如何救应」，勿只夸格局名称。";
    }

    if (shengshi && shengshi.level) {
      summary = "身势「" + shengshi.level + "」参与定档。" + summary;
    }

    return {
      grade: grade,
      gradeTone: gradeTone,
      score: score,
      summary: summary,
      reasons: reasons,
      criteria: criteria
    };
  }

  /** 格局：类型 / 档次 / 判断标准 / 有利不利 */
  function describeGePattern(opts) {
    var geKey = opts.geKey;
    var info = opts.info;
    var dayGan = opts.dayGan;
    var dayWx = opts.dayWx;
    var monthZhi = opts.monthZhi;
    var monthGan = opts.monthGan;
    var benqi = opts.benqi;
    var benqiSS = opts.benqiSS;
    var monthGanSS = opts.monthGanSS;
    var shengshi = opts.shengshi;
    var pillars = opts.pillars || [];

    var catMeta = GE_CATEGORY[geKey] || {
      cat: "杂气/他格",
      catFull: "杂气或非典型正格",
      family: "",
      focus: "以月令主气为命局主色调"
    };

    var typeName = geKey;
    var typeCategory = catMeta.catFull;
    var typeExplain =
      "月令取格归入「" + geKey + "」（" + catMeta.cat + "），焦点偏「" + catMeta.focus + "」。" +
      (shengshi && shengshi.level ? "档次已结合身势「" + shengshi.level + "」能否任格。" : "");

    var how = (info && info.how)
      ? info.how
      : ("以月令" + monthZhi + (benqi ? "本气" + benqi : "") +
        (benqiSS ? "为「" + benqiSS + "」" : "") + "取格，命局主旋律由此定。");

    var howDetail = [
      "日主" + dayGan + dayWx + "，" + monthZhi + "月取「" + geKey + "」" +
        (benqi && benqiSS ? "（月令本气" + benqi + "＝" + benqiSS + "）" : "") + "。",
      how
    ];
    if (monthGanSS) {
      howDetail.push(
        monthGanSS === benqiSS
          ? "月干" + monthGan + "同透" + monthGanSS + "，格之主气更显、特质更集中。"
          : "月干" + monthGan + "另透「" + monthGanSS + "」，与月令主格不完全一致，性格多一层色彩。"
      );
    }

    var gradeInfo = evaluateGeGrade({
      geKey: geKey,
      benqiSS: benqiSS,
      monthGanSS: monthGanSS,
      shengshi: shengshi,
      pillars: pillars
    });

    var pros = (info && info.pros) ? info.pros.slice() : ["把握月令主气，顺势发挥格局长处"];
    var cons = (info && info.cons) ? info.cons.slice() : ["需合身势喜忌与大运再论成败"];

    if (shengshi && shengshi.level) {
      var level = shengshi.level;
      var xi = (shengshi.xiYong || []).join("、");
      var ji = (shengshi.jiShen || []).join("、");
      if (level === "身强" || level === "偏强") {
        pros.push("身势「" + level + "」，较能任财官食伤，格局力量更易兑现");
        cons.push("身偏旺时忌再叠比印过重，宜走克泄耗（喜" + xi + "）");
      } else if (level === "身弱" || level === "偏弱") {
        pros.push("身势「" + level + "」时，印比生扶（喜" + xi + "）能托住格局");
        cons.push("身偏弱时财官过重易压身，忌神「" + ji + "」宜制化");
      } else {
        pros.push("身势中和，格局发挥相对平稳");
        cons.push("仍要防某一类十神突然过旺打破平衡");
      }
    }

    var body = [];
    body.push("【类型】" + typeName + "（" + typeCategory + "）");
    body.push("【档次】" + gradeInfo.grade + "（参考分" + gradeInfo.score + "）");
    body.push(gradeInfo.summary);
    body.push("【" + geKey + "】");
    howDetail.forEach(function (t) { body.push(t); });
    body.push("【判断标准】");
    gradeInfo.criteria.forEach(function (t) { body.push(t); });
    body.push("【本盘对照】");
    gradeInfo.reasons.forEach(function (t) { body.push("· " + t); });
    body.push("【有利因素】");
    pros.forEach(function (t) { body.push("· " + t); });
    body.push("【不利因素】");
    cons.forEach(function (t) { body.push("· " + t); });
    if (info && info.mean) body.push("总览：" + info.mean);

    return {
      typeName: typeName,
      typeCategory: typeCategory,
      typeExplain: typeExplain,
      grade: gradeInfo.grade,
      gradeTone: gradeInfo.gradeTone,
      gradeScore: gradeInfo.score,
      gradeSummary: gradeInfo.summary,
      gradeReasons: gradeInfo.reasons,
      criteria: gradeInfo.criteria,
      how: how,
      howDetail: howDetail,
      pros: pros,
      cons: cons,
      body: body
    };
  }

  /** 适宜行业 / 人 / 颜色 / 数字 / 星座 */
  function buildYiYi(geKey, shengshi, dayWx) {
    var xi = (shengshi && shengshi.xiYong && shengshi.xiYong.length)
      ? shengshi.xiYong.slice()
      : (dayWx ? [dayWx] : ["土"]);
    var ji = (shengshi && shengshi.jiShen) ? shengshi.jiShen.slice() : [];

    var industries = pickIndustries(geKey, shengshi);
    var colors = mergeWxLists(xi, WX_COLORS);
    var numbers = mergeWxLists(xi, WX_NUMBERS);
    var shengxiao = mergeWxLists(xi, WX_SHENGXIAO);
    var zodiac = mergeWxLists(xi, WX_ZODIAC);
    var attrs = xi.map(function (w) { return WX_ATTR[w] || (w + "属"); });

    var people = [
      "五行属性：" + attrs.join("、") + "之人",
      "生肖：" + (shengxiao.length ? shengxiao.join("、") : "顺喜用五行之属相") + "年出生者更相合",
      "往来对象宜带喜用气质（稳、助、生扶），少长期纠缠忌神过重之人"
    ];
    if (ji.length) {
      people.push("少与「" + ji.map(function (w) { return WX_ATTR[w] || w; }).join("、") + "」过旺、相处耗神者为伍");
    }

    var rows = [
      { key: "industry", label: "行业", items: industries },
      { key: "people", label: "人", items: people, plain: true },
      { key: "color", label: "颜色", items: colors },
      { key: "number", label: "数字", items: numbers },
      { key: "zodiac", label: "星座", items: zodiac },
      { key: "wuxing", label: "喜用五行", items: xi }
    ];

    var body = [
      "行业：" + industries.join("、") + "。",
      people[0] + "；" + people[1] + "。",
      "颜色：" + colors.join("、") + "。",
      "数字：" + numbers.join("、") + "。",
      "星座：" + zodiac.join("、") + "。"
    ];

    return {
      xiYong: xi,
      jiShen: ji,
      industries: industries,
      people: people,
      colors: colors,
      numbers: numbers,
      zodiac: zodiac,
      rows: rows,
      body: body
    };
  }

  function describeShensha(list) {
    var clean = (list || []).filter(function (n) { return n && n !== "—"; });
    if (!clean.length) {
      return {
        tags: [],
        lines: [
          "本盘未点出常见神煞，或标记不明显。",
          "不必强求神煞；把身势喜用、格局与大运走稳，比堆吉神更有用。"
        ],
        items: []
      };
    }

    var focus = clean.slice(0, 10);
    var items = focus.map(function (name) {
      var d = SHENSHA_DETAIL[name] || {
        kind: "平",
        from: "命盘干支组合触发传统神煞象意，具体成因因星而异。",
        effect: "作性格与际遇的辅助参考。",
        usage: "结合身势与实际情况善用其长。",
        resolve: "结合身势与实际情况防范其短。"
      };
      var flag = d.kind || "平";
      var item = {
        name: name,
        flag: flag,
        from: d.from,
        effect: d.effect,
        usage: "",
        resolve: "",
        actionLabel: "",
        action: ""
      };
      if (flag === "吉") {
        item.actionLabel = "用法";
        item.action = d.usage || d.resolve || "";
        item.usage = item.action;
      } else if (flag === "凶") {
        item.actionLabel = "化解";
        item.action = d.resolve || d.usage || "";
        item.resolve = item.action;
      } else {
        item.usage = d.usage || "";
        item.resolve = d.resolve || "";
      }
      return item;
    });

    var order = { 吉: 0, 平: 1, 凶: 2 };
    items.sort(function (a, b) {
      var da = order[a.flag] != null ? order[a.flag] : 9;
      var db = order[b.flag] != null ? order[b.flag] : 9;
      return da - db;
    });

    var lines = [];
    items.forEach(function (it) {
      lines.push("【" + it.name + "·" + it.flag + "】");
      lines.push("来源：" + it.from);
      lines.push("影响：" + it.effect);
      if (it.flag === "平") {
        if (it.usage) lines.push("用法：" + it.usage);
        if (it.resolve) lines.push("化解：" + it.resolve);
      } else if (it.action) {
        lines.push(it.actionLabel + "：" + it.action);
      }
    });
    if (clean.length > focus.length) {
      lines.push("另有：" + clean.slice(focus.length).join("、"));
    }

    return { tags: clean, lines: lines, items: items };
  }

  /** 优先取带身势/身任语感的利或慎句，便于一眼落地 */
  function pickGlanceLine(list, fallback) {
    var arr = list || [];
    var i;
    for (i = arr.length - 1; i >= 0; i--) {
      var t = arr[i] || "";
      if (
        t.indexOf("身势") >= 0 ||
        t.indexOf("身偏") >= 0 ||
        t.indexOf("身弱") >= 0 ||
        t.indexOf("身强") >= 0 ||
        t.indexOf("身不") >= 0 ||
        t.indexOf("任") >= 0
      ) {
        return t;
      }
    }
    return arr[0] || fallback;
  }

  /**
   * 一眼看懂：命主 + 身势 + 格局 + 喜忌慎利
   */
  function buildGlance(opts) {
    var dayGan = opts.dayGan || "";
    var dayWx = opts.dayWx || "";
    var geKey = opts.geKey || "命格";
    var info = opts.info || {};
    var geDetail = opts.geDetail || {};
    var shengshi = opts.shengshi || null;
    var wxInfo = opts.wxInfo || {};

    var level = (shengshi && shengshi.level) || "未判";
    var xi = (shengshi && shengshi.xiYong) ? shengshi.xiYong.slice() : [];
    var ji = (shengshi && shengshi.jiShen) ? shengshi.jiShen.slice() : [];
    var xiCats = (shengshi && shengshi.xiCats) ? shengshi.xiCats.slice() : [];
    var jiCats = (shengshi && shengshi.jiCats) ? shengshi.jiCats.slice() : [];

    var isWeak = level === "身弱" || level === "偏弱";
    var isStrong = level === "身强" || level === "偏强";
    var strategy = isWeak
      ? "先扶身（把日主养够）：多用喜用，少碰忌神；格局好处要等身力够了再兑现。"
      : (isStrong
        ? "能任事（担得起）：用喜用去发挥格局长处；别再叠比印把身推过旺。"
        : "求平衡：缺什么补什么，忌神不过旺；格局与身势同看。");

    var gePros0 = (geDetail.pros && geDetail.pros[0])
      || ((info.pros && info.pros[0]) || "顺月令主气、用喜用神");
    var liLine = pickGlanceLine(geDetail.pros, gePros0);
    var shenLine = pickGlanceLine(
      geDetail.cons,
      (geDetail.cons && geDetail.cons[0]) || ((info.cons && info.cons[0]) || "防破格与忌神过旺")
    );

    var geName = geDetail.typeName || geKey;
    var grade = geDetail.grade || "—";
    var headline = dayGan + dayWx + " · " + level + " · " + geName;

    return {
      headline: headline,
      situation: "",
      oneLiner: info.mean || "",
      strategy: strategy,
      dayLabel: dayGan + (dayWx || ""),
      dayWx: dayWx,
      level: level,
      levelTone: isWeak ? "弱" : (isStrong ? "强" : "中"),
      geName: geName,
      geCategory: geDetail.typeCategory || "",
      grade: grade,
      gradeTone: geDetail.gradeTone || "平",
      gradeScore: geDetail.gradeScore,
      xi: xi,
      ji: ji,
      xiCats: xiCats,
      jiCats: jiCats,
      li: liLine,
      shen: shenLine,
      wxSummary: wxInfo.summary || "",
      focus: (GE_CATEGORY[geKey] && GE_CATEGORY[geKey].focus) || ""
    };
  }

  /**
   * @param {object} ec EightChar
   * @param {object} ctx { pillars, shensha, shengshi }
   */
  function analyze(ec, ctx) {
    ctx = ctx || {};
    var pillars = ctx.pillars || [];
    var shenshaAll = (ctx.shensha && ctx.shensha.all) ? ctx.shensha.all : [];
    var shengshi = ctx.shengshi || null;

    var dayGan = ec.getDayGan();
    var monthZhi = ec.getMonthZhi();
    var monthGan = ec.getMonthGan();
    var hide = HIDE_GAN[monthZhi] || [];
    var benqi = hide[0];
    var benqiSS = benqi ? getShiShen(dayGan, benqi) : "";
    var monthGanSS = getShiShen(dayGan, monthGan);
    var dayWx = GAN_WX[dayGan];

    var geKey = benqiSS ? (SS_TO_GE[benqiSS] || (benqiSS + "当令")) : "普通格局";
    var info = GE_INFO[geKey] || {
      mean: "月令主气为「" + (benqiSS || "杂气") + "」，按此把握命局主色调。",
      how: "月令本气相对日主为「" + (benqiSS || "杂气") + "」，虽未落入常见八格名称，仍以月令主气为命局主旋律。",
      pros: ["抓住月令主气方向做事更顺", "结合身势喜用可补不足"],
      cons: ["主气不清时易摇摆", "需靠大运与喜用神校正方向"],
      jobs: ["综合发展", "专业服务", "稳定职业路径"]
    };

    var ssInfo = countShiShen(pillars);
    var wxInfo = scanChartWuxing(pillars, dayGan, dayWx);
    var geDetail = describeGePattern({
      geKey: geKey,
      info: info,
      dayGan: dayGan,
      dayWx: dayWx,
      monthZhi: monthZhi,
      monthGan: monthGan,
      benqi: benqi,
      benqiSS: benqiSS,
      monthGanSS: monthGanSS,
      shengshi: shengshi,
      pillars: pillars
    });
    var yiYi = buildYiYi(geKey, shengshi, dayWx);
    var sha = describeShensha(shenshaAll);
    var ssDetail = describeShiShen(ssInfo, shengshi, dayGan, dayWx);
    var glance = buildGlance({
      dayGan: dayGan,
      dayWx: dayWx,
      geKey: geKey,
      info: info,
      geDetail: geDetail,
      shengshi: shengshi,
      wxInfo: wxInfo
    });

    var sections = [];

    // 1 格局
    sections.push({
      title: "八字格局",
      body: geDetail.body
    });

    // 2 十神
    sections.push({
      title: "十神",
      body: ssDetail.lines
    });

    // 3 神煞
    sections.push({
      title: "神煞",
      body: sha.lines
    });

    // 4 适宜参考（行业/人/颜色/数字/星座）
    sections.push({
      title: "适宜参考",
      body: yiYi.body
    });

    // 兼容旧渲染：扁平 lines
    var lines = [];
    sections.forEach(function (sec) {
      lines.push("【" + sec.title + "】");
      sec.body.forEach(function (t) { lines.push(t); });
    });

    return {
      name: geKey,
      mean: info.mean,
      dayGan: dayGan,
      dayWx: dayWx,
      wuxing: wxInfo,
      industries: yiYi.industries,
      sections: sections,
      lines: lines,
      geDetail: geDetail,
      yiYi: yiYi,
      shishen: ssInfo,
      shishenDetail: ssDetail,
      shensha: sha,
      glance: glance
    };
  }

  root.Geju = { analyze: analyze };
})(typeof window !== "undefined" ? window : global);
