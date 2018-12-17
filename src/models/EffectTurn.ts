import { ITeamManager } from '../interface/ITeamManager';
import { IArenaManager } from '../interface/IArenaManager';
import { IAbstractTurn } from '../interface/IAbstractTurn';
import { LooseObject } from '../interface/LooseObject';
import { TurnQueue } from '../managers/TurnManager';

export class EffectTurn implements IAbstractTurn {
  public duration : number = 1;
  public name : string = '';
  public priority : number = 0;
  public targetHeroes : string[] = [];

  constructor(config : LooseObject) {
    if (config.duration) this.duration = config.duration;
    if (config.name) this.name = config.name;
    if (config.targetHeroes) this.targetHeroes = config.targetHeroes;
    if (config.priority) this.priority = config.priority;
  }

  public processTurn(teamManager : ITeamManager, arenaManager : IArenaManager, turnQueue : TurnQueue) : string[] {
    return null;
  }
}