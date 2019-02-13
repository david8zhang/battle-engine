import { LooseObject } from "../interface/LooseObject";
import { Hero } from "./Hero";

export class Move {
  private name : string = '';
  private power : number = 0;
  private priority : number = 0;

  constructor(config : LooseObject) {
    if (config.name) this.name = config.name;
    if (config.power) this.power = config.power;
    if (config.priority) this.priority = config.priority;
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

  public calculateDamage(sourceHero : Hero, targetHero : Hero) : number {
    const attackDefenseRatio : number = sourceHero.getAttack() / targetHero.getDefense();
    const levelModifier : number = ((2.0 * sourceHero.getLevel()) / 5.0) + 2;
    let damage = ((levelModifier * this.power * attackDefenseRatio / 50) + 2)
    if (damage > targetHero.getHealth()) damage = targetHero.getHealth();
    return Math.floor(damage);
  }
}