import { IAbstractTurn } from "../interface/IAbstractTurn";
import { LooseObject } from "../interface/LooseObject";
import { ITeamManager } from "../interface/ITeamManager";
import { IArenaManager } from "../interface/IArenaManager";
import { TurnQueue } from "../managers/TurnManager";
import { Hero } from "./Hero";

export class MultiSwitchTurn implements IAbstractTurn {
  public priority = -1;
  private newActiveTeam : string[];
  private side : string;

  constructor(config : LooseObject) {
    this.newActiveTeam = config.newActiveTeam;
    this.side = config.side;
  }
  
  public _getNewActiveTeam() : string[] {
    return this.newActiveTeam;
  }

  public _getSide() : string { 
    return this.side;
  }

  // All attacks directed at the hero squad to be switched out will effectively be nullified 
  // by this switch. Multi-attacks work on a timeout system to prevent from abusing squad-switching
  public _nullifyAttacks(turnQueue : TurnQueue, currentTeamIds : string[]) : void {
    let ctr = 0;
    while (ctr <= turnQueue.size()) {
      const turn : LooseObject = turnQueue.dequeueTurn();
      if (!turn.targetHeroIds || currentTeamIds.indexOf(turn.targetHeroIds[0]) === -1) {
        turnQueue.enqueueTurn(turn as IAbstractTurn);
      }
      ctr++;
    }
  }

  private _generateSwitchMessage(newActiveHeroes : Hero[], oldActiveHeroes : Hero[]) {
    let heroesToSwitch = '';
    let hasInvalid = false;
    const oldActiveHeroIds = oldActiveHeroes.map((h : Hero) => h.getHeroId());
    newActiveHeroes.forEach((hero : Hero, index : number) => {
      if (hero.getHealth() <= 0) {
        hasInvalid = true;
      } else {
        if (oldActiveHeroIds.indexOf(hero.getHeroId()) === -1) {
          if (index === newActiveHeroes.length - 1) {
            heroesToSwitch += `${hero.getName()} switched out!`
          } else {
            heroesToSwitch += `${hero.getName()}, `
          }
        }
      }
    })
    if (hasInvalid) {
      console.error('Invalid hero! One of your switch out heroes is already dead');
      return;
    }
    return heroesToSwitch;
  }

  public processTurn (teamManager : ITeamManager, arenaManager : IArenaManager, turnQueue : TurnQueue) : LooseObject[] {
    const actionLog : LooseObject[] = [];
    const newHeroes = teamManager.getHeroes(this.newActiveTeam);
    let hasInvalid = false;
    if (hasInvalid) {
      console.error('Switched out heroes invalid! One or more are dead!');
    } else {
      if (this.side === 'player') {
        const oldActiveHeroTeam : Hero[] = teamManager.getActivePlayerTeam();
        const message = this._generateSwitchMessage(newHeroes, oldActiveHeroTeam);
        this._nullifyAttacks(turnQueue, oldActiveHeroTeam.map((h : Hero) => h.getHeroId()));
        teamManager.setActivePlayerTeam(this.newActiveTeam);
        actionLog.push({
          type: 'MultiSwitch',
          message,
          result: {
            side: this.side,
            oldActiveHeroTeam,
            newActiveHeroTeam: teamManager.getActivePlayerTeam()
          }
        });
      } else {
        const oldActiveHeroTeam : Hero[] = teamManager.getActiveEnemyTeam();
        const message = this._generateSwitchMessage(newHeroes, oldActiveHeroTeam);
        this._nullifyAttacks(turnQueue, oldActiveHeroTeam.map((h : Hero) => h.getHeroId()));
        teamManager.setActiveEnemyTeam(this.newActiveTeam);
        actionLog.push({
          type: 'MultiSwitch',
          message,
          result: {
            side: this.side,
            oldActiveHeroTeam,
            newActiveHeroTeam: teamManager.getActiveEnemyTeam()
          }
        })
      }
    }
    return actionLog;
  }
}