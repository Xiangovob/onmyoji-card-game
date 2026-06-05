function getAtk(unit){

    let atk =
        unit.form?.atk ?? unit.atk;

    atk += unit.permanentAtk;
    atk += unit.turnAtk;
    atk += getStatusValue(unit, "atkUp");

    atk -= unit.debuffAtk;

    return atk;
}
function dealDamage(unit, damage){
    if(
        unit.form &&
        unit.form.tags &&
        unit.form.tags.includes("shieldLimit") &&
        unit.shield > 0
    ){
        let limit = unit.shield;
        if(damage > limit){
            addLog(
                `${unit.name}的護盾限制了傷害`
            );
            damage = limit;
        }
    }
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

function healTarget(
    unit,
    amount,
    source = null,
    ownerSide = null,
    enemySide = null
){

    let oldHp = unit.currentHp;

    unit.currentHp += amount;

    let maxHp =
        unit.form
        ? unit.form.hp
        : unit.hp;

    if(unit.currentHp > maxHp){
        unit.currentHp = maxHp;
    }

    let healed =
        unit.currentHp - oldHp;

    // 真的有補到才觸發
    if(
        healed > 0
        && source
    ){

        triggerPassive(
            source,
            "onHeal",
            ownerSide,
            enemySide,
            unit
        );
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
    if(!hasStatus(defender, "immuneCombat")){
        dealDamage(
            defender,
            getAtk(attacker)
        );
    }else{
        addLog(`${defender.name}免疫了本次戰鬥傷害`);
    }
    if(!hasStatus(attacker, "immuneCombat")){
        dealDamage(
            attacker,
            getAtk(defender)
        );
    }else{
        addLog(`${attacker.name}免疫了本次戰鬥傷害`);
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
    
}

function getHp(unit){

    return unit.form?.hp ?? unit.hp;
}

function clearCombatEffects(unit){
    if(!unit) return;
    clearTemporaryStatus(unit);
}
