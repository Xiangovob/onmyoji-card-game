const characterData = [
    {
        id: "fox",
        name: "狐妖",
        hp: 4,
        atk: 3,
        passiveName: "回合回血",
        passive: ["healOnTurnStart"]
    },
    {
        id: "guard",
        name: "守衛",
        hp: 5,
        atk: 2,
        passiveName: "受傷獲盾",
        passive: ["gainShieldOnHurt"]
    },
    {
        id: "priest",
        name: "祭司",
        hp: 5,
        atk: 1,
        passiveName: "回合護盾",
        passive: ["shieldOnTurnStart"]
    },
    {
        id: "assassin",
        name: "刺客",
        hp: 4,
        atk: 4,
        passiveName: "死亡爆核",
        passive: ["damageEnemyCoreOnDeath"]
    }
];
