let selectedAlly = 0;
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
        combat: null,
        bench: characterData.map((char, index) => ({
            ...char,
            passive: char.passive || [],
            currentHp: char.hp,
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
    who.deck = [...cards, ...cards];
    shuffleDeck(who);
}

function shuffleDeck(who){
    for(let i = who.deck.length - 1; i > 0; i--){
        let j = Math.floor(Math.random() * (i + 1));
        [who.deck[i], who.deck[j]] = [who.deck[j], who.deck[i]];
    }
}

function drawCard(who){
    if(who.deck.length <= 0){
        if(who.discardPile.length <= 0){
            who.coreHp = 0;
            addLog(`${who.name}牌庫耗盡，判敗`);
            checkWin();
            return;
        }

        who.deck = [...who.discardPile];
        who.discardPile = [];
        shuffleDeck(who);
        addLog(`${who.name}重新洗牌`);
    }

    if(who.hand.length < 5){
        who.hand.push(who.deck.pop());
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

function startTurn(who){
    returnCombat(who);

    who.energy = 3;
    who.attackChance = 1;

    drawCard(who);
    reviveCharacters(who);
    triggerTurnStartPassives(who);

    addLog(`${who.name}回合開始，出擊次數恢復為1`);
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
    if(!unit.passive) return;

    unit.passive.forEach(passive => {
        if(passive === "healOnTurnStart" && triggerType === "onTurnStart"){
            if(!unit.isDead){
                healTarget(unit, 1);
                addLog(`${unit.name}被動觸發：回復1血`);
            }
        }

        if(passive === "shieldOnTurnStart" && triggerType === "onTurnStart"){
            if(!unit.isDead){
                unit.shield += 1;
                addLog(`${unit.name}被動觸發：獲得1護盾`);
            }
        }

        if(passive === "gainShieldOnHurt" && triggerType === "onHurt"){
            if(!unit.isDead){
                unit.shield += 1;
                addLog(`${unit.name}被動觸發：受傷後獲得1護盾`);
            }
        }

        if(passive === "damageEnemyCoreOnDeath" && triggerType === "onDeath"){
            enemySide.coreHp -= 2;
            addLog(`${unit.name}死亡被動觸發：對${enemySide.name}本體造成2傷害`);
        }
    });
}

function selectAlly(index){
    if(player.bench[index].isDead){
        addLog("死亡角色不能選擇");
        return;
    }

    selectedAlly = index;
    addLog(`選擇角色：${player.bench[index].name}`);
    render();
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

function doCombat(attackerSide, defenderSide){
    let attacker = attackerSide.combat;
    let defender = defenderSide.combat;

    if(!attacker || attacker.isDead) return;

    triggerPassive(attacker, "onAttack", attackerSide, defenderSide);

    if(defender && !defender.isDead){
        dealDamage(defender, attacker.atk);
        dealDamage(attacker, defender.atk);

        addLog(`${attacker.name}與${defender.name}交戰`);
    }else{
        defenderSide.coreHp -= attacker.atk;
        addLog(`${attacker.name}攻擊${defenderSide.name}本體，造成${attacker.atk}傷害`);
    }
}

function dealDamage(unit, damage){
    let originalDamage = damage;

    if(unit.shield > 0){
        let block = Math.min(unit.shield, damage);
        unit.shield -= block;
        damage -= block;
        addLog(`${unit.name}護盾抵擋${block}傷害`);
    }

    if(damage > 0){
        unit.currentHp -= damage;

        if(unit.currentHp < 0){
            unit.currentHp = 0;
        }

        let ownerSide = player.bench.includes(unit) ? player : enemy;
        let enemySide = ownerSide === player ? enemy : player;

        triggerPassive(unit, "onHurt", ownerSide, enemySide);
    }
}

function healTarget(unit, amount){
    unit.currentHp += amount;

    if(unit.currentHp > unit.hp){
        unit.currentHp = unit.hp;
    }
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
        addLog("型態牌尚未開放");
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
    addLog(`${owner.name}使用戰鬥牌：${card.name}並出戰`);

    if(card.damage){
        owner.atk += card.damage;
        addLog(`${owner.name}本次戰鬥攻擊增加${card.damage}`);
    }

    doCombat(player, enemy);

    if(card.damage){
        owner.atk -= card.damage;
    }
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

function addLog(text){
    let log = document.getElementById("battle-log");
    log.innerHTML = text + "<br>" + log.innerHTML;
}

function render(){
    document.getElementById("enemy-area").innerHTML =
    `
    <h2>敵方</h2>
    <p onclick="selectTarget('enemy', 'core')">本體：${enemy.coreHp}</p>
    <p>牌庫：${enemy.deck.length}　棄牌：${enemy.discardPile.length}</p>

    <h3>戰鬥區</h3>
    <div class="card battle-card" onclick="selectTarget('enemy', 'combat')">
        ${
            enemy.combat
            ? `${enemy.combat.name}<br>HP:${enemy.combat.currentHp}/${enemy.combat.hp}<br>ATK:${enemy.combat.atk}<br>盾:${enemy.combat.shield}`
            : "空"
        }
    </div>

    <h3>準備區</h3>
    ${
        enemy.bench.map((unit, index) => `
            <div class="card ${unit.isDead ? "dead-card" : ""}" onclick="selectTarget('enemy', 'bench', ${index})">
                ${unit.name}<br>
                HP:${unit.currentHp}/${unit.hp}<br>
                ATK:${unit.atk}<br>
                盾:${unit.shield}<br>
                被動:${unit.passiveName}<br>
                ${unit.isDead ? `復活:${unit.reviveCounter}` : ""}
            </div>
        `).join("")
    }
    `;

    document.getElementById("player-area").innerHTML =
    `
    <h2>我方</h2>
    <p>本體：${player.coreHp}</p>
    <p>鬼火：${player.energy}</p>
    <p>出擊次數：${player.attackChance}</p>
    <p>牌庫：${player.deck.length}　棄牌：${player.discardPile.length}</p>

    ${
        selectingCard
        ? `<p style="color:red;">正在選擇「${selectingCard.name}」的目標 
           <button onclick="cancelTargetSelect()">取消</button></p>`
        : ""
    }

    <h3>戰鬥區</h3>
    <div class="card battle-card" onclick="selectTarget('player', 'combat')">
        ${
            player.combat
            ? `${player.combat.name}<br>HP:${player.combat.currentHp}/${player.combat.hp}<br>ATK:${player.combat.atk}<br>盾:${player.combat.shield}<br>被動:${player.combat.passive.join(" / ")}`
            : "空"
        }
    </div>

    <h3>準備區</h3>
    ${
        player.bench.map((unit, index) => `
            <div class="bench-unit">
                <div class="card ${unit.isDead ? "dead-card" : ""}" onclick="${selectingCard ? `selectTarget('player', 'bench', ${index})` : `selectAlly(${index})`}">
                    ${unit.name}<br>
                    HP:${unit.currentHp}/${unit.hp}<br>
                    ATK:${unit.atk}<br>
                    盾:${unit.shield}<br>
                    被動:${unit.passive.join(" / ")}<br>
                    ${unit.isDead ? `復活:${unit.reviveCounter}` : ""}
                </div>
                <button onclick="enterCombat(${index})" ${unit.isDead ? "disabled" : ""}>
                    出擊
                </button>
            </div>
        `).join("")
    }
    `;

    document.getElementById("hand-area").innerHTML =
    `
    <h2>手牌</h2>
    ${
        player.hand.map((card, index) => `
            <button class="card" onclick="useCard(${index})">
                ${card.name}<br>
                費用:${card.cost}<br>
                ${card.type}<br>
                ${card.tags.join(" / ")}
            </button>
        `).join("")
    }
    `;
}

startGame();
