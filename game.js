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
        savedEnergy: 0,
        instantChance: 1,
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
            position: index,
            immuneCombat: false,
            drawOnKill: false
        }))
    };
}

let player = createPlayer("玩家");
let enemy = createPlayer("敵人");

function buildDeck(who, deckList){
    who.deck = deckList.map(id => {
        return structuredClone(
            cardData.find(
                c => c.id === id
            )
        );
    });
    shuffleDeck(who);
}

function shuffleDeck(who){
    for(let i = who.deck.length - 1; i > 0; i--){
        let j = Math.floor(Math.random() * (i + 1));
        [who.deck[i], who.deck[j]] = [who.deck[j], who.deck[i]];
    }
}

function startGame(){
    buildDeck(
        player,
        deckData.starterDeck
    );

    buildDeck(
        enemy,
        deckData.priestDeck
    );

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
    // 戰鬥正式結束後再清除
    clearCombatEffects(player.combat);
    clearCombatEffects(enemy.combat);
    checkWin();
    render();
}

function useCard(index){
    if(gameOver) return;
    let card = player.hand[index];
    let owner = player.bench.find(c => c.id === card.owner);
    let useInstant = false;
    if(
        card.tags &&
        card.tags.includes("instant") &&
        player.instantChance > 0
    ){
        useInstant = true;
    }
    if(!owner){
        addLog("找不到對應角色");
        return;
    }
    if(owner.isDead){
        addLog("對應角色死亡，不能使用此牌");
        return;
    }
    if(
        !useInstant &&
        player.energy < card.cost
    ){
        addLog("鬼火不足");
        return;
    }
    if(card.type === "spell"){
        if(card.tags.includes("aoe")){
            if(useInstant){
                player.instantChance--;
                addLog(
                    `${card.name}使用瞬發，不消耗鬼火`
                );
            }else{
                player.energy -= card.cost;
            }
            useSpellCard(card, owner, { type: "aoe" });
            discardPlayerCard(index);
            afterPlayerAction();
            return;
        }
        if(card.tags.includes("core")){
            if(useInstant){
                player.instantChance--;
                addLog(
                    `${card.name}使用瞬發，不消耗鬼火`
                );
            }else{
                player.energy -= card.cost;
            }
            useSpellCard(card, owner, {
                targetType: "core"
            });
            discardPlayerCard(index);
            afterPlayerAction();
            return;
        }

        if(card.tags.includes("allEnemy")){
            if(useInstant){
                player.instantChance--;
                addLog(
                    `${card.name}使用瞬發，不消耗鬼火`
                );
            }else{
                player.energy -= card.cost;
            }
            useSpellCard(card, owner, {
                type: "allEnemy"
            });
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

    if(useInstant){
        player.instantChance--;
        addLog(
            `${card.name}使用瞬發，不消耗鬼火`
        );
    }else{
        player.energy -= card.cost;
    }
    if(card.type === "combat"){
        useCombatCard(card, owner);
    }
    if(card.type === "form"){
        let oldHp = getHp(owner);
        owner.form = card.formData;
        let newHp = getHp(owner);
        owner.currentHp += (newHp - oldHp);
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
    applyCombatEffects(card, owner);
    doCombat(player, enemy);
    checkDeaths(player);
    checkDeaths(enemy);
    // 戰鬥結束後清Buff
    clearCombatEffects(player.combat);
    clearCombatEffects(enemy.combat);
}
function surrender(){
    let yes = confirm("確定要投降嗎？");
    // 按取消
    if(!yes){
        return;
    }
    addLog("玩家選擇投降");
    gameOver = true;
    setTimeout(()=>{
        window.location.href = "index.html";
    }, 800);
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

function surrender(){
    let yes = confirm("確定要投降嗎？");
    // 取消
    if(!yes){
        return;
    }
    addLog("玩家選擇投降");
    gameOver = true;
    setTimeout(()=>{
        window.location.href = "index.html";
    }, 800);
}
startGame();
