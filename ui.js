function addLog(text){
    let log = document.getElementById("battle-log");
    log.innerHTML = text + "<br>" + log.innerHTML;
}

function render(){

    // 左側固定資訊欄
    document.getElementById("enemy-status").innerHTML =
    `
        <div class="status-title">敵方本體</div>
        <div class="core-hp" onclick="selectTarget('enemy', 'core')">
            ${enemy.coreHp}
        </div>
        <div class="mini-info">
            牌庫：${enemy.deck.length}<br>
            棄牌：${enemy.discardPile.length}
        </div>
    `;

    document.getElementById("energy-status").innerHTML =
    `
        <div class="energy-ball">${player.energy}/3</div>
        <div class="status-label">鬼火</div>
    `;

    document.getElementById("attack-status").innerHTML =
    `
        <div class="attack-icon">${player.attackChance}</div>
        <div class="status-label">出擊次數</div>
    `;

    document.getElementById("player-status").innerHTML =
    `
        <div class="status-title">我方本體</div>
        <div class="core-hp">
            ${player.coreHp}
        </div>
        <div class="mini-info">
            牌庫：${player.deck.length}<br>
            棄牌：${player.discardPile.length}
        </div>
    `;

    // 敵方區：只留下準備區 + 戰鬥區
    document.getElementById("enemy-area").innerHTML =
    `
    <div class="bench-zone">
        <h3>敵方準備區</h3>
        ${
            enemy.bench.map((unit, index) => `
                <div class="card ${unit.isDead ? "dead-card" : ""}"
                    onclick="${!unit.isDead ? `selectTarget('enemy', 'bench', ${index})` : ""}">
                    ${unit.name}<br>
                    HP:${unit.currentHp}/${unit.hp}<br>
                    ATK:${unit.atk}<br>
                    盾:${unit.shield}<br>
                    被動:${unit.passiveName}<br>
                    ${unit.isDead ? `復活:${unit.reviveCounter}` : ""}
                </div>
            `).join("")
        }
    </div>

    <div class="combat-zone enemy-combat-zone">
        <h3>敵方戰鬥區</h3>

        <div class="card battle-card" onclick="selectTarget('enemy', 'combat')">
            ${
                enemy.combat
                ? `${enemy.combat.name}<br>
                   HP:${enemy.combat.currentHp}/${enemy.combat.hp}<br>
                   ATK:${enemy.combat.atk}<br>
                   盾:${enemy.combat.shield}<br>
                   被動:${enemy.combat.passiveName}`
                : "空"
            }
        </div>
    </div>
    `;

    // 我方區：只留下選目標提示 + 戰鬥區 + 準備區
    document.getElementById("player-area").innerHTML =
    `
    ${
        selectingCard
        ? `<p class="selecting-message">
            正在選擇「${selectingCard.name}」的目標
            <button onclick="cancelTargetSelect()">取消</button>
           </p>`
        : ""
    }

    <div class="combat-zone player-combat-zone">
        <h3>我方戰鬥區</h3>

        <div class="card battle-card" onclick="selectTarget('player', 'combat')">
            ${
                player.combat
                ? `${player.combat.name}<br>
                   HP:${player.combat.currentHp}/${player.combat.hp}<br>
                   ATK:${player.combat.atk}<br>
                   盾:${player.combat.shield}<br>
                   被動:${player.combat.passiveName}`
                : "空"
            }
        </div>
    </div>

    <div class="bench-zone">
        <h3>我方準備區</h3>
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
                        HP:${unit.currentHp}/${unit.hp}<br>
                        ATK:${unit.atk}<br>
                        盾:${unit.shield}<br>
                        被動:${unit.passiveName}<br>

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

    // 手牌區
    document.getElementById("hand-area").innerHTML =
    `
    <div class="hand-zone">
        <h2 class="zone-title">手牌</h2>

        ${
            player.hand.map((card, index) => `
                <button class="card hand-card ${card.type}" onclick="useCard(${index})">

                    <strong>${card.name}</strong><br>

                    費用：${card.cost}<br>
                    類型：${card.type}<br>
                    標籤：${card.tags.join(" / ")}

                    ${card.desc ? `<hr><small>${card.desc}</small>` : ""}

                </button>
            `).join("")
        }
    </div>
    `;
}
