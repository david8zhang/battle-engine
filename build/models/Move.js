"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Move {
    constructor(config) {
        this.name = '';
        this.power = 0;
        this.priority = 0;
        if (config.name)
            this.name = config.name;
        if (config.power)
            this.power = config.power;
        if (config.priority)
            this.priority = config.priority;
    }
    getPower() {
        return this.power;
    }
    setPower(power) {
        this.power = power;
    }
    getPriority() {
        return this.priority;
    }
    setPriority(priority) {
        this.priority = priority;
    }
    getName() {
        return this.name;
    }
    setName(name) {
        this.name = name;
    }
    calculateDamage(sourceHero, targetHero) {
        let damage = (((this.power * sourceHero.getAttack() / targetHero.getDefense()) / 50) + 2);
        if (damage > targetHero.getHealth())
            damage = targetHero.getHealth();
        return Math.floor(damage);
    }
}
exports.Move = Move;
//# sourceMappingURL=Move.js.map