const cardData = [

    // 狐妖
    {
        id: "fox_fire",
        owner: "fox",
        name: "狐火",
        cost: 1,
        type: "spell",
        tags: ["damage", "instant"],
        damage: 3,
        desc: "對一名敵方式神造成 3 點傷害。"
    },

    {
        id: "fox_shadow_attack",
        owner: "fox",
        name: "狐影突襲",
        cost: 1,
        type: "combat",
        tags: ["damage"],
        damage: 2,
        desc: "本次戰鬥攻擊力 +2。"
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

        desc:"2/6"
    },

    // 守衛
    {
        id: "guard_charge",
        owner: "guard",
        name: "守衛衝鋒",
        cost: 1,
        type: "combat",
        tags: ["damage"],
        damage: 2,
        desc: "本次戰鬥攻擊力 +2。"
    },

    {
        id: "guard_iron_wall",
        owner: "guard",
        name: "鋼鐵壁壘",
        cost: 1,
        type: "spell",
        tags: ["shield"],
        shield: 3,
        desc: "使一名我方式神獲得 3 點護盾。"
    },

    // 祭司
    {
        id: "priest_heal",
        owner: "priest",
        name: "治療術",
        cost: 1,
        type: "spell",
        tags: ["heal"],
        heal: 4,
        desc: "恢復一名我方式神 4 點生命。"
    },

    {
        id: "priest_holy_shield",
        owner: "priest",
        name: "聖光護佑",
        cost: 1,
        type: "spell",
        tags: ["shield"],
        shield: 2,
        desc: "使一名我方式神獲得 2 點護盾。"
    },

    // 妖刀刀妹
    {
        name: "不祥之刃",
        owner: "katana",
        type: "combat",
        cost: 1,
        combatAtk: 0,
        shield: 1,
        effect: "drawOnKill",
        text: "本次戰鬥+1護盾。消滅敵方角色時，抽一張牌。"
    },
    {
        name: "見切",
        owner: "katana",
        type: "combat",
        cost: 1,
        combatAtk: 1,
        immuneCombat: true,
        text: "本次戰鬥+1攻擊，免疫本次戰鬥傷害。"
    },

];
