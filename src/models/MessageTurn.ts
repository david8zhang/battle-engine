import { IAbstractTurn } from "../interface/IAbstractTurn";
import { LooseObject } from "../interface/LooseObject";
import { ITeamManager } from "../interface/ITeamManager";
import { IArenaManager } from "../interface/IArenaManager";
import { TurnQueue } from "../managers/TurnManager";

export class MessageTurn implements IAbstractTurn {
  public priority : number;
  private message : string;

  constructor(config : LooseObject) {
    this.priority = config.priority
    this.message = config.message;
  }

  processTurn(teamManager : ITeamManager, arenaManager : IArenaManager, turnQueue : TurnQueue) : LooseObject[] {
    return [{
      priority: this.priority,
      type: 'Message',
      message: this.message
    }]
  }
}