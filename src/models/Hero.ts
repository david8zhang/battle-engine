import { IAbstractTurn } from "../interface/IAbstractTurn";
import { EffectTurn } from "./EffectTurn";
import { LooseObject } from "../interface/LooseObject";

const uuidV4 = require('uuid/v4');

export class Hero {
  private heroId : string = uuidV4();
  private name : string = 'name';
  private attack : number = 0;
  private defense : number = 0;
  private health : number = 0;
  private effects : IAbstractTurn[] = [];

  constructor(config : LooseObject) {
    if (config.name) this.name = config.name;
    if (config.heroId) this.heroId = config.heroId;
    if (config.attack) this.attack = config.attack;
    if (config.defense) this.defense = config.defense;
    if (config.health) this.health = config.health;
    if (config.effects) this.effects = config.effects;
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

  public getHealth() : number {
    return this.health;
  }

  public setHealth(health : number) : void {
    this.health = health
  }

  public getHeroId() : string {
    return this.heroId;
  }

  public setHeroId(heroId : string) : void {
    this.heroId = heroId;
  }

  public getEffects() : IAbstractTurn[] {
    return this.effects;
  }

  public setEffects(effects : IAbstractTurn[]) {
    this.effects = effects;
  }

  public generateHeroObject(rawObject : LooseObject) : void {
    this.health = rawObject.health;
    this.attack = rawObject.attack;
    this.defense = rawObject.defense;
    this.name = rawObject.name;

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