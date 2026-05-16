function getAtk(unit){

    let atk =
        unit.form?.atk ?? unit.atk;

    atk += unit.permanentAtk;
    atk += unit.turnAtk;
    atk += unit.combatAtk;

    atk -= unit.debuffAtk;

    return atk;
}
function dealDamage(unit, damage){

    if(unit.shield > 0){

        let block = Math.min(unit.shield, damage);

        unit.shield -= block;
        damage -= block;

        addLog(`${unit.name}護盾抵擋${block}傷害`);
    }

    if(damage > 0){

        unit.currentHp -= damage;

        if(unit.currentHp < 0){
            unit.currentHp = 0;
        }
        // 觸發響應
        //triggerResponse("onLowHp", unit);

        let ownerSide =
            player.bench.includes(unit)
            ? player
            : enemy;

        let enemySide =
            ownerSide === player
            ? enemy
            : player;

        triggerPassive(
            unit,
            "onHurt",
            ownerSide,
            enemySide
        );
    }
}

function healTarget(unit, amount){

    unit.currentHp += amount;

    let maxHp =
        unit.form
        ? unit.form.hp
        : unit.hp;

    if(unit.currentHp > maxHp){
        unit.currentHp = maxHp;
    }
}

function doCombat(attackerSide, defenderSide){

    let attacker = attackerSide.combat;
    let defender = defenderSide.combat;

    if(!attacker || attacker.isDead) return;

    triggerPassive(
        attacker,
        "onAttack",
        attackerSide,
        defenderSide
    );

    // 雙方交戰
    if(defender && !defender.isDead){
        if(!defender.immuneCombat){
            dealDamage(
                defender,
                getAtk(attacker)
            );
        }
        if(!attacker.immuneCombat){
            dealDamage(
                attacker,
                getAtk(defender)
            );
        }
        addLog(
            `${attacker.name}與${defender.name}交戰`
        );

    }

    // 直接攻擊本體
    else{

        defenderSide.coreHp -= getAtk(attacker);

        addLog(
            `${attacker.name}攻擊${defenderSide.name}本體，造成${getAtk(attacker)}傷害`
        );
    }
    
    if(attackerSide.combat){
        attackerSide.combat.combatAtk = 0;
    }

    if(defenderSide.combat){
        defenderSide.combat.combatAtk = 0;
    }
}

function getHp(unit){

    return unit.form?.hp ?? unit.hp;
}
