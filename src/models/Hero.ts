import { IAbstractTurn } from "../interface/IAbstractTurn";
import { EffectTurn } from "./EffectTurn";
import { LooseObject } from "../interface/LooseObject";
import { Move } from "./Move";

const uuidV4 = require('uuid/v4');

export class Hero {
  private heroId : string = uuidV4();
  private name : string = 'name';
  private attack : number = 0;
  private defense : number = 0;
  private speed: number = 0;
  private health : number = 0;
  private maxHealth : number = 0;
  private level : number = 1;
  private effects : IAbstractTurn[] = [];
  private effectMapping : LooseObject;
  private moveSet : Move[] = [];
  private additionalStats : LooseObject;

  constructor(config : LooseObject) {
    if (config.name) this.name = config.name;
    if (config.heroId) this.heroId = config.heroId;
    if (config.attack) this.attack = config.attack;
    if (config.defense) this.defense = config.defense;
    if (config.level) this.level = config.level;
    if (config.speed) this.speed = config.speed;
    if (config.health) {
      this.health = config.health;
      this.maxHealth = config.health;
    }
    if (config.effects) this.effects = config.effects.map((effect : LooseObject) => new EffectTurn(effect));
    if (config.moveSet) this.moveSet = config.moveSet.map((move : LooseObject) => new Move(move));

    const regKeys = ['name', 'heroId', 'attack', 'defense', 'level', 'speed', 'health', 'effects', 'moveSet', 'maxHealth']
    Object.keys(config).forEach((key : string) => {
      if (!regKeys.includes(key)) {
        if (!this.additionalStats) this.additionalStats = {}
        this.additionalStats[key] = config[key]
      }
    })
  }

  public getAdditionalStats() : LooseObject {
    return this.additionalStats
  }

  public setAdditionalStats(additionalStats : LooseObject) : void {
    this.additionalStats = additionalStats
  }

  public getName() : string {
    return this.name
  }

  public setName(name : string) : void {
    this.name = name;
  }

  public getAttack() {
    return this.attack;
  }
  
  public setAttack(attack : number) {
    this.attack = attack;
  }

  public getDefense() {
    return this.defense;
  }

  public setDefense(defense : number) {
    this.defense = defense;
  }

  public getMaxHealth() : number {
    return this.maxHealth;
  }

  public setMaxHealth(maxHealth : number) {
    this.maxHealth = maxHealth
  }

  public getHealth() : number {
    return this.health;
  }

  public setHealth(health : number) : void {
    this.health = health
  }

  public getSpeed() : number {
    return this.speed;
  }

  public setSpeed(speed : number) : void {
    this.speed = speed;
  }

  public getHeroId() : string {
    return this.heroId;
  }

  public setHeroId(heroId : string) : void {
    this.heroId = heroId;
  }

  public getLevel() : number {
    return this.level;
  }

  public setLevel(level : number) : void {
    this.level = level;
  }

  public getEffects() : IAbstractTurn[] {
    return this.effects;
  }

  public getMoveSet() : Move[] {
    return this.moveSet;
  }

  public setMoveSet(moves : LooseObject[]) : void {
    const newMoveSet : Move[] = [];
    moves.forEach((m : LooseObject) => {
      newMoveSet.push(new Move(m));
    })
    this.moveSet = newMoveSet;
  }

  public setEffects(effects : IAbstractTurn[]) : void {
    if (!this.effectMapping) {
      this.effectMapping = {}
    }

    this.effects = [...effects];

    if (effects.length > 0) {
      effects.forEach((effect) => {
        this.effectMapping[effect.name] = effect;
      })
    } else {
      this.effectMapping = {};
    }
  }

  public addEffect(effect : IAbstractTurn, effectName : string) : void {
    if (!this.effectMapping) {
      this.effectMapping = {}
    }
    this.effects.push(effect)
    this.effectMapping[effectName] = effect
  }

  public checkDuplicateEffect(effectName : string) : boolean {
    if (this.effectMapping && this.effectMapping[effectName] && this.effectMapping[effectName].duration > 0) {
      return true;
    }
    return false;
  }

  public generateHeroObject(rawObject : LooseObject) : void {
    this.setHealth(rawObject.health);
    this.setAttack(rawObject.attack);
    this.setDefense(rawObject.defense);
    this.setName(rawObject.name);
    this.setMoveSet(rawObject.moveSet);

    if (rawObject.heroId) {
      this.heroId = rawObject.heroId
    }

    if (rawObject.effects) {
      const heroEffects : IAbstractTurn[] = rawObject.effects.map((effect : LooseObject) => {
        const structuredEffect = new EffectTurn(effect);
        return structuredEffect;
      })
      this.effects = heroEffects;
    }
  }
}