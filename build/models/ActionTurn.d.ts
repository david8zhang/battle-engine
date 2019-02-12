import { Move } from "./Move";
import { IArenaManager } from "../interface/IArenaManager";
import { ITeamManager } from "../interface/ITeamManager";
import { IAbstractTurn } from "../interface/IAbstractTurn";
import { LooseObject } from "../interface/LooseObject";
import { TurnQueue } from "../managers/TurnManager";
export declare class ActionTurn implements IAbstractTurn {
    private move;
    private targetHeroIds;
    private sourceHeroId;
    priority: number;
    constructor(config: LooseObject);
    _getMove(): Move;
    _getTargetHeroIds(): string[];
    _getSourceHeroId(): string;
    processTurn(teamManager: ITeamManager, arenaManager: IArenaManager, turnQueue: TurnQueue): LooseObject[];
}
