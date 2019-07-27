import { LooseObject } from "../interface/LooseObject";
import { Hero } from "./Hero";

export class Move {
  private name : string = '';
  private power : number = 0;
  private priority : number = 0;
  private isHeal : boolean = false
  private healAmt : number = 0;
  private customDamageCalculator : Function;
  private additionalStats : LooseObject;
  private effects : LooseObject[];

  constructor(config : LooseObject) {
    if (config.name) this.name = config.name;
    if (config.power) this.power = config.power;
    if (config.priority) this.priority = config.priority;
    if (config.isHeal) this.isHeal = config.isHeal
    if (config.healAmt) this.healAmt = config.healAmt
    if (config.customDamageCalculator) this.customDamageCalculator = config.customDamageCalculator
    if (config.effects) this.effects = config.effects

    const defaultKeys = ['name', 'power', 'priority', 'isHeal', 'healAmt', 'customDamageCalculator', 'effects']
    Object.keys(config).forEach((key : string) => {
      if (!defaultKeys.includes(key)) {
        if (!this.additionalStats) this.additionalStats = {}
        this.additionalStats[key] = config[key]
      }
    })
  }

  public getPower() : number {
    return this.power;
  }

  public setPower(power : number) {
    this.power = power;
  }

  public getPriority() : number {
    return this.priority;
  }

  public setPriority(priority : number) : void {
    this.priority = priority;
  }

  public getName() : string {
    return this.name;
  }
  
  public setName(name : string) {
    this.name = name;
  }

  public getIsHeal() : boolean {
    return this.isHeal
  }

  public setIsHeal(isHeal : boolean) {
    this.isHeal = isHeal
  }

  public getHealAmt() : number {
    return this.healAmt;
  }

  public setHealAmt(healAmt : number) : void {
    this.healAmt = healAmt
  }
  
  public calculateHealing(sourceHero : Hero, targetHero : Hero) : number {
    const rawHealAmt = Math.floor(targetHero.getMaxHealth() * this.healAmt)
    if (rawHealAmt + targetHero.getHealth() > targetHero.getMaxHealth()) {
      return targetHero.getMaxHealth() - targetHero.getHealth()
    }
    return rawHealAmt
  }

  public calculateDamage(sourceHero : Hero, targetHero : Hero) : number {
    if (this.customDamageCalculator) {
      return this.customDamageCalculator(sourceHero, targetHero)
    }
    const attackDefenseRatio : number = sourceHero.getAttack() / targetHero.getDefense();
    const levelModifier : number = ((2.0 * sourceHero.getLevel()) / 5.0) + 2;
    let damage = ((levelModifier * this.power * attackDefenseRatio / 50) + 2)
    if (damage > targetHero.getHealth()) damage = targetHero.getHealth();
    return Math.floor(damage);
  }

  public getAdditionalStats() : LooseObject {
    return this.additionalStats
  }

  public getEffects() : LooseObject[] {
    return this.effects;
  }
  public setEffects(effects : LooseObject[]) : void {
    this.effects = effects
  }
}