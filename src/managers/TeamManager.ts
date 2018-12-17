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
    this.playerGenerator = randomGenerator;
    this.enemyGenerator = randomGenerator;

    if (battleConfig.playerGenerator) this.playerGenerator = battleConfig.playerGenerator;
    if (battleConfig.enemyGenerator) this.enemyGenerator = battleConfig.enemyGenerator;
   
    this.playerTeam = this.playerGenerator();
    this.enemyTeam = this.enemyGenerator();

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
}