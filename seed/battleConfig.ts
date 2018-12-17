import { Hero } from "../src/models/Hero";
import { LooseObject } from "../src/interface/LooseObject";

export const samplePlayerHeroes : LooseObject = {
  '1': new Hero({ name: 'hero1', attack: 10, defense: 10, health: 100, heroId: '1', effects: [] }),
  '2': new Hero({ name: 'hero2', attack: 15, defense: 15, health: 150, heroId: '2', effects: [] }),
  '3': new Hero({ name: 'hero3', attack: 20, defense: 20, health: 200, heroId: '3', effects: [] })
}

export const sampleEnemyHeroes : LooseObject = {
  '3': new Hero({ name: 'enemy1', attack: 10, defense: 10, health: 100, heroId: '3', effects: [] }),
  '4': new Hero({ name: 'enemy2', attack: 15, defense: 15, health: 150, heroId: '4', effects: [] }),
  '5': new Hero({ name: 'enemy3', attack: 20, defense: 20, health: 200, heroId: '5', effects: [] })
}

export const samplePlayerTurnAction : LooseObject = {
  actionType: 'ActionTurn',
  move: {
    power: 10,
    name: 'Sample Move'
  },
  sourceHeroId: '1',
  targetHeroIds: ['3', '4'],
  priority: 1
}

export const sampleHazards : LooseObject[] = [{
  duration: 10,
  name: 'Effect 1',
  priority: 0,
  targetHeroes: ['1234', '4567']
}, {
  duration: 15,
  name: 'Effect 2',
  priority: 0,
  targetHeroes: ['5678', '0987']
}]

export const sampleConfig : LooseObject = {
  playerGenerator: () => samplePlayerHeroes,
  enemyGenerator: () => sampleEnemyHeroes,
  hazards: sampleHazards
}