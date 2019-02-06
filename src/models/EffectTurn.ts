import { ITeamManager } from '../interface/ITeamManager';
import { IArenaManager } from '../interface/IArenaManager';
import { IAbstractTurn } from '../interface/IAbstractTurn';
import { LooseObject } from '../interface/LooseObject';
import { TurnQueue } from '../managers/TurnManager';
import { Hero } from './Hero';

export class EffectTurn implements IAbstractTurn {
  public duration : number = 1;
  public name : string = '';
  public priority : number = 0;
  public targetHeroes : string[] = [];
  public effect : Function;

  constructor(config : LooseObject) {
    if (config.duration) this.duration = config.duration;
    if (config.name) this.name = config.name;
    if (config.targetHeroes) this.targetHeroes = config.targetHeroes;
    if (config.priority) this.priority = config.priority;
    if (config.effect) this.effect = config.effect;
  }

  public processTurn(teamManager : ITeamManager, arenaManager : IArenaManager, turnQueue : TurnQueue) : string[] {
    const targets : Hero[] = [];
    this.targetHeroes.forEach((id : string) => {
      const hero = teamManager.getHero(id);
      if (hero && hero.getHealth() > 0) {
        targets.push(teamManager.getHero(id));        
      }
    })
    this.duration = this.duration - 1;
    return this.effect(targets, arenaManager);
  }
}