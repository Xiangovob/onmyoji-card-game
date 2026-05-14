function checkDeaths(who){
    if(who.combat && who.combat.currentHp <= 0){
        killUnit(who.combat, who);
        who.combat = null;
    }

    who.bench.forEach(unit => {
        if(unit.currentHp <= 0 && !unit.isDead){
            killUnit(unit, who);
        }
    });
}

function killUnit(unit, who){
    unit.currentHp = 0;
    unit.shield = 0;
    unit.isDead = true;
    unit.form = null;
    unit.reviveCounter = 3;

    let enemySide = who === player ? enemy : player;
    triggerPassive(unit, "onDeath", who, enemySide);

    if(who.combat === unit){
        who.combat = null;
    }

    addLog(`${unit.name}死亡，進入準備區，3回合後復活`);
}

function reviveCharacters(who){
    who.bench.forEach(unit => {
        if(unit.isDead){
            unit.reviveCounter--;

            addLog(`${unit.name}復活倒數：${unit.reviveCounter}`);

            if(unit.reviveCounter <= 0){
                unit.isDead = false;
                unit.currentHp = unit.hp;
                unit.shield = 0;
                unit.reviveCounter = 0;

                addLog(`${unit.name}復活，回到${unit.currentHp}血`);
            }
        }
    });
}
