"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EffectTurn {
    constructor(config) {
        this.duration = 1;
        this.name = '';
        this.priority = 0;
        this.targetHeroes = [];
        if (config.duration)
            this.duration = config.duration;
        if (config.name)
            this.name = config.name;
        if (config.targetHeroes)
            this.targetHeroes = config.targetHeroes;
        if (config.priority)
            this.priority = config.priority;
        if (config.effect)
            this.effect = config.effect;
    }
    processTurn(teamManager, arenaManager, turnQueue) {
        const targets = [];
        this.targetHeroes.forEach((id) => {
            const hero = teamManager.getHero(id);
            if (hero && hero.getHealth() > 0) {
                targets.push(teamManager.getHero(id));
            }
        });
        this.duration = this.duration - 1;
        return this.effect(targets, arenaManager);
    }
}
exports.EffectTurn = EffectTurn;
//# sourceMappingURL=EffectTurn.js.map