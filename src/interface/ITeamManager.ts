import { LooseObject } from './LooseObject';
import { Hero } from '../models/Hero';

export interface ITeamManager {
  getPlayerTeam() : LooseObject
  getEnemyTeam() : LooseObject

  // Get active single heroes
  getActivePlayerHero()  : Hero;
  getActiveEnemyHero() : Hero;

  // get active hero teams
  getActivePlayerTeam() : Hero[];
  getActiveEnemyTeam() : Hero[];

  setActivePlayerHero(newActiveHeroId : string) : void;
  setActiveEnemyHero(newActiveEnemyId : string) : void;

  getHero(id : string) : Hero;
}