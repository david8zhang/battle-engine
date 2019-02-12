import { LooseObject } from '../interface/LooseObject';
import { ITeamManager } from '../interface/ITeamManager';
import { Hero } from '../models/Hero';
export declare class TeamManager implements ITeamManager {
    private activePlayerHero;
    private activeEnemyHero;
    private playerTeam;
    private enemyTeam;
    constructor(battleConfig: LooseObject);
    getEnemyTeam(): LooseObject;
    getPlayerTeam(): LooseObject;
    getActivePlayerHero(): Hero;
    getActiveEnemyHero(): Hero;
    setActivePlayerHero(newActiveHeroId: string): void;
    setActiveEnemyHero(newActiveHeroId: string): void;
    getHero(id: string): Hero;
    private convertToHeroes;
}
