import { LooseObject } from "../interface/LooseObject";
import { IArenaManager } from '../interface/IArenaManager';
import { IAbstractTurn } from "../interface/IAbstractTurn";
export declare class ArenaManager implements IArenaManager {
    private hazards;
    constructor(battleConfig: LooseObject);
    addHazard(hazard: LooseObject): void;
    getHazards(): IAbstractTurn[];
}
