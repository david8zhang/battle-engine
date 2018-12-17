import { ITeamManager } from "./ITeamManager";
import { IArenaManager } from "./IArenaManager";
import { TurnQueue } from "../managers/TurnManager";

export interface IAbstractTurn {
  priority : number;
  processTurn (teamManager : ITeamManager, arenaManager : IArenaManager, turnQueue : TurnQueue) : string[]
}