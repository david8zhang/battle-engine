import { LooseObject } from "../interface/LooseObject";
import { Hero } from "./Hero";
export declare class Move {
    private name;
    private power;
    private priority;
    constructor(config: LooseObject);
    getPower(): number;
    setPower(power: number): void;
    getPriority(): number;
    setPriority(priority: number): void;
    getName(): string;
    setName(name: string): void;
    calculateDamage(sourceHero: Hero, targetHero: Hero): number;
}
