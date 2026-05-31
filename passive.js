function triggerPassive(
    unit,
    triggerType,
    ownerSide,
    enemySide,
    target = null
){

    if(unit.isDead && triggerType !== "onDeath") return;

    if(!unit.passive) return;

    unit.passive.forEach(passive => {

        if(passive === "healOnTurnStart"&& triggerType === "onTurnStart"){
            healTarget(unit, 1);
            addLog(
                `${unit.name}被動觸發：回復1血`
            );
        }
        
        if(passive === "shieldOnTurnStart"&& triggerType === "onTurnStart"){
            unit.shield += 2;
            addLog(
                `${unit.name}被動觸發：獲得2護盾`
            );
        }

        if(passive === "gainShieldOnHurt"&& triggerType === "onHurt"){
            unit.shield += 1;
            addLog(
                `${unit.name}被動觸發：受傷後獲得1護盾`
            );
        }

        if(passive === "damageEnemyCoreOnDeath"&& triggerType === "onDeath"){
            enemySide.coreHp -= 2;
            addLog(
                `${unit.name}死亡被動觸發：對${enemySide.name}本體造成2傷害`
            );
        }
        
        if(passive === "projectOnSpell"&& triggerType === "onSpell"){
            triggerProjectile(unit, enemySide);
        }
        
        if(passive === "priestBless"&& triggerType === "onHeal"){
            if(target){
                target.permanentAtk =
                    (target.permanentAtk || 0) + 1;
                drawCard(ownerSide);
                addLog(
                    `${unit.name}祝福了${target.name}，使其+1攻並抽1張牌`
                );
            }
        }
        
        if(passive === "gainAtkOnHurt" &&triggerType === "onHurt"){
            unit.permanentAtk += 1;
            addLog(
                `${unit.name}受到傷害，永久獲得+1攻`
            );
        }
    });
}

function triggerProjectile(unit, enemySide){

    // 優先打戰鬥區
    if(enemySide.combat && !enemySide.combat.isDead){

        dealDamage(enemySide.combat, 1);

        addLog(
            `${unit.name}投射1點傷害給${enemySide.combat.name}`
        );
    }

    // 沒有戰鬥區則打本體
    else{

        enemySide.coreHp -= 1;

        addLog(
            `${unit.name}投射1點傷害給${enemySide.name}本體`
        );
    }
}
