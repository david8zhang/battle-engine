import { IBattleManager } from "../interface/IBattleManager";
import { LooseObject } from '../interface/LooseObject';
export declare class BattleManager implements IBattleManager {
    private teamManager;
    private arenaManager;
    private turnManager;
    private cpuManager;
    constructor(battleConfig: LooseObject);
    doPlayerTurn(playerInput: LooseObject): LooseObject[];
    getEnemyTeam(): any[];
    getPlayerTeam(): any[];
    getActivePlayerHero(): {
        name: string;
        health: number;
        attack: number;
        defense: number;
        speed: number;
        heroId: string;
        effects: import("../interface/IAbstractTurn").IAbstractTurn[];
        moveSet: {
            name: string;
            power: number;
            priority: number;
        }[];
    };
    getActiveEnemyHero(): {
        name: string;
        health: number;
        attack: number;
        defense: number;
        speed: number;
        heroId: string;
        effects: import("../interface/IAbstractTurn").IAbstractTurn[];
        moveSet: {
            name: string;
            power: number;
            priority: number;
        }[];
    };
    private deserializeMoves;
    private deserializeTeam;
    private deserializeHero;
}
