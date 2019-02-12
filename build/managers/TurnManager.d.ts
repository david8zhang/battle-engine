import { ITeamManager } from "../interface/ITeamManager";
import { IArenaManager } from "../interface/IArenaManager";
import { ITurnManager } from "../interface/ITurnManager";
import { LooseObject } from "../interface/LooseObject";
import { IAbstractTurn } from "../interface/IAbstractTurn";
import { ICPUManager } from "../interface/ICPUManager";
export declare class TurnQueue {
    private queue;
    private teamManager;
    constructor(teamManager: ITeamManager);
    private showError;
    private calculateSpeedPriority;
    enqueueTurn(turn: IAbstractTurn): void;
    enqueueTurns(turnArray: IAbstractTurn[]): void;
    dequeueTurn(): IAbstractTurn;
    size(): number;
    _getQueue(): IAbstractTurn[];
}
export declare class TurnManager implements ITurnManager {
    private teamManager;
    private arenaManager;
    private cpuManager;
    private turnQueue;
    constructor(teamManager: ITeamManager, arenaManager: IArenaManager, cpuManager: ICPUManager);
    processTurnQueue(): LooseObject[];
    checkWinCondition(actionLog: LooseObject[]): boolean;
    private addEffectsToQueue;
    addPlayerTurn(playerInput: LooseObject): void;
    addCPUTurn(): void;
    _getTurnQueue(): TurnQueue;
    _setTurnQueue(turnQueue: TurnQueue): void;
}
