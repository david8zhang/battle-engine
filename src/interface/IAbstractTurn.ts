import { ITeamManager } from "./ITeamManager";
import { IArenaManager } from "./IArenaManager";
import { TurnQueue } from "../managers/TurnManager";
import { LooseObject } from "./LooseObject";

export interface IAbstractTurn {
  priority : number;
  name?: string;
  processTurn (teamManager : ITeamManager, arenaManager : IArenaManager, turnQueue : TurnQueue, customDmgCalc? : Function) : LooseObject[]
}