"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EffectTurn_1 = require("./EffectTurn");
const Move_1 = require("./Move");
const uuidV4 = require('uuid/v4');
class Hero {
    constructor(config) {
        this.heroId = uuidV4();
        this.name = 'name';
        this.attack = 0;
        this.defense = 0;
        this.speed = 0;
        this.health = 0;
        this.effects = [];
        this.moveSet = [];
        if (config.name)
            this.name = config.name;
        if (config.heroId)
            this.heroId = config.heroId;
        if (config.attack)
            this.attack = config.attack;
        if (config.defense)
            this.defense = config.defense;
        if (config.speed)
            this.speed = config.speed;
        if (config.health)
            this.health = config.health;
        if (config.effects)
            this.effects = config.effects.map((effect) => new EffectTurn_1.EffectTurn(effect));
        if (config.moveSet)
            this.moveSet = config.moveSet.map((move) => new Move_1.Move(move));
    }
    getName() {
        return this.name;
    }
    setName(name) {
        this.name = name;
    }
    getAttack() {
        return this.attack;
    }
    setAttack(attack) {
        this.attack = attack;
    }
    getDefense() {
        return this.defense;
    }
    setDefense(defense) {
        this.defense = defense;
    }
    getHealth() {
        return this.health;
    }
    setHealth(health) {
        this.health = health;
    }
    getSpeed() {
        return this.speed;
    }
    setSpeed(speed) {
        this.speed = speed;
    }
    getHeroId() {
        return this.heroId;
    }
    setHeroId(heroId) {
        this.heroId = heroId;
    }
    getEffects() {
        return this.effects;
    }
    getMoveSet() {
        return this.moveSet;
    }
    setMoveSet(moves) {
        const newMoveSet = [];
        moves.forEach((m) => {
            newMoveSet.push(new Move_1.Move(m));
        });
        this.moveSet = newMoveSet;
    }
    setEffects(effects) {
        this.effects = effects;
    }
    generateHeroObject(rawObject) {
        this.setHealth(rawObject.health);
        this.setAttack(rawObject.attack);
        this.setDefense(rawObject.defense);
        this.setName(rawObject.name);
        this.setMoveSet(rawObject.moveSet);
        if (rawObject.heroId) {
            this.heroId = rawObject.heroId;
        }
        if (rawObject.effects) {
            const heroEffects = rawObject.effects.map((effect) => {
                const structuredEffect = new EffectTurn_1.EffectTurn(effect);
                return structuredEffect;
            });
            this.effects = heroEffects;
        }
    }
}
exports.Hero = Hero;
//# sourceMappingURL=Hero.js.map