function drawCard(who){
    if(who.deck.length <= 0){
        addLog(`${who.name}抽到了「終焉」`);
        addLog(`${who.name}牌庫已耗盡`);
        who.coreHp = 0;
        checkWin();
        return;
    }

    if(who.hand.length < who.maxHand){
        who.hand.push(who.deck.pop());
    }
}

function startTurn(who){
    addLog(`──── ${who.name}回合 ────`);

    returnCombat(who);
    clearShield(who);

    who.energy = 3;
    who.instantChance = 1;
    who.attackChance = 1;

    drawCard(who);
    reviveCharacters(who);
    triggerTurnStartPassives(who);
}

function returnCombat(who){
    if(who.combat){
        addLog(`${who.combat.name}返回準備區`);
        who.combat = null;
    }
}

function triggerTurnStartPassives(who){
    let enemySide = who === player ? enemy : player;

    who.bench.forEach(unit => {
        triggerPassive(unit, "onTurnStart", who, enemySide);
    });
}

function endTurn(){
    if(gameOver) return;

    cancelTargetSelect();

    addLog("你的回合結束");
    clearTurnBuff(player);
    player.savedEnergy = player.energy;
    enemyTurn();

    if(gameOver) return;

    startTurn(player);

    render();
    checkWin();
}

function clearShield(who){
    who.bench.forEach(unit => {
        unit.shield = 0;
    });

    if(who.combat){
        who.combat.shield = 0;
    }
}

function clearTurnBuff(who){

    who.bench.forEach(unit => {
        unit.turnAtk = 0;
    });

    if(who.combat){
        who.combat.turnAtk = 0;
    }
}
