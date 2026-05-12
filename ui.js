function addLog(text){
    let log = document.getElementById("battle-log");
    log.innerHTML = text + "<br>" + log.innerHTML;
}

function render(){

    // 敵方本體
    document.getElementById("enemy-status").innerHTML =
    `
        <h2>敵方本體</h2>
        <p>HP：${enemy.coreHp}</p>
        <p>Cost：${enemy.energy ?? 3}</p>
        <p>出擊：${enemy.attackChance ?? 1}</p>
    `;

    // 我方本體
    document.getElementById("player-status").innerHTML =
    `
        <h2>我方本體</h2>
        <p>HP：${player.coreHp}</p>
        <p>Cost：${player.energy}</p>
        <p>出擊：${player.attackChance}</p>
    `;

    // 敵方準備區
    document.getElementById("enemy-bench").innerHTML =
    `
        <div class="bench-title">準備區</div>

        <div class="bench-zone bench-wrapper">
            ${
                enemy.bench.map((unit, index) => `
                    <div class="card ${unit.isDead ? "dead-card" : ""}"
                        onclick="${!unit.isDead ? `selectTarget('enemy', 'bench', ${index})` : ""}">
                        ${unit.name}<br>
                        (${unit.atk} x ${unit.currentHp})<br>
                        ${unit.isDead ? `復活:${unit.reviveCounter}` : ""}
                    </div>
                `).join("")
            }
        </div>
    `;

    // 敵方牌庫資訊
    document.getElementById("enemy-deck-info").innerHTML =
    `
        牌庫：${enemy.deck.length}張<br>
        棄牌堆：${enemy.discardPile.length}張
    `;

    // 敵方戰鬥區
    document.getElementById("enemy-combat").innerHTML =
    `
        <div class="card battle-card" onclick="selectTarget('enemy', 'combat')">
            ${
                enemy.combat
                ? `${enemy.combat.name}<br>
                   (${enemy.combat.atk} x ${enemy.combat.currentHp})<br>
                   盾:${enemy.combat.shield}`
                : "空"
            }
        </div>
    `;

    // 我方戰鬥區
    document.getElementById("player-combat").innerHTML =
    `
        <div class="card battle-card" onclick="selectTarget('player', 'combat')">
            ${
                player.combat
                ? `${player.combat.name}<br>
                   (${player.combat.atk} x ${player.combat.currentHp})<br>
                   盾:${player.combat.shield}`
                : "空"
            }
        </div>
    `;

    // 我方準備區
    document.getElementById("player-bench").innerHTML =
    `
        <div class="bench-title">準備區</div>

        <div class="bench-zone bench-wrapper">
            ${
                player.bench.map((unit, index) => `
                    <div class="bench-unit">
                        <div class="card ${unit.isDead ? "dead-card" : ""}"
                            onclick="${
                                selectingCard && !unit.isDead
                                ? `selectTarget('player', 'bench', ${index})`
                                : ""
                            }">
                            ${unit.name}<br>
                            (${unit.atk} x ${unit.currentHp})<br>
                            ${unit.isDead ? `復活:${unit.reviveCounter}` : ""}
                        </div>

                        <button onclick="enterCombat(${index})"
                            ${unit.isDead ? "disabled" : ""}>
                            出擊
                        </button>
                    </div>
                `).join("")
            }
        </div>
    `;

    // 我方牌庫資訊
    document.getElementById("player-deck-info").innerHTML =
    `
        牌庫：${player.deck.length}張<br>
        棄牌堆：${player.discardPile.length}張
    `;

    // 選目標提示
    const selectingText = selectingCard
        ? `<div class="selecting-message">
            正在選擇「${selectingCard.name}」的目標
            <button onclick="cancelTargetSelect()">取消</button>
           </div>`
        : "";

    // 手牌
    document.getElementById("hand-area").innerHTML =
    `
        ${selectingText}

        <div class="hand-zone">
            ${
                player.hand.map((card, index) => `
                    <button class="card hand-card ${card.type}" onclick="useCard(${index})">
                        <strong>${card.name}</strong><br>
                        費用：${card.cost}<br>
                        ${card.desc ? `<small>${card.desc}</small>` : ""}<br>
                        <span>${card.type}</span>
                    </button>
                `).join("")
            }
        </div>
    `;
}
