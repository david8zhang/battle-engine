import { ICPUManager } from "../interface/ICPUManager";
import { LooseObject } from "../interface/LooseObject";
import { IAbstractTurn } from "../interface/IAbstractTurn";
import { IArenaManager } from "../interface/IArenaManager";
import { ITeamManager } from "../interface/ITeamManager";
import { Move } from "../models/Move";
import { ActionTurn } from "../models/ActionTurn";
import { Hero } from "../models/Hero";
import { SwitchTurn } from "../models/SwitchTurn";

export class CPUManager implements ICPUManager {
  private moveCalculator : Function;
  private switchCalculator : Function;
  constructor(battleConfig : LooseObject) {
    if (battleConfig.moveCalculator) this.moveCalculator = battleConfig.moveCalculator;
    if (battleConfig.switchCalculator) this.switchCalculator = battleConfig.switchCalculator;
  }

  private defaultMoveCalculator(enemyHero : Hero, playerHero : Hero) : IAbstractTurn {
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

  private defaultSwitchCalculator(enemyTeam : LooseObject, playerTeam : LooseObject) : IAbstractTurn {
    let idToSwitchTo;
    Object.keys(enemyTeam).forEach((id) => {
      if (enemyTeam[id].getHealth() > 0) {
        idToSwitchTo = id;
      }
    })
    return new SwitchTurn({
      newActiveHero: idToSwitchTo,
      side: 'enemy'
    })
  }

  private allDead(enemyTeam : LooseObject) : boolean {
    let allDead = true;
    Object.keys(enemyTeam).forEach((heroId : string) => {
      const enemy : LooseObject = enemyTeam[heroId];
      if (enemy.getHealth() > 0) {
        allDead = false;
      }
    })
    return allDead;
  }

  public getCPUTurn(arenaManager : IArenaManager, teamManager : ITeamManager) : IAbstractTurn {
    const hazards = arenaManager.getHazards();
    const playerHero = teamManager.getActivePlayerHero();
    const enemyHero = teamManager.getActiveEnemyHero();
    const playerTeam = teamManager.getPlayerTeam();
    const enemyTeam = teamManager.getEnemyTeam();
    const params = { hazards, playerHero, enemyHero, playerTeam, enemyTeam };

    if (this.allDead(enemyTeam)) {
      return null;
    }
    if (enemyHero.getHealth() === 0) {
      if (this.switchCalculator) {
        return new SwitchTurn(this.switchCalculator(params));
      } else {
        return this.defaultSwitchCalculator(enemyTeam, playerTeam);
      }
    } else {
      if (this.moveCalculator) {
        return new ActionTurn(this.moveCalculator(params));
      } else {
        return this.defaultMoveCalculator(enemyHero, playerHero);
      }
    }
  }
}