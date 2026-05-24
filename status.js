function ensureStatusList(unit){
    if(!unit.statuses){
        unit.statuses = [];
    }
}

function addStatus(unit, status){
    ensureStatusList(unit);

    unit.statuses.push({
        type: status.type,
        value: status.value ?? 0,
        duration: status.duration ?? 1
    });
}

function hasStatus(unit, type){
    ensureStatusList(unit);
    return unit.statuses.some(status => status.type === type);
}

function getStatusValue(unit, type){
    ensureStatusList(unit);

    return unit.statuses
        .filter(status => status.type === type)
        .reduce((total, status) => total + (status.value ?? 0), 0);
}

function removeStatus(unit, type){
    ensureStatusList(unit);

    unit.statuses = unit.statuses.filter(status => status.type !== type);
}

function tickStatusDuration(unit){
    ensureStatusList(unit);

    unit.statuses.forEach(status => {
        status.duration--;
    });

    unit.statuses = unit.statuses.filter(status => status.duration > 0);
}

function clearTemporaryStatus(unit){
    ensureStatusList(unit);

    unit.statuses = unit.statuses.filter(status => {
        return status.duration === "permanent";
    });
}
