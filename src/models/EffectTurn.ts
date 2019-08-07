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

  private _checkHeroActive(id : string, teamManager : ITeamManager) : boolean {
    const enemyTeamIds = teamManager.getActiveEnemyTeam() ? teamManager.getActiveEnemyTeam().map((h : Hero) => h.getHeroId()) : [];
    const enemyId = teamManager.getActiveEnemyHero() ? teamManager.getActiveEnemyHero().getHeroId() : '';

    const playerTeamIds = teamManager.getActivePlayerTeam() ? teamManager.getActivePlayerTeam().map((h : Hero) => h.getHeroId()) : [];
    const playerId = teamManager.getActivePlayerHero() ? teamManager.getActivePlayerHero().getHeroId() : '';

    return (
      id === enemyId ||
      enemyTeamIds.indexOf(id) !== -1 ||
      id === playerId ||
      playerTeamIds.indexOf(id) !== -1
    );
  }

  public setEffect(effect : Function) { this.effect = effect }

  public processTurn(teamManager : ITeamManager, arenaManager : IArenaManager, turnQueue : TurnQueue) : LooseObject[] {
    const targets : Hero[] = [];

    this.targetHeroes.forEach((id : string) => {
      const hero = teamManager.getHero(id);
      if (this._checkHeroActive(id, teamManager) && hero && hero.getHealth() > 0) {
        targets.push(teamManager.getHero(id));
      }
    })
    
    const affectedTargetIds = targets.map((hero : Hero) => hero.getHeroId());
    this.duration = this.duration - 1;
    const effectLog = this.effect(targets, arenaManager, teamManager);

    // Check if any are dead
    this.targetHeroes.forEach((id : string) => {
      const hero = teamManager.getHero(id);
      if (affectedTargetIds.indexOf(id) !== -1 && hero && hero.getHealth() <= 0) {
        effectLog.push({
          type: 'Death',
          message: `${hero.getName()} died!`,
          result: { targetHeroId: id }
        })
      }
    })
    return effectLog;
  }
}