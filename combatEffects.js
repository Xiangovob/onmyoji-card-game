function applyCombatEffects(card, owner){
    // 攻擊增加
    if(card.damage){
        addStatus(owner, {
            type: "atkUp",
            value: card.damage,
            duration: 1
        });
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
        addStatus(owner, {
            type: "immuneCombat",
            duration: 1
        });
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
    if(card.tags.includes("shieldScale")){
        owner.tempAtk =
            (owner.tempAtk || 0)
            + owner.shield;
        addLog(
            `${owner.name}因護盾獲得${owner.shield}攻擊`
        );
    }

    if(card.tags.includes("shieldScale")){
        owner.combatAtk += owner.shield;
        addLog(
            `${owner.name}因護盾獲得${owner.shield}攻擊`
        );
    }
    
}
