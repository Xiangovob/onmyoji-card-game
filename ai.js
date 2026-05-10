function enemyTurn(){
    addLog("敵方回合開始");

    startTurn(enemy);

    let playable = enemy.hand.find(card => {
        let owner = enemy.bench.find(c => c.id === card.owner);
        return owner && !owner.isDead && card.cost <= enemy.energy;
    });

    if(playable){
        let index = enemy.hand.indexOf(playable);
        enemyUseCard(index);
    }else{
        enemyNormalAttack();
    }

    addLog("敵方回合結束");

    checkDeaths(player);
    checkDeaths(enemy);
    checkWin();
}

function enemyUseCard(index){
    let card = enemy.hand[index];
    let owner = enemy.bench.find(c => c.id === card.owner);

    if(!owner || owner.isDead) return;

    enemy.energy -= card.cost;

    if(card.type === "spell"){
        if(card.tags.includes("damage")){
            if(player.combat){
                dealDamage(player.combat, card.damage);
                addLog(`敵人使用${card.name}，攻擊我方戰鬥區`);
            }else{
                player.coreHp -= card.damage;
                addLog(`敵人使用${card.name}，攻擊我方本體`);
            }
        }

        if(card.tags.includes("heal")){
            healTarget(owner, card.heal);
            addLog(`敵人使用${card.name}，治療${owner.name}`);
        }

        if(card.tags.includes("shield")){
            owner.shield += card.shield;
            addLog(`敵人使用${card.name}，${owner.name}獲得護盾`);
        }
    }

    if(card.type === "combat"){
        enemy.combat = owner;
        addLog(`敵人${owner.name}使用戰鬥牌${card.name}出戰`);

        if(card.damage){
            owner.atk += card.damage;
        }

        doCombat(enemy, player);

        if(card.damage){
            owner.atk -= card.damage;
        }
    }

    let usedCard = enemy.hand.splice(index, 1)[0];
    enemy.discardPile.push(usedCard);

    checkDeaths(player);
    checkDeaths(enemy);
    checkWin();
}

function enemyNormalAttack(){
    if(enemy.attackChance <= 0){
        addLog("敵方沒有出擊次數");
        return;
    }

    let alive = enemy.bench.filter(c => !c.isDead);

    if(alive.length <= 0){
        addLog("敵方沒有可出擊角色");
        return;
    }

    enemy.attackChance--;

    enemy.combat = alive[Math.floor(Math.random() * alive.length)];

    addLog(`敵方${enemy.combat.name}消耗1次出擊次數並出戰`);

    doCombat(enemy, player);

    checkDeaths(player);
    checkDeaths(enemy);
    checkWin();
}
