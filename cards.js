const cardData = [

    // 狐妖
    {
        id: "fox_howl",
        owner: "fox",
        name: "狐嘯",
        cost: 1,
        type: "spell",
        tags:["damage", "core"],
        damage: 2,
        text: "對敵方本體造成2點傷害。"
    },
    {
        id: "fox_cry",
        owner: "fox",
        name: "狐鳴",
        cost: 1,
        type: "spell",
        tags:["allEnemy"],
        damage: 1,
        text: "對所有敵方目標造成1點傷害。"
    },

    {
        id: "fox_form",
        owner: "fox",
        name: "狐妖覺醒",
        cost: 1,
        type: "form",

        formData:{
            atk:2,
            hp:6
        },

        text:"2/6"
    },

    // 守衛
    {
        id:"guard_shield_slam",
        owner:"guard",
        name:"重盾猛擊",
        cost:1,
        type:"combat",
        tags:["shieldScale"],
        text:"本次戰鬥中，守衛每有1盾獲得+1攻擊"
    },
    {
        id:"guard_fortress",
        owner:"guard",
        name:"不動堡壘",
        cost:1,
        type:"form",
        formData:{
            atk:4,
            hp:7
        },
        tags:["enterShield","shieldLimit"],
        shield:2,
        text:"4/7。進場時獲得2盾。守衛有護盾時，至多受到等同護盾值的傷害。"
    },

    // 祭司
    {
        id:"holyLight",
        owner:"priest",
        name:"神癒之光",
        cost:1,
        type:"spell",
        tags:["heal"],
        heal:5,
        text:"為一個目標回復5生命"
    },
    {
        id:"holySpring",
        owner:"priest",
        name:"聖泉湧現",
        cost:1,
        type:"spell",
        tags:["instant","search"],
        text:"選一個己方角色，從牌庫抽一張其專屬牌"
    },
    // 妖刀刀妹
    {
        id: "katana_cursed_blade",
        owner: "katana",
        name: "不祥之刃",
        cost: 1,
        type: "combat",
        tags:["shield", "drawOnKill"],
        shield: 1,
        drawOnKill: true,
        text: "本次戰鬥+1護盾。消滅敵方角色時，抽一張牌。"
    },
    {
        id: "katana_parry",
        owner: "katana",
        name: "見切",
        cost: 1,
        type: "combat",
        tags:["damage", "immuneCombat"],
        damage: 1,
        immuneCombat: true,
        text: "本次戰鬥+1攻擊，免疫本次戰鬥傷害。"
    },

];
