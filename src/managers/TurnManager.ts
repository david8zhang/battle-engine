import { ITeamManager } from "../interface/ITeamManager";
import { IArenaManager } from "../interface/IArenaManager";
import { ITurnManager } from "../interface/ITurnManager";
import { LooseObject } from "../interface/LooseObject";
import { IAbstractTurn } from "../interface/IAbstractTurn";

/** Models */
import { EffectTurn } from '../models/EffectTurn';
import { ActionTurn } from '../models/ActionTurn';
import { SwitchTurn } from '../models/SwitchTurn';
import { MultiSwitchTurn } from '../models/MultiSwitchTurn';
import { MessageTurn } from '../models/MessageTurn';
import { ICPUManager } from "../interface/ICPUManager";
import { Hero } from "../models/Hero";

const TurnFactory : LooseObject = {
  ActionTurn,
  EffectTurn,
  SwitchTurn,
  MultiSwitchTurn,
  MessageTurn
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

  // Debugging only!
  public _getQueue() {
    return this.queue;
  }
}

export class TurnManager implements ITurnManager {
  private teamManager : ITeamManager;
  private arenaManager : IArenaManager;
  private cpuManager : ICPUManager;
  private turnQueue : TurnQueue;
  private multiMode : boolean;
  private intermediateSnapshots : boolean;

  constructor(teamManager : ITeamManager, arenaManager : IArenaManager, cpuManager : ICPUManager, multiMode : boolean = false, interSnap = false) {
    this.teamManager = teamManager;
    this.arenaManager = arenaManager;
    this.cpuManager = cpuManager;
    this.turnQueue = new TurnQueue(teamManager);
    this.multiMode = multiMode;
    this.intermediateSnapshots = interSnap;
  }

  /**
   * Process the turn queue and return a log of what happened
   * (to show to the UI)
   */
  public processTurnQueue() : LooseObject[] {
    // Different setup for different modes
    if (!this.multiMode) {
      this.addEffectsToQueue();
    } else {
      this.addMultiEffectsToQueue();
    }
    if (this.cpuManager) {
      this.addCPUTurn();
    }
    let actionLog : LooseObject[] = [];
    while (this.turnQueue.size() > 0) {
      const turnToProcess = this.turnQueue.dequeueTurn();
      const actions = turnToProcess.processTurn(this.teamManager, this.arenaManager, this.turnQueue);
      actionLog = actionLog.concat(actions);

      if (this.checkWinCondition(actionLog)) {
        break;
      }

      if (!this.multiMode) {
        if (this.teamManager.getActiveEnemyHero().getHealth() === 0) {
          this.addCPUTurn();
        }
        if (this.teamManager.getActivePlayerHero().getHealth() === 0) {
          break;
        }
      } else {
        // Add a CPU Turn
        if (this.teamManager.getActiveEnemyTeam().find((h : Hero) => h.getHealth() === 0)) {
          this.addCPUTurn()
        // If player hero dies, short circuit turn queue processing and allow the player to switch
        } else if (this.teamManager.getActivePlayerTeam().find((h : Hero) => h.getHealth() === 0)) {
          break;
        }
      }
    }
    return actionLog.filter((action) => action !== null);
  }

  /**
   * Checks if either side has all of their heroes dead
   */
  public checkWinCondition(actionLog : LooseObject[]) : boolean {
    const playerTeam = this.teamManager.getPlayerTeam();
    const enemyTeam = this.teamManager.getEnemyTeam();
    let enemyWin = true;
    Object.keys(playerTeam).forEach((key : string) => {
      const p : Hero = playerTeam[key];
      if (p.getHealth() > 0) {
        enemyWin = false;
      }
    })
    let playerWin = true;
    Object.keys(enemyTeam).forEach((key : string) => {
      const e : Hero = enemyTeam[key];
      if (e.getHealth() > 0) {
        playerWin = false;
      }
    })
    if (playerWin) {
      actionLog.push({
        type: 'Win',
        result: { side: 'player' }
      })
      return true;
    }
    if (enemyWin) {
      actionLog.push({
        type: 'Win',
        result: { side: 'enemy' }
      })
      return true;
    }
    return false;
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

  private addMultiEffectsToQueue() : void { 
    const arenaEffects : IAbstractTurn[] = this.arenaManager.getHazards().filter((effect : EffectTurn) => effect.duration > 0);
    if (arenaEffects.length > 0) {
      this.turnQueue.enqueueTurns(arenaEffects);
    }
    const activePlayerTeam = this.teamManager.getActivePlayerTeam();
    const activeEnemyTeam = this.teamManager.getActiveEnemyTeam();
    const combinedTeams : Hero[] = activePlayerTeam.concat(activeEnemyTeam);
    combinedTeams.forEach((hero : Hero) => {
      const effects = hero.getEffects().filter((effect : EffectTurn) => effect.duration > 0);
      if (effects.length > 0) this.turnQueue.enqueueTurns(effects);
    })
  }


  /**
   * addPlayerTurn - add a new turn inputted by the player
   * @param playerInput Object that contains turn properties
   */
  public addPlayerTurn(playerInput : LooseObject) {
    const actionType : string = playerInput.actionType;
    const action : IAbstractTurn = new TurnFactory[actionType]({ ...playerInput, interSnaps: this.intermediateSnapshots });
    this.turnQueue.enqueueTurn(action);
  }

  /**
   * addCPUTurn - add a new turn calculated by the CPU
   */
  public addCPUTurn() {
    if (this.cpuManager) {
      if (this.multiMode) {
        const cpuTurns : IAbstractTurn[] = this.cpuManager.getCPUTurns(this.arenaManager, this.teamManager);
        cpuTurns.forEach((turn : IAbstractTurn) => {
          if (turn) {
            this.turnQueue.enqueueTurn(turn);
          }
        })
      } else {
        const cpuTurn : IAbstractTurn = this.cpuManager.getCPUTurn(this.arenaManager, this.teamManager);
        if (cpuTurn) {
          this.turnQueue.enqueueTurn(cpuTurn);
        }
      }
    }
  }


/** <-------------------------- JUST FOR DEBUGGING! --------------------------> **/
  public _getTurnQueue() {
    return this.turnQueue;
  }

  public _setTurnQueue(turnQueue : TurnQueue) {
    this.turnQueue = turnQueue;
  }
}