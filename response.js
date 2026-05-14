function triggerResponse(event, target){

    player.hand.forEach((card, index) => {

        // 沒有 response tag
        if(!card.tags || !card.tags.includes("response")) return;

        // trigger 不符合
        if(card.trigger !== event) return;

        // 沒留鬼火
        if(player.savedEnergy <= 0) return;

        // 鬼火不夠
        if(player.energy < card.cost) return;

        // condition 不符合
        if(card.condition && !card.condition(target)) return;

        addLog(`響應發動：${card.name}`);

        // 消耗鬼火
        player.energy -= card.cost;

        // 使用效果
        useSpellCard(card, target);

        // 移除手牌
        player.hand.splice(index, 1);

        render();
    });

}
