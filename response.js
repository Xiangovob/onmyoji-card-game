function triggerResponse(event, target){

    for(let i = 0; i < player.hand.length; i++){

        let card = player.hand[i];

        // 沒有 response tag
        if(!card.tags) continue;

        if(!card.tags.includes("response")) continue;

        // trigger 不符合
        if(card.trigger !== event) continue;

        // 沒留鬼火
        if(player.savedEnergy <= 0) continue;

        // 鬼火不夠
        if(player.energy < card.cost) continue;

        // condition 不符合
        if(card.condition){

            if(!card.condition(target)){
                continue;
            }

        }

        addLog(`響應發動：${card.name}`);

        // 消耗鬼火
        player.energy -= card.cost;

        // heal
        if(card.tags.includes("heal")){

            healTarget(target, card.heal);

            addLog(
                `${target.name}因${card.name}恢復${card.heal}生命`
            );
        }

        // shield
        if(card.tags.includes("shield")){

            target.shield += card.shield;

            addLog(
                `${target.name}因${card.name}獲得${card.shield}護盾`
            );
        }

        // 移除手牌
        player.hand.splice(i, 1);

        render();

        // 一次只觸發一張
        break;
    }

}
