import { LooseObject } from './LooseObject';
import { Hero } from '../models/Hero';

export interface ITeamManager {
  getPlayerTeam() : LooseObject
  getEnemyTeam() : LooseObject

  // get & set active single heroes
  getActivePlayerHero()  : Hero;
  getActiveEnemyHero() : Hero;
  setActivePlayerHero(newActiveHeroId : string) : void;
  setActiveEnemyHero(newActiveEnemyId : string) : void;

  // get & set active hero teams
  getActivePlayerTeam() : Hero[];
  getActiveEnemyTeam() : Hero[];
  setActivePlayerTeam(heroIds : string[]) : void;
  setActiveEnemyTeam(heroIds : string[]) : void;

  getHero(id : string) : Hero;
  getHeroes(ids : string[]) : Hero[];
}