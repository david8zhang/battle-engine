import { IArenaManager } from "./IArenaManager";
import { ITeamManager } from "./ITeamManager";
import { IAbstractTurn } from "./IAbstractTurn";

export interface ICPUManager {
  getCPUTurn(arenaManager : IArenaManager, teamManager : ITeamManager) : IAbstractTurn
}