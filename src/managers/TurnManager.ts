import { ITeamManager } from "../interface/ITeamManager";
import { IArenaManager } from "../interface/IArenaManager";
import { ITurnManager } from "../interface/ITurnManager";
import { LooseObject } from "../interface/LooseObject";
import { IAbstractTurn } from "../interface/IAbstractTurn";

/** Models */
import { EffectTurn } from '../models/EffectTurn';
import { ActionTurn } from '../models/ActionTurn';

const TurnFactory : LooseObject = {
  ActionTurn,
  EffectTurn
}

export class TurnQueue {
  private queue : IAbstractTurn[];
  constructor() {
    this.queue = [];
  }
  public enqueueTurn(turn : IAbstractTurn) {
    const newQueue = this.queue.concat(turn).sort((a, b) => a.priority - b.priority);
    this.queue = newQueue;
  }
  public enqueueTurns(turnArray : IAbstractTurn[]) {
    const newQueue = this.queue.concat(turnArray).sort((a, b) => a.priority - b.priority);
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
  private teamManager : ITeamManager
  private arenaManager : IArenaManager
  private turnQueue : TurnQueue;

  constructor(teamManager : ITeamManager, arenaManager : IArenaManager) {
    this.teamManager = teamManager;
    this.arenaManager = arenaManager;
    this.turnQueue = new TurnQueue();
  }

  public processTurnQueue() : string[] {
    const arenaEffects : IAbstractTurn[] = this.arenaManager.getHazards();
    const activePlayerHeroEffects = this.teamManager.getActivePlayerHero().getEffects();
    const activeEnemyHeroEffects = this.teamManager.getActiveEnemyHero().getEffects();
    if (arenaEffects.length > 0) this.turnQueue.enqueueTurns(arenaEffects);
    if (activeEnemyHeroEffects.length > 0) this.turnQueue.enqueueTurns(activeEnemyHeroEffects);
    if (activePlayerHeroEffects.length > 0) this.turnQueue.enqueueTurns(activePlayerHeroEffects);
    let actionLog : string[] = [];
    while (this.turnQueue.size() > 0) {
      const turnToProcess = this.turnQueue.dequeueTurn();
      const actions = turnToProcess.processTurn(this.teamManager, this.arenaManager, this.turnQueue);
      actionLog = actionLog.concat(actions);
    }
    return actionLog.filter((action) => action !== null);
  }

  public addPlayerTurn(playerInput : LooseObject) {
    const actionType : string = playerInput.actionType;
    const action : IAbstractTurn = new TurnFactory[actionType](playerInput);
    this.turnQueue.enqueueTurn(action);
  }


/** <-------------------------- JUST FOR DEBUGGING! --------------------------> **/
  public _getTurnQueue() {
    return this.turnQueue;
  }

  public _setTurnQueue(turnQueue : TurnQueue) {
    this.turnQueue = turnQueue;
  }
}