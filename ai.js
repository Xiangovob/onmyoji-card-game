function endTurn(){
  if(gameOver) return;

  addLog("你的回合結束");

  aiTurn();

  if(gameOver) return;

  player.energy = 3;
  drawCards(player, 2);

  render();
}

function aiTurn(){
  enemy.energy = 3;

  drawCards(enemy, 2);

  if(gameOver) return;

  addLog("敵方回合開始");

  for(let i = enemy.hand.length - 1; i >= 0; i--){
    let card = enemy.hand[i];

    if(card.cost > enemy.energy){
      continue;
    }

    enemy.energy -= card.cost;

    if(card.type === "attack"){
      let target = getAlivePlayerTarget();

      if(target === -1){
        player.leaderHp -= card.damage;
        addLog(`敵人直接攻擊本體，造成 ${card.damage} 傷害`);
      }else{
        dealDamage("player", target, card.damage);
        addLog(`敵人使用 ${card.name}，對我${target + 1}造成 ${card.damage} 傷害`);
      }
    }

    if(card.type === "heal"){
      let target = getLowestHpEnemy();

      if(target !== -1){
        let healed = healTarget("enemy", target, card.heal);

        if(healed){
          addLog(`敵人使用 ${card.name}，敵${target + 1}回復 ${card.heal} 血`);
        }
      }
    }

    if(card.type === "defense"){
      let target = getLowestHpEnemy();

      if(target !== -1){
        enemy.shield[target] += card.shield;
        addLog(`敵人使用 ${card.name}，敵${target + 1}獲得 ${card.shield} 點護盾`);
      }
    }

    let usedCard = enemy.hand.splice(i, 1)[0];
    enemy.discardPile.push(usedCard);

    checkWin();

    if(gameOver) return;
  }

  addLog("敵方回合結束");
  checkWin();
}

function getAlivePlayerTarget(){
  let alive = [];

  player.hp.forEach((hp, index) => {
    if(hp > 0){
      alive.push(index);
    }
  });

  if(alive.length === 0){
    return -1;
  }

  return alive[Math.floor(Math.random() * alive.length)];
}

function getLowestHpEnemy(){
  let alive = [];

  enemy.hp.forEach((hp, index) => {
    if(hp > 0){
      alive.push(index);
    }
  });

  if(alive.length === 0){
    return -1;
  }

  let target = alive[0];

  alive.forEach(index => {
    if(enemy.hp[index] < enemy.hp[target]){
      target = index;
    }
  });

  return target;
}