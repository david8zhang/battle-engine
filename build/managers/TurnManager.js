"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EffectTurn_1 = require("../models/EffectTurn");
const ActionTurn_1 = require("../models/ActionTurn");
const SwitchTurn_1 = require("../models/SwitchTurn");
const TurnFactory = {
    ActionTurn: ActionTurn_1.ActionTurn,
    EffectTurn: EffectTurn_1.EffectTurn,
    SwitchTurn: SwitchTurn_1.SwitchTurn
};
class TurnQueue {
    constructor(teamManager) {
        this.teamManager = teamManager;
        this.queue = [];
    }
    showError(msg, turn) {
        console.error(msg, turn);
    }
    calculateSpeedPriority(a, b) {
        const heroA = this.teamManager.getHero(a.sourceHeroId);
        const heroB = this.teamManager.getHero(b.sourceHeroId);
        if (!heroA) {
            this.showError('Error, turn has invalid source hero id!', a);
        }
        else if (!heroB) {
            this.showError('Error, turn has invalid source hero id', b);
        }
        return heroB.getSpeed() - heroA.getSpeed();
    }
    enqueueTurn(turn) {
        const newQueue = this.queue.concat(turn).sort((a, b) => {
            if (a.priority === b.priority && (a.sourceHeroId && b.sourceHeroId)) {
                return this.calculateSpeedPriority(a, b);
            }
            else {
                return a.priority - b.priority;
            }
        });
        this.queue = newQueue;
    }
    enqueueTurns(turnArray) {
        const newQueue = this.queue.concat(turnArray).sort((a, b) => {
            if (a.priority === b.priority && (a.sourceHeroId && b.sourceHeroId)) {
                return this.calculateSpeedPriority(a, b);
            }
            else {
                return a.priority - b.priority;
            }
        });
        this.queue = newQueue;
    }
    dequeueTurn() {
        if (this.queue.length > 0) {
            return this.queue.shift();
        }
        return null;
    }
    size() {
        return this.queue.length;
    }
    _getQueue() {
        return this.queue;
    }
}
exports.TurnQueue = TurnQueue;
class TurnManager {
    constructor(teamManager, arenaManager, cpuManager) {
        this.teamManager = teamManager;
        this.arenaManager = arenaManager;
        this.cpuManager = cpuManager;
        this.turnQueue = new TurnQueue(teamManager);
    }
    processTurnQueue() {
        this.addEffectsToQueue();
        if (this.cpuManager) {
            this.addCPUTurn();
        }
        let actionLog = [];
        while (this.turnQueue.size() > 0) {
            const turnToProcess = this.turnQueue.dequeueTurn();
            const actions = turnToProcess.processTurn(this.teamManager, this.arenaManager, this.turnQueue);
            actionLog = actionLog.concat(actions);
            if (this.checkWinCondition(actionLog)) {
                break;
            }
            if (this.teamManager.getActiveEnemyHero().getHealth() === 0) {
                this.addCPUTurn();
            }
            if (this.teamManager.getActivePlayerHero().getHealth() === 0) {
                break;
            }
        }
        return actionLog.filter((action) => action !== null);
    }
    checkWinCondition(actionLog) {
        const playerTeam = this.teamManager.getPlayerTeam();
        const enemyTeam = this.teamManager.getEnemyTeam();
        let enemyWin = true;
        Object.keys(playerTeam).forEach((key) => {
            const p = playerTeam[key];
            if (p.getHealth() > 0) {
                enemyWin = false;
            }
        });
        let playerWin = true;
        Object.keys(enemyTeam).forEach((key) => {
            const e = enemyTeam[key];
            if (e.getHealth() > 0) {
                playerWin = false;
            }
        });
        if (playerWin) {
            actionLog.push({
                type: 'Win',
                result: {
                    side: 'player'
                }
            });
            return true;
        }
        if (enemyWin) {
            actionLog.push({
                type: 'Win',
                result: {
                    side: 'enemy'
                }
            });
            return true;
        }
        return false;
    }
    addEffectsToQueue() {
        const arenaEffects = this.arenaManager
            .getHazards()
            .filter((effect) => effect.duration > 0);
        const activePlayerHeroEffects = this.teamManager
            .getActivePlayerHero()
            .getEffects()
            .filter((effect) => effect.duration > 0);
        const activeEnemyHeroEffects = this.teamManager
            .getActiveEnemyHero()
            .getEffects()
            .filter((effect) => effect.duration > 0);
        if (arenaEffects.length > 0)
            this.turnQueue.enqueueTurns(arenaEffects);
        if (activeEnemyHeroEffects.length > 0)
            this.turnQueue.enqueueTurns(activeEnemyHeroEffects);
        if (activePlayerHeroEffects.length > 0)
            this.turnQueue.enqueueTurns(activePlayerHeroEffects);
    }
    addPlayerTurn(playerInput) {
        const actionType = playerInput.actionType;
        const action = new TurnFactory[actionType](playerInput);
        this.turnQueue.enqueueTurn(action);
    }
    addCPUTurn() {
        if (this.cpuManager) {
            const cpuTurn = this.cpuManager.getCPUTurn(this.arenaManager, this.teamManager);
            if (cpuTurn) {
                this.turnQueue.enqueueTurn(cpuTurn);
            }
        }
    }
    _getTurnQueue() {
        return this.turnQueue;
    }
    _setTurnQueue(turnQueue) {
        this.turnQueue = turnQueue;
    }
}
exports.TurnManager = TurnManager;
//# sourceMappingURL=TurnManager.js.map