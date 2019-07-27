import { LooseObject } from '../interface/LooseObject';
import { Hero } from '../models/Hero';

export interface IBattleManager {
  doPlayerTurn(turn : LooseObject) : void;
}