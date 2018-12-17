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

  public processTurn(teamManager : ITeamManager, arenaManager : IArenaManager, turnQueue : TurnQueue) : string[] {
    const playerTeam = teamManager.getPlayerTeam();
    const enemyTeam = teamManager.getEnemyTeam();
    const actionLogs : string[] = [];
    let sourceHero : Hero;

    if (playerTeam[this.sourceHeroId] !== undefined) sourceHero = playerTeam[this.sourceHeroId]
    else if (enemyTeam[this.sourceHeroId] !== undefined) sourceHero = enemyTeam[this.sourceHeroId];

    // If the source hero is dead or nonexistent, they can't attack, so just skip this action
    if (!sourceHero || sourceHero.getHealth() === 0) {
      return [];
    }

    // Deal damage to all targets
    this.targetHeroIds.forEach((id) => {
      let targetHero : Hero
      if (playerTeam[id]) targetHero = playerTeam[id];
      if (enemyTeam[id]) targetHero = enemyTeam[id];
      const damage = this.move.calculateDamage(sourceHero, targetHero);
      targetHero.setHealth(targetHero.getHealth() - damage);
      actionLogs.push(`${sourceHero.getName()} used ${this.move.getName()} and dealt ${damage} to ${targetHero.getName()}`);
    })
    return actionLogs;
  }
}