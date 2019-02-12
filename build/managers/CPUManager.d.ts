import { ICPUManager } from "../interface/ICPUManager";
import { LooseObject } from "../interface/LooseObject";
import { IAbstractTurn } from "../interface/IAbstractTurn";
import { IArenaManager } from "../interface/IArenaManager";
import { ITeamManager } from "../interface/ITeamManager";
export declare class CPUManager implements ICPUManager {
    private moveCalculator;
    private switchCalculator;
    constructor(battleConfig: LooseObject);
    private defaultMoveCalculator;
    private defaultSwitchCalculator;
    private allDead;
    getCPUTurn(arenaManager: IArenaManager, teamManager: ITeamManager): IAbstractTurn;
}
