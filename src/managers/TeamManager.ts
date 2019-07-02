/** Interfaces */
import { LooseObject } from '../interface/LooseObject';
import { ITeamManager } from '../interface/ITeamManager';

/** Models */
import { Hero } from '../models/Hero';

/** utils */
const uuidV4 = require('uuid/v4');

const randomGenerator = function (side : string) : LooseObject {
  const heroes : LooseObject = {};
  for (let i = 0; i < 6; i++) {
    const heroId = uuidV4();
    const newHero = new Hero({
      attack: Math.floor(Math.random() * 50) + 1,
      defense: Math.floor(Math.random() * 50) + 1,
      speed: Math.floor(Math.random() * 50) + 1,
      health: Math.floor(Math.random() * 1000) + 500,
      level: Math.floor(Math.random() * 100) + 1,
      name: `${side} Robo Hero ${i}`,
      heroId,
      moveSet: [{
        power: 10,
        name: 'Tackle'
      }, {
        power: 20,
        name: 'Flail'
      }, {
        power: 50,
        name: 'Hyper Beam'
      }]
    });
    heroes[heroId] = newHero;
  }
  return heroes;
}

export class TeamManager implements ITeamManager {
  private activePlayerHero : string;
  private activeEnemyHero : string;
  private playerTeam : LooseObject;
  private enemyTeam : LooseObject;

  private activePlayerTeam : string[];
  private activeEnemyTeam : string[];

  constructor(battleConfig : LooseObject) {

    if (battleConfig.playerTeam) this.playerTeam = this.convertToHeroes(battleConfig.playerTeam);
    if (battleConfig.enemyTeam) this.enemyTeam = this.convertToHeroes(battleConfig.enemyTeam);
   
    if (!this.playerTeam) this.playerTeam = randomGenerator('Player');
    if (!this.enemyTeam) this.enemyTeam = randomGenerator('Enemy');


    if (battleConfig.multiMode) {
      this.activePlayerTeam = battleConfig.activePlayerTeam || Object.keys(this.playerTeam).slice(0, 3);
      this.activeEnemyTeam = battleConfig.activeEnemyTeam || Object.keys(this.enemyTeam).slice(0, 3);
    } else {
      this.activePlayerHero = battleConfig.activePlayerHero || Object.keys(this.playerTeam)[0];
      this.activeEnemyHero = battleConfig.activeEnemyHero || Object.keys(this.enemyTeam)[0];
    }
  }

  public getEnemyTeam() : LooseObject {
    return this.enemyTeam
  }

  public getPlayerTeam() : LooseObject {
    return this.playerTeam;
  }

  // Single hero logic
  public getActivePlayerHero() : Hero { return this.playerTeam[this.activePlayerHero]; }
  public getActiveEnemyHero() : Hero { return this.enemyTeam[this.activeEnemyHero]; }
  public setActivePlayerHero(newActiveHeroId : string) : void { this.activePlayerHero = newActiveHeroId; }
  public setActiveEnemyHero(newActiveHeroId : string) : void { this.activeEnemyHero = newActiveHeroId; }

  // Multi mode logic
  public getActivePlayerTeam() : Hero[] { return this.activePlayerTeam.map((heroId : string) => this.playerTeam[heroId]) }
  public getActiveEnemyTeam() : Hero[] { return this.activeEnemyTeam.map((heroId : string) => this.enemyTeam[heroId] )}
  public setActivePlayerTeam(heroIds : string[]) : void { this.activePlayerTeam = heroIds; }
  public setActiveEnemyTeam(heroIds : string[]) : void { this.activeEnemyTeam = heroIds; }

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