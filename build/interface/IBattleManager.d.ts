import { LooseObject } from '../interface/LooseObject';
export interface IBattleManager {
    doPlayerTurn(turn: LooseObject): void;
}
