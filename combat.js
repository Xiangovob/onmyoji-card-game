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
