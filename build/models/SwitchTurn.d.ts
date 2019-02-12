import { IAbstractTurn } from "../interface/IAbstractTurn";
import { LooseObject } from "../interface/LooseObject";
import { ITeamManager } from "../interface/ITeamManager";
import { IArenaManager } from "../interface/IArenaManager";
import { TurnQueue } from "../managers/TurnManager";
export declare class SwitchTurn implements IAbstractTurn {
    priority: number;
    private newActiveHero;
    private side;
    constructor(config: LooseObject);
    _getNewActiveHero(): string;
    _getSide(): string;
    processTurn(teamManager: ITeamManager, arenaManager: IArenaManager, turnQueue: TurnQueue): LooseObject[];
    private redirectAttacks;
}
