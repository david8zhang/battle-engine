import { IAbstractTurn } from "../interface/IAbstractTurn";
import { LooseObject } from "../interface/LooseObject";
import { ITeamManager } from "../interface/ITeamManager";
import { IArenaManager } from "../interface/IArenaManager";
import { TurnQueue } from "../managers/TurnManager";

export class SwitchTurn implements IAbstractTurn {
  public priority : number = -1;
  private newActiveHero : string;
  private side : string;

  constructor(config : LooseObject) {
    this.newActiveHero = config.newActiveHero;
    this.side = config.side;
  }

  public processTurn(teamManager : ITeamManager, arenaManager : IArenaManager, turnQueue : TurnQueue) : LooseObject[] {
    const actionLog : LooseObject[] = [];
    if (teamManager.getHero(this.newActiveHero).getHealth() === 0) {
      console.error('Hero to switch to is already dead!', this.newActiveHero);
      return null;
    }
    if (this.side === 'player') {
      if (!teamManager.getPlayerTeam()[this.newActiveHero]) {
        console.error(`Hero with id ${this.newActiveHero} not exist on ${this.side} team`);
        return null;
      }
      this.redirectAttacks(this.newActiveHero, turnQueue);
      const oldActiveHero = teamManager.getActivePlayerHero();
      teamManager.setActivePlayerHero(this.newActiveHero);
      actionLog.push({
        type: 'Switch',
        message: `Player sent out ${teamManager.getHero(this.newActiveHero).getName()}`,
        result: {
          side: this.side,
          old: oldActiveHero.getHeroId(),
          new: this.newActiveHero
        }
      });
      return actionLog;
    } else {
      if (!teamManager.getEnemyTeam()[this.newActiveHero]) {
        console.error(`Hero does with id ${this.newActiveHero} not exist on ${this.side} team`);
        return null;
      }
      this.redirectAttacks(this.newActiveHero, turnQueue);
      const oldActiveHero = teamManager.getActivePlayerHero();
      teamManager.setActiveEnemyHero(this.newActiveHero);
      actionLog.push({
        type: 'Switch',
        message: `Enemy sent out ${teamManager.getHero(this.newActiveHero).getName()}`,
        result: {
          side: this.side,
          old: oldActiveHero.getHeroId(),
          new: this.newActiveHero
        }
      })
      return actionLog;
    }
  }

  private redirectAttacks(newActiveHero : string, turnQueue : TurnQueue) : void {
    let ctr = 0;
    while(ctr < turnQueue.size()) {
      const turn : LooseObject = turnQueue.dequeueTurn();
      if (turn.targetHeroIds && turn.targetHeroIds.length == 1) {
        turn.targetHeroIds = [newActiveHero];
      }
      if (turn.targetHeroes && turn.targetHeroes.length == 1) {
        turn.targetHeroes = [newActiveHero];
      }
      turnQueue.enqueueTurn(turn as IAbstractTurn);
      ctr++;
    }
  }
}