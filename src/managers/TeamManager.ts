/** Interfaces */
import { LooseObject } from '../interface/LooseObject';
import { ITeamManager } from '../interface/ITeamManager';

/** Models */
import { Hero } from '../models/Hero';

/** utils */
const uuidV4 = require('uuid/v4');

const randomGenerator = function () : LooseObject {
  const heroes : LooseObject = {};
  for (let i = 0; i < 6; i++) {
    const heroId = uuidV4();
    const newHero = new Hero({
      attack: Math.floor(Math.random() * 10),
      defense: Math.floor(Math.random() * 10),
      health: Math.floor(Math.random() * 100) + 50,
      name: `Robo Hero ${i}`,
      heroId
    });
    heroes[heroId] = newHero;
  }
  return heroes;
}

export class TeamManager implements ITeamManager {
  private playerGenerator : Function;
  private enemyGenerator : Function;
  private activePlayerHero : string;
  private activeEnemyHero : string;
  private playerTeam : LooseObject;
  private enemyTeam : LooseObject;

  constructor(battleConfig : LooseObject) {
    if (battleConfig.playerTeam) this.playerTeam = this.convertToHeroes(battleConfig.playerTeam);
    if (battleConfig.enemyTeam) this.enemyTeam = this.convertToHeroes(battleConfig.enemyTeam);
   
    if (!this.playerTeam) this.playerTeam = randomGenerator();
    if (!this.enemyTeam) this.enemyTeam = randomGenerator();

    this.activePlayerHero = battleConfig.activePlayerHero || Object.keys(this.playerTeam)[0];
    this.activeEnemyHero = battleConfig.activeEnemyHero || Object.keys(this.enemyTeam)[0];
  }

  public getEnemyTeam() : LooseObject {
    return this.enemyTeam
  }

  public getPlayerTeam() : LooseObject {
    return this.playerTeam;
  }

  public getActivePlayerHero() : Hero {
    return this.playerTeam[this.activePlayerHero];
  }

  public getActiveEnemyHero() : Hero {
    return this.enemyTeam[this.activeEnemyHero];
  }

  public getHero(id : string) : Hero {
    if (this.enemyTeam[id]) {
      return this.enemyTeam[id];
    } else if (this.playerTeam[id]) {
      return this.playerTeam[id];
    }
    return null;
  }

  private convertToHeroes(team : LooseObject) : LooseObject {
    if (!team) {
      return {};
    }
    const result : LooseObject = {};
    Object.keys(team).forEach((k : string) => {
      result[k] = new Hero(team[k]);
    })
    return result;
  }
}