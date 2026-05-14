function getAtk(unit){

    let baseAtk =
        unit.form
        ? unit.form.atk
        : unit.atk;

    return (
        baseAtk +
        unit.buffAtk -
        unit.debuffAtk
    );
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

        let ownerSide = player.bench.includes(unit) ? player : enemy;
        let enemySide = ownerSide === player ? enemy : player;

        triggerPassive(unit, "onHurt", ownerSide, enemySide);
    }
}

function healTarget(unit, amount){
    unit.currentHp += amount;

    if(unit.currentHp > unit.hp){
        unit.currentHp = unit.hp;
    }
}

function doCombat(attackerSide, defenderSide){
    let attacker = attackerSide.combat;
    let defender = defenderSide.combat;

    if(!attacker || attacker.isDead) return;

    triggerPassive(attacker, "onAttack", attackerSide, defenderSide);

    if(defender && !defender.isDead){
        dealDamage(defender, attacker.atk);
        dealDamage(attacker, defender.atk);

        addLog(`${attacker.name}與${defender.name}交戰`);
    }else{
        defenderSide.coreHp -= attacker.atk;
        addLog(`${attacker.name}攻擊${defenderSide.name}本體，造成${attacker.atk}傷害`);
    }
}
