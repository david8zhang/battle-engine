import { ITeamManager } from '../interface/ITeamManager';
import { IArenaManager } from '../interface/IArenaManager';
import { IAbstractTurn } from '../interface/IAbstractTurn';
import { LooseObject } from '../interface/LooseObject';
import { TurnQueue } from '../managers/TurnManager';
export declare class EffectTurn implements IAbstractTurn {
    duration: number;
    name: string;
    priority: number;
    targetHeroes: string[];
    effect: Function;
    constructor(config: LooseObject);
    processTurn(teamManager: ITeamManager, arenaManager: IArenaManager, turnQueue: TurnQueue): LooseObject[];
}
