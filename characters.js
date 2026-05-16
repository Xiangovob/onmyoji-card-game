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
        id: "katana",
        name: "妖刀",
        atk: 3,
        hp: 4,
        passive: ["damageEnemyCoreOnDeath"],
        passiveName: "死亡時對敵方本體造成2點傷害",
        immuneCombat: false
    }
];
