"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Move_1 = require("./Move");
class ActionTurn {
    constructor(config) {
        this.move = null;
        this.targetHeroIds = [];
        this.sourceHeroId = '';
        this.priority = 0;
        if (config.move)
            this.move = new Move_1.Move(config.move);
        if (config.targetHeroIds)
            this.targetHeroIds = config.targetHeroIds;
        if (config.sourceHeroId)
            this.sourceHeroId = config.sourceHeroId;
        if (config.priority)
            this.priority = config.priority;
    }
    _getMove() {
        return this.move;
    }
    _getTargetHeroIds() {
        return this.targetHeroIds;
    }
    _getSourceHeroId() {
        return this.sourceHeroId;
    }
    processTurn(teamManager, arenaManager, turnQueue) {
        const playerTeam = teamManager.getPlayerTeam();
        const enemyTeam = teamManager.getEnemyTeam();
        const actionLogs = [];
        let sourceHero;
        if (playerTeam[this.sourceHeroId] !== undefined)
            sourceHero = playerTeam[this.sourceHeroId];
        else if (enemyTeam[this.sourceHeroId] !== undefined)
            sourceHero = enemyTeam[this.sourceHeroId];
        if (!sourceHero || sourceHero.getHealth() === 0) {
            return [];
        }
        this.targetHeroIds.forEach((id) => {
            let targetHero;
            if (playerTeam[id])
                targetHero = playerTeam[id];
            if (enemyTeam[id])
                targetHero = enemyTeam[id];
            if (targetHero.getHealth() > 0) {
                const damage = this.move.calculateDamage(sourceHero, targetHero);
                targetHero.setHealth(targetHero.getHealth() - damage);
                actionLogs.push({
                    type: 'Action',
                    message: `${sourceHero.getName()} used ${this.move.getName()} and dealt ${damage} to ${targetHero.getName()}`,
                    result: {
                        damage,
                        sourceHeroId: this.sourceHeroId,
                        targetHeroId: targetHero.getHeroId(),
                        move: this.move.getName()
                    }
                });
                if (targetHero.getHealth() === 0) {
                    actionLogs.push({
                        type: 'Death',
                        message: `${targetHero.getName()} died!`,
                        result: {
                            targetHeroId: targetHero.getHeroId()
                        }
                    });
                }
            }
        });
        return actionLogs;
    }
}
exports.ActionTurn = ActionTurn;
//# sourceMappingURL=ActionTurn.js.map