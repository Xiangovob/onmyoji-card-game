function triggerPassive(unit, triggerType, ownerSide, enemySide){

    if(unit.isDead && triggerType !== "onDeath") return;

    if(!unit.passive) return;

    unit.passive.forEach(passive => {

        if(passive === "healOnTurnStart"
        && triggerType === "onTurnStart"){

            healTarget(unit, 1);

            addLog(
                `${unit.name}被動觸發：回復1血`
            );
        }

        if(passive === "shieldOnTurnStart"
        && triggerType === "onTurnStart"){

            unit.shield += 1;

            addLog(
                `${unit.name}被動觸發：獲得1護盾`
            );
        }

        if(passive === "gainShieldOnHurt"
        && triggerType === "onHurt"){

            unit.shield += 1;

            addLog(
                `${unit.name}被動觸發：受傷後獲得1護盾`
            );
        }

        if(passive === "damageEnemyCoreOnDeath"
        && triggerType === "onDeath"){

            enemySide.coreHp -= 2;

            addLog(
                `${unit.name}死亡被動觸發：對${enemySide.name}本體造成2傷害`
            );
        }
    });
}
