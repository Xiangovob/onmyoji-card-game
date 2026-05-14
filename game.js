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
            buffAtk: 0,
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

function triggerPassive(unit, triggerType, ownerSide, enemySide){
    if(unit.isDead && triggerType !== "onDeath") return;
    if(!unit.passive) return;

    unit.passive.forEach(passive => {
        if(passive === "healOnTurnStart" && triggerType === "onTurnStart"){
            healTarget(unit, 1);
            addLog(`${unit.name}被動觸發：回復1血`);
        }

        if(passive === "shieldOnTurnStart" && triggerType === "onTurnStart"){
            unit.shield += 1;
            addLog(`${unit.name}被動觸發：獲得1護盾`);
        }

        if(passive === "gainShieldOnHurt" && triggerType === "onHurt"){
            unit.shield += 1;
            addLog(`${unit.name}被動觸發：受傷後獲得1護盾`);
        }

        if(passive === "damageEnemyCoreOnDeath" && triggerType === "onDeath"){
            enemySide.coreHp -= 2;
            addLog(`${unit.name}死亡被動觸發：對${enemySide.name}本體造成2傷害`);
        }
    });
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

function isValidSpellTarget(card, sideName, targetType, target){
    if(card.tags.includes("damage")){
        if(sideName !== "enemy"){
            addLog("傷害法術只能指定敵方");
            return false;
        }

        if(targetType === "core" && !card.tags.includes("core")){
            addLog("這張牌不能指定本體");
            return false;
        }

        if(targetType !== "core" && (!target || target.isDead)){
            addLog("不能指定死亡或不存在的敵方角色");
            return false;
        }

        return true;
    }

    if(card.tags.includes("heal")){
        if(sideName !== "player" || targetType === "core"){
            addLog("治療法術只能指定我方角色");
            return false;
        }

        if(!target || target.isDead){
            addLog("死亡角色不能治療");
            return false;
        }

        return true;
    }

    if(card.tags.includes("shield")){
        if(sideName !== "player" || targetType === "core"){
            addLog("護盾法術只能指定我方角色");
            return false;
        }

        if(!target || target.isDead){
            addLog("死亡角色不能獲得護盾");
            return false;
        }

        return true;
    }

    return false;
}

function useSpellCard(card, owner, targetInfo){
    if(card.tags.includes("aoe")){
        let targets = getAllAliveEnemyUnits();

        targets.forEach(unit => {
            dealDamage(unit, card.damage);
        });

        addLog(`${owner.name}使用${card.name}，對敵方全體造成${card.damage}傷害`);
        return;
    }

    let target = targetInfo.target;

    if(card.tags.includes("damage")){
        if(targetInfo.targetType === "core"){
            enemy.coreHp -= card.damage;
            addLog(`${owner.name}使用${card.name}，對敵方本體造成${card.damage}傷害`);
        }else{
            dealDamage(target, card.damage);
            addLog(`${owner.name}使用${card.name}，對${target.name}造成${card.damage}傷害`);
        }
    }

    if(card.tags.includes("heal")){
        healTarget(target, card.heal);
        addLog(`${owner.name}使用${card.name}，${target.name}恢復${card.heal}`);
    }

    if(card.tags.includes("shield")){
        target.shield += card.shield;
        addLog(`${owner.name}使用${card.name}，${target.name}獲得${card.shield}護盾`);
    }
}

function getAllAliveEnemyUnits(){
    let set = new Set();

    if(enemy.combat && !enemy.combat.isDead){
        set.add(enemy.combat);
    }

    enemy.bench.forEach(unit => {
        if(!unit.isDead){
            set.add(unit);
        }
    });

    return [...set];
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
        owner.buffAtk += card.damage;
        addLog(
            `${owner.name}攻擊增加${card.damage}`
        );
    }
    doCombat(player, enemy);
}

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

function endTurn(){
    if(gameOver) return;

    cancelTargetSelect();

    addLog("你的回合結束");

    enemyTurn();

    if(gameOver) return;

    startTurn(player);

    render();
    checkWin();
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

function clearShield(who){
    who.bench.forEach(unit => {
        unit.shield = 0;
    });

    if(who.combat){
        who.combat.shield = 0;
    }
}

startGame();
