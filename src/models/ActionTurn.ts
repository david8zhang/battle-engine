import { Move } from "./Move";

/** Interfaces */
import { IArenaManager } from "../interface/IArenaManager";
import { ITeamManager } from "../interface/ITeamManager";
import { IAbstractTurn } from "../interface/IAbstractTurn";
import { LooseObject } from "../interface/LooseObject";
import { TurnQueue } from "../managers/TurnManager";
import { Hero } from "./Hero";

export class ActionTurn implements IAbstractTurn {
  private move : Move = null;
  private targetHeroIds : string[] = [];
  private sourceHeroId : string = '';
  public priority : number = 0;

  constructor(config : LooseObject) {
    if (config.move) this.move = new Move(config.move);
    if (config.targetHeroIds) this.targetHeroIds = config.targetHeroIds;
    if (config.sourceHeroId) this.sourceHeroId = config.sourceHeroId;
    if (config.priority) this.priority = config.priority;
  }

  // Debugging only
  public _getMove() : Move {
    return this.move;
  }

  // Debugging only
  public _getTargetHeroIds() : string[] {
    return this.targetHeroIds;
  }

  // Debugging only
  public _getSourceHeroId() : string {
    return this.sourceHeroId;
  }

  public processTurn(teamManager : ITeamManager, arenaManager : IArenaManager, turnQueue : TurnQueue) : LooseObject[] {
    const playerTeam = teamManager.getPlayerTeam();
    const enemyTeam = teamManager.getEnemyTeam();
    const actionLogs : LooseObject[] = [];
    let sourceHero : Hero;

    if (playerTeam[this.sourceHeroId] !== undefined) sourceHero = playerTeam[this.sourceHeroId]
    else if (enemyTeam[this.sourceHeroId] !== undefined) sourceHero = enemyTeam[this.sourceHeroId];

    // If the source hero is dead or nonexistent, they can't attack, so just skip this action
    if (!sourceHero || sourceHero.getHealth() === 0) {
      return [];
    }

    // Deal damage to or heal all targets
    this.targetHeroIds.forEach((id) => {
      let targetHero : Hero
      if (playerTeam[id]) targetHero = playerTeam[id];
      if (enemyTeam[id]) targetHero = enemyTeam[id];
      if (targetHero.getHealth() > 0) {
        let message = '';
        let result : any = {}
        if (this.move.getIsHeal() === true) {
          const healAmt = this.move.calculateHealing(sourceHero, targetHero)
          targetHero.setHealth(targetHero.getHealth() + healAmt)
          message = `${sourceHero.getName()} used ${this.move.getName()} and healed ${healAmt} to ${targetHero.getName()}`
          result.healAmt = healAmt
        } else {
          const damage = this.move.calculateDamage(sourceHero, targetHero);
          targetHero.setHealth(targetHero.getHealth() - damage);
          message = `${sourceHero.getName()} used ${this.move.getName()} and dealt ${damage} to ${targetHero.getName()}`
          result.damage = damage
        }
        result = {
          ...result,
          sourceHeroId: this.sourceHeroId,
          targetHeroId: targetHero.getHeroId(),
          move: this.move.getName()
        }
        actionLogs.push({
          type: 'Action',
          message,
          result
        });
        if (targetHero.getHealth() === 0) {
          actionLogs.push({
            type: 'Death',
            message: `${targetHero.getName()} died!`,
            result: {
              targetHeroId: targetHero.getHeroId()
            }
          });
        }
      }
    })
    return actionLogs;
  }
}