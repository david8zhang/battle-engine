/** Interfaces */
import { IBattleManager } from "../interface/IBattleManager";
import { ITeamManager } from '../interface/ITeamManager';
import { IArenaManager } from "../interface/IArenaManager";
import { LooseObject } from '../interface/LooseObject';
import { ITurnManager } from "../interface/ITurnManager";

/** Manaagers */
import { TeamManager } from "./TeamManager";
import { ArenaManager } from './ArenaManager';
import { TurnManager } from "./TurnManager";
import { CPUManager } from "./CPUManager";
import { ICPUManager } from "../interface/ICPUManager";

export class BattleManager implements IBattleManager {
  private teamManager : ITeamManager;
  private arenaManager : IArenaManager;
  private turnManager : ITurnManager;
  private cpuManager : ICPUManager;

  constructor(battleConfig : LooseObject) {
    this.teamManager = new TeamManager(battleConfig);
    this.arenaManager = new ArenaManager(battleConfig);
    this.cpuManager = new CPUManager(battleConfig);
    this.turnManager = new TurnManager(this.teamManager, this.arenaManager, this.cpuManager);
  }

  public doPlayerTurn(playerInput : LooseObject) {
    this.turnManager.addPlayerTurn(playerInput);
  }
}