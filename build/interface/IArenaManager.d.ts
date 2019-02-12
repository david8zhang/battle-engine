import { IAbstractTurn } from "./IAbstractTurn";
export interface IArenaManager {
    getHazards(): IAbstractTurn[];
}
