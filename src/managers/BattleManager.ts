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
import { Hero } from "../models/Hero";
import { Move } from "../models/Move";

export class BattleManager implements IBattleManager {
  private teamManager : ITeamManager;
  private arenaManager : IArenaManager;
  private turnManager : ITurnManager;
  private cpuManager : ICPUManager;
  private multiMode : boolean;

  constructor(battleConfig : LooseObject) {
    this.teamManager = new TeamManager(battleConfig);
    this.arenaManager = new ArenaManager(battleConfig);
    this.cpuManager = new CPUManager(battleConfig);
    this.multiMode = battleConfig.multiMode ? battleConfig.multiMode : false;
    this.turnManager = new TurnManager(this.teamManager, this.arenaManager, this.cpuManager, this.multiMode);
  }

  public doPlayerTurn(playerInput : LooseObject) : LooseObject[] {
    this.turnManager.addPlayerTurn(playerInput);
    const actionLog : LooseObject[] = this.turnManager.processTurnQueue();
    return actionLog;
  }

  public doPlayerTurnMulti(playerInputs : LooseObject[]) : LooseObject[] {
    if (!this.multiMode) {
      console.error('You must turn on multi mode in order to support multiple player actions!');
      return null;
    } else {
      playerInputs.forEach((turn : LooseObject) => { this.turnManager.addPlayerTurn(turn) })
      return this.turnManager.processTurnQueue();
    }
  }

  public getEnemyTeam() {
    return this.deserializeTeam(this.teamManager.getEnemyTeam());
  }

  public getPlayerTeam() {
    return this.deserializeTeam(this.teamManager.getPlayerTeam());
  }

  public getActivePlayerTeam() {
    return this.deserializeTeam(this.teamManager.getActivePlayerTeam());
  }

  public getActiveEnemyTeam() {
    return this.deserializeTeam(this.teamManager.getActiveEnemyTeam());
  };

  public getActivePlayerHero() {
    return this.deserializeHero(this.teamManager.getActivePlayerHero());
  }

  public getActiveEnemyHero() {
    return this.deserializeHero(this.teamManager.getActiveEnemyHero());
  }

  /** Private methods */
  private deserializeMoves(moves : Move[]) {
    return moves.map((m : Move) => {
      return {
        name: m.getName(),
        power: m.getPower(),
        priority: m.getPriority(),
        healAmt: m.getHealAmt(),
        isHeal: m.getIsHeal()
      }
    })
  }

  private deserializeTeam(team : LooseObject) {
    const deserializedResult : any[] = [];
    Object.keys(team).forEach((id : string) => {
      const e : Hero = team[id];
      deserializedResult.push(this.deserializeHero(e));
    })
    return deserializedResult;
  }

  private deserializeHero(hero : Hero) {
    return {
      name: hero.getName(),
      health: hero.getHealth(),
      attack: hero.getAttack(),
      defense: hero.getDefense(),
      speed: hero.getSpeed(),
      level: hero.getLevel(),
      maxHealth: hero.getMaxHealth(),
      heroId: hero.getHeroId(),
      effects: hero.getEffects(),
      moveSet: this.deserializeMoves(hero.getMoveSet()),
      ...hero.getAdditionalStats()
    }
  }
} 