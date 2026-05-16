function applyCombatEffects(card, owner){
    // 攻擊增加
    if(card.damage){
        owner.combatAtk += card.damage;
        addLog(
            `${owner.name}攻擊增加${card.damage}`
        );
    }

    // 護盾
    if(card.shield){
        owner.shield += card.shield;
        addLog(
            `${owner.name}獲得${card.shield}護盾`
        );
    }

    // 免疫戰鬥傷害
    if(card.immuneCombat){
        owner.immuneCombat = true;
        addLog(
            `${owner.name}免疫本次戰鬥傷害`
        );
    }

    // 擊殺抽牌
    if(card.drawOnKill){
        owner.drawOnKill = true;
        addLog(
            `${owner.name}本次戰鬥擊殺敵人時將抽1張牌`
        );
    }
}
