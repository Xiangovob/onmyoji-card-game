const characterData = [
    {
        id: "fox",
        name: "狐妖",
        atk: 2,
        hp: 4,
        passive: ["projectOnSpell"],
        passiveName: "使用法術牌時，投射1"
    },
    {
        id: "guard",
        name: "守衛",
        hp: 6,
        atk: 1,
        passive:["shieldOnTurnStart"],
        passiveName:"己方回合開始時獲得2盾"
    },
    {
        id:"priest",
        name:"祭司",
        atk:1,
        hp:6,
        passive:["priestBless"],
        passiveName:"每當祭司治癒或復活己方目標時，使其 +1攻並抽1"
    },
    {
        id: "katana",
        name: "妖刀",
        atk: 3,
        hp: 4,
        passive: ["damageEnemyCoreOnDeath"],
        passiveName: "死亡時對敵方本體造成2點傷害"
    }
    {
        id: "vex",
        name: "殤",
        atk: 2,
        hp: 6,
        passive: ["gainAtkOnHurt"],
        passiveName: "每當殤受到一次傷害時，+1攻"
    }
];
