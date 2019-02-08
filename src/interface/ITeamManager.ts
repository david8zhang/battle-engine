import { LooseObject } from './LooseObject';
import { Hero } from '../models/Hero';

export interface ITeamManager {
  getPlayerTeam() : LooseObject
  getEnemyTeam() : LooseObject
  getActivePlayerHero()  : Hero;
  getActiveEnemyHero() : Hero;
  setActivePlayerHero(newActiveHeroId : string) : void;
  setActiveEnemyHero(newActiveEnemyId : string) : void;
  getHero(id : string) : Hero;
}