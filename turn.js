function drawCard(who){
    // 抽到終焉
    if(who.deck.length <= 0){
        addLog(`${who.name}牌庫已耗盡`);
        addLog(`${who.name}抽到了「終焉」`);
        gameOver = true;
        // 敵人抽到
        if(who === enemy){
            alert("你贏了！");
        }
        // 玩家抽到
        else{
            alert("你輸了！");
        }
        return;
    }
    // 正常抽牌
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
    selectingCardIndex = null;
    selectingCard = null;
    selectingOwner = null;
    addLog("玩家回合結束");
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
