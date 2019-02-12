"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EffectTurn_1 = require("../models/EffectTurn");
class ArenaManager {
    constructor(battleConfig) {
        if (battleConfig.hazards) {
            const hazards = battleConfig.hazards.map((h) => {
                return new EffectTurn_1.EffectTurn(h);
            });
            this.hazards = hazards;
        }
        else {
            this.hazards = [];
        }
    }
    addHazard(hazard) {
        const newHazard = new EffectTurn_1.EffectTurn(hazard);
        this.hazards.push(newHazard);
    }
    getHazards() {
        return this.hazards;
    }
}
exports.ArenaManager = ArenaManager;
//# sourceMappingURL=ArenaManager.js.map