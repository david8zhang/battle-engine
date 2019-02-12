"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TeamManager_1 = require("./TeamManager");
const ArenaManager_1 = require("./ArenaManager");
const TurnManager_1 = require("./TurnManager");
const CPUManager_1 = require("./CPUManager");
class BattleManager {
    constructor(battleConfig) {
        this.teamManager = new TeamManager_1.TeamManager(battleConfig);
        this.arenaManager = new ArenaManager_1.ArenaManager(battleConfig);
        this.cpuManager = new CPUManager_1.CPUManager(battleConfig);
        this.turnManager = new TurnManager_1.TurnManager(this.teamManager, this.arenaManager, this.cpuManager);
    }
    doPlayerTurn(playerInput) {
        this.turnManager.addPlayerTurn(playerInput);
        const actionLog = this.turnManager.processTurnQueue();
        return actionLog;
    }
    getEnemyTeam() {
        return this.deserializeTeam(this.teamManager.getEnemyTeam());
    }
    getPlayerTeam() {
        return this.deserializeTeam(this.teamManager.getPlayerTeam());
    }
    getActivePlayerHero() {
        return this.deserializeHero(this.teamManager.getActivePlayerHero());
    }
    getActiveEnemyHero() {
        return this.deserializeHero(this.teamManager.getActiveEnemyHero());
    }
    deserializeMoves(moves) {
        return moves.map((m) => {
            return {
                name: m.getName(),
                power: m.getPower(),
                priority: m.getPriority()
            };
        });
    }
    deserializeTeam(team) {
        const deserializedResult = [];
        Object.keys(team).forEach((id) => {
            const e = team[id];
            deserializedResult.push(this.deserializeHero(e));
        });
        return deserializedResult;
    }
    deserializeHero(hero) {
        return {
            name: hero.getName(),
            health: hero.getHealth(),
            attack: hero.getAttack(),
            defense: hero.getDefense(),
            speed: hero.getSpeed(),
            heroId: hero.getHeroId(),
            effects: hero.getEffects(),
            moveSet: this.deserializeMoves(hero.getMoveSet())
        };
    }
}
exports.BattleManager = BattleManager;
//# sourceMappingURL=BattleManager.js.map