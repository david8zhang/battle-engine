"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SwitchTurn {
    constructor(config) {
        this.priority = -1;
        this.newActiveHero = config.newActiveHero;
        this.side = config.side;
    }
    _getNewActiveHero() {
        return this.newActiveHero;
    }
    _getSide() {
        return this.side;
    }
    processTurn(teamManager, arenaManager, turnQueue) {
        const actionLog = [];
        if (teamManager.getHero(this.newActiveHero).getHealth() === 0) {
            console.error('Hero to switch to is already dead!', this.newActiveHero);
            return null;
        }
        if (this.side === 'player') {
            if (!teamManager.getPlayerTeam()[this.newActiveHero]) {
                console.error(`Hero with id ${this.newActiveHero} not exist on ${this.side} team`);
                return null;
            }
            this.redirectAttacks(this.newActiveHero, turnQueue);
            const oldActiveHero = teamManager.getActivePlayerHero();
            teamManager.setActivePlayerHero(this.newActiveHero);
            actionLog.push({
                type: 'Switch',
                message: `Player sent out ${teamManager.getHero(this.newActiveHero).getName()}`,
                result: {
                    side: this.side,
                    old: oldActiveHero.getHeroId(),
                    new: this.newActiveHero
                }
            });
            return actionLog;
        }
        else {
            if (!teamManager.getEnemyTeam()[this.newActiveHero]) {
                console.error(`Hero does with id ${this.newActiveHero} not exist on ${this.side} team`);
                return null;
            }
            this.redirectAttacks(this.newActiveHero, turnQueue);
            const oldActiveHero = teamManager.getActiveEnemyHero();
            teamManager.setActiveEnemyHero(this.newActiveHero);
            actionLog.push({
                type: 'Switch',
                message: `Enemy sent out ${teamManager.getHero(this.newActiveHero).getName()}`,
                result: {
                    side: this.side,
                    old: oldActiveHero.getHeroId(),
                    new: this.newActiveHero
                }
            });
            return actionLog;
        }
    }
    redirectAttacks(newActiveHero, turnQueue) {
        let ctr = 0;
        while (ctr < turnQueue.size()) {
            const turn = turnQueue.dequeueTurn();
            if (turn.targetHeroIds && turn.targetHeroIds.length == 1) {
                turn.targetHeroIds = [newActiveHero];
            }
            if (turn.targetHeroes && turn.targetHeroes.length == 1) {
                turn.targetHeroes = [newActiveHero];
            }
            turnQueue.enqueueTurn(turn);
            ctr++;
        }
    }
}
exports.SwitchTurn = SwitchTurn;
//# sourceMappingURL=SwitchTurn.js.map