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

        addLog(
            `${owner.name}使用${card.name}，對敵方全體造成${card.damage}傷害`
        );

        return;
    }

    let target = targetInfo.target;

    if(card.tags.includes("damage")){

        if(targetInfo.targetType === "core"){

            enemy.coreHp -= card.damage;

            addLog(
                `${owner.name}使用${card.name}，對敵方本體造成${card.damage}傷害`
            );

        }else{

            dealDamage(target, card.damage);

            addLog(
                `${owner.name}使用${card.name}，對${target.name}造成${card.damage}傷害`
            );
        }
    }

    if(card.tags.includes("heal")){

        healTarget(target, card.heal);

        addLog(
            `${owner.name}使用${card.name}，${target.name}恢復${card.heal}`
        );
    }

    if(card.tags.includes("shield")){

        target.shield += card.shield;

        addLog(
            `${owner.name}使用${card.name}，${target.name}獲得${card.shield}護盾`
        );
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
