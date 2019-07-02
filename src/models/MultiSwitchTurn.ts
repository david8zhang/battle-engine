import { IAbstractTurn } from "../interface/IAbstractTurn";
import { LooseObject } from "../interface/LooseObject";
import { ITeamManager } from "../interface/ITeamManager";
import { IArenaManager } from "../interface/IArenaManager";
import { TurnQueue } from "../managers/TurnManager";

export class MultiSwitchTurn implements IAbstractTurn {
  public priority = -1;
  private newActiveTeam : string[];
  private side : string;

  constructor(config : LooseObject) {
    this.newActiveTeam = config.newActiveTeam;
    this.side = config.side;
  }
  
  public _getNewActiveTeam() : string[] {
    return this.newActiveTeam;
  }

  public _getSide() : string { 
    return this.side;
  }

  public processTurn (teamManager : ITeamManager, arenaManager : IArenaManager, turnQueue : TurnQueue) : LooseObject[] {
    return [];
  }
}