let gameOver = false;

let selectingCardIndex = null;
let selectingCard = null;
let selectingOwner = null;

function createPlayer(name){
    return {
        name,
        coreHp: 30,
        deck: [],
        hand: [],
        discardPile: [],
        energy: 3,
        attackChance: 1,
        maxHand: 8,
        combat: null,
        bench: characterData.map((char, index) => ({
            ...char,
            passive: char.passive || [],
            passiveName: char.passiveName || "無",
            currentHp: char.hp,
            form: null,
            permanentAtk: 0,
            turnAtk: 0,
            combatAtk: 0,
            debuffAtk: 0,
            shield: 0,
            isDead: false,
            reviveCounter: 0,
            position: index
        }))
    };
}

let player = createPlayer("玩家");
let enemy = createPlayer("敵人");

function buildDeck(who){
    who.deck = [...cardData, ...cardData];
    shuffleDeck(who);
}

function shuffleDeck(who){
    for(let i = who.deck.length - 1; i > 0; i--){
        let j = Math.floor(Math.random() * (i + 1));
        [who.deck[i], who.deck[j]] = [who.deck[j], who.deck[i]];
    }
}

function startGame(){
    buildDeck(player);
    buildDeck(enemy);

    for(let i = 0; i < 4; i++){
        drawCard(player);
        drawCard(enemy);
    }

    render();
    addLog("遊戲開始！");
}

function enterCombat(index){
    if(gameOver) return;

    let unit = player.bench[index];

    if(unit.isDead){
        addLog("死亡角色不能出戰");
        return;
    }

    if(player.attackChance <= 0){
        addLog("本回合已經沒有出擊次數");
        return;
    }

    player.attackChance--;

    player.combat = unit;
    addLog(`${unit.name}消耗1次出擊次數並出戰`);

    doCombat(player, enemy);

    checkDeaths(player);
    checkDeaths(enemy);
    checkWin();
    render();
}

function useCard(index){
    if(gameOver) return;

    let card = player.hand[index];

    if(player.energy < card.cost){
        addLog("鬼火不足");
        return;
    }

    let owner = player.bench.find(c => c.id === card.owner);

    if(!owner){
        addLog("找不到對應角色");
        return;
    }

    if(owner.isDead){
        addLog("對應角色死亡，不能使用此牌");
        return;
    }

    if(card.type === "spell"){
        if(card.tags.includes("aoe")){
            player.energy -= card.cost;
            useSpellCard(card, owner, { type: "aoe" });
            discardPlayerCard(index);
            afterPlayerAction();
            return;
        }

        selectingCardIndex = index;
        selectingCard = card;
        selectingOwner = owner;

        addLog(`請選擇「${card.name}」的目標`);
        render();
        return;
    }

    player.energy -= card.cost;

    if(card.type === "combat"){
        useCombatCard(card, owner);
    }

    if(card.type === "form"){

    owner.form = card.formData;

    addLog(
        `${owner.name}進入型態：${card.name}`
    );
}

    discardPlayerCard(index);
    afterPlayerAction();
}

function selectTarget(sideName, targetType, index = null){
    if(!selectingCard) return;

    let side = sideName === "player" ? player : enemy;
    let target = null;

    if(targetType === "combat"){
        target = side.combat;
    }

    if(targetType === "bench"){
        target = side.bench[index];
    }

    if(targetType === "core"){
        target = side;
    }

    if(!isValidSpellTarget(selectingCard, sideName, targetType, target)){
        return;
    }

    player.energy -= selectingCard.cost;

    useSpellCard(selectingCard, selectingOwner, {
        sideName,
        targetType,
        target
    });

    discardPlayerCard(selectingCardIndex);

    selectingCardIndex = null;
    selectingCard = null;
    selectingOwner = null;

    afterPlayerAction();
}

function cancelTargetSelect(){
    selectingCardIndex = null;
    selectingCard = null;
    selectingOwner = null;

    addLog("取消選擇目標");
    render();
}

function discardPlayerCard(index){
    let usedCard = player.hand.splice(index, 1)[0];
    player.discardPile.push(usedCard);
}

function afterPlayerAction(){
    checkDeaths(player);
    checkDeaths(enemy);
    checkWin();
    render();
}

function useCombatCard(card, owner){
    player.combat = owner;
    addLog(
        `${owner.name}使用戰鬥牌：${card.name}並出戰`
    );
    if(card.damage){
        owner.combatAtk += card.damage;
        addLog(
            `${owner.name}攻擊增加${card.damage}`
        );
    }
    doCombat(player, enemy);
}

function surrender(){
    player.coreHp = 0;
    addLog("你選擇投降");
    checkWin();
    render();
}

function checkWin(){
    if(gameOver) return;

    if(player.coreHp <= 0){
        gameOver = true;
        alert("你輸了！");
    }

    if(enemy.coreHp <= 0){
        gameOver = true;
        alert("你贏了！");
    }
}

startGame();
