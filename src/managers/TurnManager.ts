import { ITeamManager } from "../interface/ITeamManager";
import { IArenaManager } from "../interface/IArenaManager";
import { ITurnManager } from "../interface/ITurnManager";
import { LooseObject } from "../interface/LooseObject";
import { IAbstractTurn } from "../interface/IAbstractTurn";

/** Models */
import { EffectTurn } from '../models/EffectTurn';
import { ActionTurn } from '../models/ActionTurn';
import { SwitchTurn } from '../models/SwitchTurn';
import { ICPUManager } from "../interface/ICPUManager";

const TurnFactory : LooseObject = {
  ActionTurn,
  EffectTurn,
  SwitchTurn
}

export class TurnQueue {
  private queue : IAbstractTurn[];
  private teamManager : ITeamManager;
  constructor(teamManager : ITeamManager) {
    this.teamManager = teamManager;
    this.queue = [];
  }

  private showError(msg: string, turn : LooseObject) {
    console.error(msg, turn);
  }

  private calculateSpeedPriority(a : LooseObject, b : LooseObject) : number {
    const heroA = this.teamManager.getHero(a.sourceHeroId);
    const heroB = this.teamManager.getHero(b.sourceHeroId);
    if (!heroA) {
      this.showError('Error, turn has invalid source hero id!', a);
    } else if (!heroB) {
      this.showError('Error, turn has invalid source hero id', b);
    }
    return heroB.getSpeed() - heroA.getSpeed();
  }

  public enqueueTurn(turn : IAbstractTurn) {
    const newQueue = this.queue.concat(turn).sort((a : LooseObject, b : LooseObject) => {
      if (a.priority === b.priority && (a.sourceHeroId && b.sourceHeroId)) {
        return this.calculateSpeedPriority(a, b);
      } else {
        return a.priority - b.priority;
      }
    });
    this.queue = newQueue;
  }

  public enqueueTurns(turnArray : IAbstractTurn[]) {
    const newQueue = this.queue.concat(turnArray).sort((a : LooseObject, b : LooseObject) => {
      if (a.priority === b.priority && (a.sourceHeroId && b.sourceHeroId)) {
        return this.calculateSpeedPriority(a, b);
      } else {
        return a.priority - b.priority;
      }
    });
    this.queue = newQueue;
  }
  public dequeueTurn() : IAbstractTurn {
    if (this.queue.length > 0) {
      return this.queue.shift();
    }
    return null;
  }
  public size() {
    return this.queue.length;
  }
}

export class TurnManager implements ITurnManager {
  private teamManager : ITeamManager;
  private arenaManager : IArenaManager;
  private cpuManager : ICPUManager;
  private turnQueue : TurnQueue;

  constructor(teamManager : ITeamManager, arenaManager : IArenaManager, cpuManager : ICPUManager) {
    this.teamManager = teamManager;
    this.arenaManager = arenaManager;
    this.cpuManager = cpuManager;
    this.turnQueue = new TurnQueue(teamManager);
  }

  /**
   * Process the turn queue and return a log of what happened
   * (to show to the UI)
   */
  public processTurnQueue() : LooseObject[] {
    this.addEffectsToQueue();
    if (this.cpuManager) {
      this.addCPUTurn();
    }

    let actionLog : LooseObject[] = [];
    while (this.turnQueue.size() > 0) {
      const turnToProcess = this.turnQueue.dequeueTurn();
      const actions = turnToProcess.processTurn(this.teamManager, this.arenaManager, this.turnQueue);
      actionLog = actionLog.concat(actions);
      if (this.teamManager.getActivePlayerHero().getHealth() === 0) {
        break;
      }
    }
    return actionLog.filter((action) => action !== null);
  }

  /**
   * Generate a snapshot of what occurred during the previous turn
   */
  public getStateSnapshot() : LooseObject {
    const playerHero = this.teamManager.getActivePlayerHero();
    const enemyHero = this.teamManager.getActiveEnemyHero();
    const playerTeam = this.teamManager.getPlayerTeam();
    const enemyTeam = this.teamManager.getEnemyTeam();
    const hazards = this.arenaManager.getHazards();
    return { playerHero, enemyHero, playerTeam, enemyTeam, hazards };
  }

  /**
   * Add effects to the queue as turns (like environmental hazards, etc.)
   */
  private addEffectsToQueue() : void {
    const arenaEffects : IAbstractTurn[] = this.arenaManager
                                              .getHazards()
                                              .filter((effect : EffectTurn) => effect.duration > 0);

    const activePlayerHeroEffects = this.teamManager
                                        .getActivePlayerHero()
                                        .getEffects()
                                        .filter((effect : EffectTurn) => effect.duration > 0);
    const activeEnemyHeroEffects = this.teamManager
                                        .getActiveEnemyHero()
                                        .getEffects()
                                        .filter((effect : EffectTurn) => effect.duration > 0);

    if (arenaEffects.length > 0) this.turnQueue.enqueueTurns(arenaEffects);
    if (activeEnemyHeroEffects.length > 0) this.turnQueue.enqueueTurns(activeEnemyHeroEffects);
    if (activePlayerHeroEffects.length > 0) this.turnQueue.enqueueTurns(activePlayerHeroEffects);
  }


  /**
   * addPlayerTurn - add a new turn inputted by the player
   * @param playerInput Object that contains turn properties
   */
  public addPlayerTurn(playerInput : LooseObject) {
    const actionType : string = playerInput.actionType;
    const action : IAbstractTurn = new TurnFactory[actionType](playerInput);
    this.turnQueue.enqueueTurn(action);
  }

  /**
   * addCPUTurn - add a new turn calculated by the CPU
   */
  public addCPUTurn() {
    const cpuTurn : IAbstractTurn = this.cpuManager.getCPUTurn(this.arenaManager, this.teamManager);
    this.turnQueue.enqueueTurn(cpuTurn);
  }


/** <-------------------------- JUST FOR DEBUGGING! --------------------------> **/
  public _getTurnQueue() {
    return this.turnQueue;
  }

  public _setTurnQueue(turnQueue : TurnQueue) {
    this.turnQueue = turnQueue;
  }
}