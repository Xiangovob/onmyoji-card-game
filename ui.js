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
            ? `${enemy.combat.name}<br>
               HP:${enemy.combat.currentHp}/${enemy.combat.hp}<br>
               ATK:${enemy.combat.atk}<br>
               盾:${enemy.combat.shield}<br>
               被動:${enemy.combat.passiveName}`
            : "空"
        }
    </div>

    <h3>準備區</h3>
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
        ? `<p style="color:red;">
            正在選擇「${selectingCard.name}」的目標
            <button onclick="cancelTargetSelect()">取消</button>
           </p>`
        : ""
    }

    <h3>戰鬥區</h3>
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

    <h3>準備區</h3>
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
    `;

    document.getElementById("hand-area").innerHTML =
    `
    <h2>手牌</h2>

    ${
        player.hand.map((card, index) => `
            <button class="card" onclick="useCard(${index})">

                <strong>${card.name}</strong><br>

                費用：${card.cost}<br>
                類型：${card.type}<br>
                標籤：${card.tags.join(" / ")}

                ${card.desc ? `<hr><small>${card.desc}</small>` : ""}

            </button>
        `).join("")
    }
    `;
}
