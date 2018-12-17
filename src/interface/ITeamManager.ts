import { LooseObject } from './LooseObject';
import { Hero } from '../models/Hero';

export interface ITeamManager {
  getPlayerTeam() : LooseObject
  getEnemyTeam() : LooseObject
  getActivePlayerHero()  : Hero;
  getActiveEnemyHero() : Hero;
}