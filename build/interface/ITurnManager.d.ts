import { LooseObject } from "./LooseObject";
export interface ITurnManager {
    addPlayerTurn(playerInput: LooseObject): void;
    processTurnQueue(): LooseObject[];
}
