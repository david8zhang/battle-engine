"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ActionTurn_1 = require("../models/ActionTurn");
const SwitchTurn_1 = require("../models/SwitchTurn");
class CPUManager {
    constructor(battleConfig) {
        if (battleConfig.moveCalculator)
            this.moveCalculator = battleConfig.moveCalculator;
        if (battleConfig.switchCalculator)
            this.switchCalculator = battleConfig.switchCalculator;
    }
    defaultMoveCalculator(enemyHero, playerHero) {
        const moveSet = enemyHero.getMoveSet();
        if (moveSet.length === 0) {
            console.error(`Enemy ${enemyHero.getName()} has no moves!`);
            return null;
        }
        const chosenMove = moveSet[0];
        const deserializedMove = {
            name: chosenMove.getName(),
            power: chosenMove.getPower()
        };
        return new ActionTurn_1.ActionTurn({
            move: deserializedMove,
            sourceHeroId: enemyHero.getHeroId(),
            targetHeroIds: [playerHero.getHeroId()],
            priority: chosenMove.getPriority()
        });
    }
    defaultSwitchCalculator(enemyTeam, playerTeam) {
        let idToSwitchTo;
        Object.keys(enemyTeam).forEach((id) => {
            if (enemyTeam[id].getHealth() > 0) {
                idToSwitchTo = id;
            }
        });
        return new SwitchTurn_1.SwitchTurn({
            newActiveHero: idToSwitchTo,
            side: 'enemy'
        });
    }
    allDead(enemyTeam) {
        let allDead = true;
        Object.keys(enemyTeam).forEach((heroId) => {
            const enemy = enemyTeam[heroId];
            if (enemy.getHealth() > 0) {
                allDead = false;
            }
        });
        return allDead;
    }
    getCPUTurn(arenaManager, teamManager) {
        const hazards = arenaManager.getHazards();
        const playerHero = teamManager.getActivePlayerHero();
        const enemyHero = teamManager.getActiveEnemyHero();
        const playerTeam = teamManager.getPlayerTeam();
        const enemyTeam = teamManager.getEnemyTeam();
        const params = { hazards, playerHero, enemyHero, playerTeam, enemyTeam };
        if (this.allDead(enemyTeam)) {
            return null;
        }
        if (enemyHero.getHealth() === 0) {
            if (this.switchCalculator) {
                return new SwitchTurn_1.SwitchTurn(this.switchCalculator(params));
            }
            else {
                return this.defaultSwitchCalculator(enemyTeam, playerTeam);
            }
        }
        else {
            if (this.moveCalculator) {
                return new ActionTurn_1.ActionTurn(this.moveCalculator(params));
            }
            else {
                return this.defaultMoveCalculator(enemyHero, playerHero);
            }
        }
    }
}
exports.CPUManager = CPUManager;
//# sourceMappingURL=CPUManager.js.map