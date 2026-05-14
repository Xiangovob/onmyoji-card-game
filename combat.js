function getAtk(unit){

    let baseAtk =
        unit.form
        ? unit.form.atk
        : unit.atk;

    return (
        baseAtk +
        unit.buffAtk -
        unit.debuffAtk
    );
}
