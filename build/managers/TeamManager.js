"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Hero_1 = require("../models/Hero");
const uuidV4 = require('uuid/v4');
const randomGenerator = function () {
    const heroes = {};
    for (let i = 0; i < 6; i++) {
        const heroId = uuidV4();
        const newHero = new Hero_1.Hero({
            attack: Math.floor(Math.random() * 10),
            defense: Math.floor(Math.random() * 10),
            health: Math.floor(Math.random() * 100) + 50,
            name: `Robo Hero ${i}`,
            heroId,
            moveSet: [{
                    power: 10,
                    name: 'Tackle'
                }, {
                    power: 20,
                    name: 'Flail'
                }, {
                    power: 50,
                    name: 'Hyper Beam'
                }]
        });
        heroes[heroId] = newHero;
    }
    return heroes;
};
class TeamManager {
    constructor(battleConfig) {
        if (battleConfig.playerTeam)
            this.playerTeam = this.convertToHeroes(battleConfig.playerTeam);
        if (battleConfig.enemyTeam)
            this.enemyTeam = this.convertToHeroes(battleConfig.enemyTeam);
        if (!this.playerTeam)
            this.playerTeam = randomGenerator();
        if (!this.enemyTeam)
            this.enemyTeam = randomGenerator();
        this.activePlayerHero = battleConfig.activePlayerHero || Object.keys(this.playerTeam)[0];
        this.activeEnemyHero = battleConfig.activeEnemyHero || Object.keys(this.enemyTeam)[0];
    }
    getEnemyTeam() {
        return this.enemyTeam;
    }
    getPlayerTeam() {
        return this.playerTeam;
    }
    getActivePlayerHero() {
        return this.playerTeam[this.activePlayerHero];
    }
    getActiveEnemyHero() {
        return this.enemyTeam[this.activeEnemyHero];
    }
    setActivePlayerHero(newActiveHeroId) {
        this.activePlayerHero = newActiveHeroId;
    }
    setActiveEnemyHero(newActiveHeroId) {
        this.activeEnemyHero = newActiveHeroId;
    }
    getHero(id) {
        if (this.enemyTeam[id]) {
            return this.enemyTeam[id];
        }
        else if (this.playerTeam[id]) {
            return this.playerTeam[id];
        }
        return null;
    }
    convertToHeroes(team) {
        if (!team) {
            return {};
        }
        const result = {};
        Object.keys(team).forEach((k) => {
            result[k] = new Hero_1.Hero(team[k]);
        });
        return result;
    }
}
exports.TeamManager = TeamManager;
//# sourceMappingURL=TeamManager.js.map