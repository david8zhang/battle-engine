import { LooseObject } from "../src/interface/LooseObject";

export const samplePlayerHeroes : LooseObject = {
  '1': { name: 'hero1', level: 5, attack: 10, defense: 10, health: 100, speed: 50, heroId: '1', effects: [], moveSet: [] },
  '2': { name: 'hero2', level: 20, attack: 15, defense: 15, health: 150, speed: 25, heroId: '2', effects: [], moveSet: [] },
  '3': { name: 'hero3', level: 50, attack: 20, defense: 20, health: 200, speed: 15, heroId: '3', effects: [], moveSet: [] }
}

export const sampleEnemyHeroes : LooseObject = {
  '3': { name: 'enemy1', level: 5, attack: 10, defense: 10, health: 100, speed: 10, heroId: '3', effects: [], moveSet: [] },
  '4': { name: 'enemy2', level: 20, attack: 15, defense: 15, health: 150, speed: 5, heroId: '4', effects: [], moveSet: [] },
  '5': { name: 'enemy3', level: 50, attack: 20, defense: 20, health: 200, speed: 1, heroId: '5', effects: [], moveSet: [] }
}

export const multiHitPlayerAction : LooseObject = {
  actionType: 'ActionTurn',
  move: {
    power: 10,
    name: 'Sample Multi hit Move'
  },
  sourceHeroId: '1',
  targetHeroIds: ['3', '4'],
  priority: 1
}

export const singleHitPlayerAction : LooseObject = {
  actionType: 'ActionTurn',
  move: {
    power: 10,
    name: 'Sample Single Hit Move'
  },
  sourceHeroId: '1',
  targetHeroIds: ['3'],
  priority: 1
}

export const sampleHazards : LooseObject[] = [{
  duration: 4,
  name: 'Healing Effect',
  priority: 1,
  targetHeroes: ['1', '2'],
  effect: (heroes : LooseObject[]) : LooseObject[] => {
    const actionLog : LooseObject[] = [];
    heroes.forEach((h : LooseObject) => {
      h.setHealth(h.getHealth() + 10);
      actionLog.push({
        type: 'Effect',
        message:  `${h.getName()} healed 10 hp from Healing Effect`,
        result: {
          hp: 10,
          targetHeroId: h.getHeroId(),
          effect: 'Healing Effect'
        }
      })
    })
    return actionLog;
  }
}, {
  duration: 3,
  name: 'Poison Effect',
  priority: 0,
  targetHeroes: ['3', '4'],
  effect: (heroes : LooseObject[]) : LooseObject[] => {
    const actionLog : LooseObject[] = [];
    heroes.forEach((h : LooseObject) => {
      h.setHealth(h.getHealth() - 10)
      actionLog.push({
        type: 'Effect',
        message:  `${h.getName()} took 10 damage from Poison Effect`,
        result: {
          hp: -10,
          targetHeroId: h.getHeroId(),
          effect: 'Poison Effect'
        }
      })
    })
    return actionLog;
  }
}]

export const sampleConfig : LooseObject = {
  playerTeam: samplePlayerHeroes,
  enemyTeam: sampleEnemyHeroes,
  hazards: []
}