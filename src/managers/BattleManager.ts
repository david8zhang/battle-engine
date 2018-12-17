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

export class BattleManager implements IBattleManager {
  private teamManager : ITeamManager;
  private arenaManager : IArenaManager;
  private turnManager : ITurnManager;

  constructor(battleConfig : LooseObject) {
    this.teamManager = new TeamManager(battleConfig);
    this.arenaManager = new ArenaManager(battleConfig);
    this.turnManager = new TurnManager(this.teamManager, this.arenaManager);
  }

  public doPlayerTurn(playerInput : LooseObject) {
    this.turnManager.addPlayerTurn(playerInput);
  }
}