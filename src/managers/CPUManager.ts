import { ICPUManager } from "../interface/ICPUManager";
import { LooseObject } from "../interface/LooseObject";
import { IAbstractTurn } from "../interface/IAbstractTurn";
import { IArenaManager } from "../interface/IArenaManager";
import { ITeamManager } from "../interface/ITeamManager";
import { Move } from "../models/Move";
import { ActionTurn } from "../models/ActionTurn";
import { Hero } from "../models/Hero";
import { SwitchTurn } from "../models/SwitchTurn";
import { MultiSwitchTurn } from "../models/MultiSwitchTurn";

export class CPUManager implements ICPUManager {
  private moveCalculator : Function;
  private switchCalculator : Function;
  private multiSwitchCalculator : Function;
  private multiMoveCalculator : Function;

  constructor(battleConfig : LooseObject) {
    if (battleConfig.moveCalculator) this.moveCalculator = battleConfig.moveCalculator;
    if (battleConfig.switchCalculator) this.switchCalculator = battleConfig.switchCalculator;
    if (battleConfig.multiMode) {
      this.multiSwitchCalculator = battleConfig.multiSwitchCalculator;
      this.multiMoveCalculator = battleConfig.multiMoveCalculator;
    }
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

  private defaultMultiMoveCalculator(activeEnemyTeam : Hero[], activePlayerTeam : Hero[]) : IAbstractTurn[] {
    const res : IAbstractTurn[] = [];
    activeEnemyTeam.forEach((enemy : Hero) => {
      const moveSet : Move[] = enemy.getMoveSet();
      if (moveSet.length === 0) {
        console.error(`Enemy ${enemy.getName()} has no moves!`)
      } else {
        const chosenMove : Move = moveSet[0];
        const deserializedMove = {
          name: chosenMove.getName(),
          power: chosenMove.getPower()
        }

        // Choose an active player hero at random and attack it
        const randomPlayerIndex = Math.floor(Math.random() * activePlayerTeam.length);
        res.push(new ActionTurn({
          move: deserializedMove,
          sourceHeroId: enemy.getHeroId(),
          targetHeroIds: [activePlayerTeam[randomPlayerIndex].getHeroId()],
          priority: chosenMove.getPriority()
        }));
      }
    })
    return res;
  }

  private defaultMultiSwitchCalculator(enemyTeam : LooseObject, playerTeam : LooseObject, activeEnemyTeam: Hero[]) : IAbstractTurn[] {
    const newActiveEnemyTeam : string[] = [];
    let ctr = 0;
    Object.keys(enemyTeam).forEach((id) => {
      if (enemyTeam[id].getHealth() > 0 && ctr < activeEnemyTeam.length) {
        newActiveEnemyTeam.push(id);
        ctr++;
      }
    })
    return [new MultiSwitchTurn({ newActiveTeam: newActiveEnemyTeam, side: 'enemy' })];
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

  public getCPUTurns(arenaManager : IArenaManager, teamManager : ITeamManager) : IAbstractTurn[] {
    const hazards = arenaManager.getHazards();
    const enemyTeam = teamManager.getEnemyTeam();
    const playerTeam = teamManager.getPlayerTeam();
    const activeEnemyTeam = teamManager.getActiveEnemyTeam();
    const activePlayerTeam = teamManager.getActivePlayerTeam();
    const params = { hazards, enemyTeam, playerTeam, activeEnemyTeam, activePlayerTeam };

    if (this.allDead(enemyTeam)) {
      return null;
    }
    if (activeEnemyTeam.find((h : Hero) => h.getHealth() <= 0)) {
      if (this.multiSwitchCalculator) {
        return [new MultiSwitchTurn(this.multiSwitchCalculator(params))];
      } else {
        return this.defaultMultiSwitchCalculator(enemyTeam, playerTeam, activeEnemyTeam);
      }
    } else {
      if (this.multiMoveCalculator) {
        const moves : LooseObject[] = this.multiMoveCalculator(params);
        return moves.map((config : LooseObject) => new ActionTurn(config));
      } else {
        return this.defaultMultiMoveCalculator(activeEnemyTeam, activePlayerTeam);
      }
    }
  }
}