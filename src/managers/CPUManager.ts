import { ICPUManager } from "../interface/ICPUManager";
import { LooseObject } from "../interface/LooseObject";
import { IAbstractTurn } from "../interface/IAbstractTurn";
import { IArenaManager } from "../interface/IArenaManager";
import { ITeamManager } from "../interface/ITeamManager";
import { Move } from "../models/Move";
import { ActionTurn } from "../models/ActionTurn";

export class CPUManager implements ICPUManager {
  private moveCalculator : Function;
  constructor(battleConfig : LooseObject) {
    if (battleConfig.moveCalculator) this.moveCalculator = battleConfig.moveCalculator;
  }

  getCPUTurn(arenaManager : IArenaManager, teamManager : ITeamManager) : IAbstractTurn {
    const hazards = arenaManager.getHazards();
    const playerHero = teamManager.getActivePlayerHero();
    const enemyHero = teamManager.getActiveEnemyHero();
    const playerTeam = teamManager.getPlayerTeam();
    const enemyTeam = teamManager.getEnemyTeam();

    if (this.moveCalculator) {
      const params = { hazards, playerHero, enemyHero, playerTeam, enemyTeam };
      return new ActionTurn(this.moveCalculator(params));
    } else {
      const moveSet : Move[] = enemyHero.getMoveSet();

      if (moveSet.length === 0) {
        console.error(`Enemy ${enemyHero.getName()} has no moves!`)
        return null;
      }

      // CPU is stupid, just does the first move available to it
      const chosenMove : Move = moveSet[0];
      const deserializedMove = {
        name: chosenMove.getName(),
        power: chosenMove.getPower()
      }
      return new ActionTurn({
        move: deserializedMove,
        sourceHeroId: enemyHero.getHeroId(),
        targetHeroIds: [playerHero.getHeroId()],
        priority: chosenMove.getPriority()
      })
    }
  }
}