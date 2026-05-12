function addLog(text){
    let log = document.getElementById("battle-log");
    log.innerHTML = text + "<br>" + log.innerHTML;
}

function render(){

    // 左側：敵方本體
    document.getElementById("enemy-status").innerHTML =
    `
        <h2>敵方本體</h2>
        <p>Cost：${enemy.energy ?? 3}</p>
        <p>出擊：${enemy.attackChance ?? 1}</p>
    `;

    // 左側：我方本體
    document.getElementById("player-status").innerHTML =
    `
        <h2>我方本體</h2>
        <p>Cost：${player.energy}</p>
        <p>出擊：${player.attackChance}</p>
        <p>HP：${player.coreHp}</p>
    `;

    // 敵方準備區
    document.getElementById("enemy-bench").innerHTML =
    `
        <div class="bench-title">準備區</div>
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
        <h2>敵方戰鬥區</h2>
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
        <h2>我方戰鬥區</h2>
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
    `;

    // 我方牌庫資訊
    document.getElementById("enemy-status").innerHTML =
`
    <div class="status-title">敵方本體</div>

    <div class="mini-info">
        HP：${enemy.coreHp}<br><br>

        Cost：${enemy.energy}<br><br>

        出擊：${enemy.attackChance}
    </div>
`;

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
