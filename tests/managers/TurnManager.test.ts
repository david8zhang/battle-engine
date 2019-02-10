import { expect } from 'chai';
import 'mocha';
import { TurnManager, TurnQueue } from '../../src/managers/TurnManager';
import { ArenaManager } from '../../src/managers/ArenaManager';
import { TeamManager } from '../../src/managers/TeamManager';
import { sampleConfig, multiHitPlayerAction, singleHitPlayerAction, sampleHazards } from '../../seed/battleConfig';
import { ActionTurn } from '../../src/models/ActionTurn';
import { IAbstractTurn } from '../../src/interface/IAbstractTurn';
import { EffectTurn } from '../../src/models/EffectTurn';
import { LooseObject } from '../../src/interface/LooseObject';


const cloneObject = (obj : LooseObject) : LooseObject => {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * sampleConfig initalizes the following:
 *
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
  *  
  * */

describe('Turn Manager', () => {
  describe('Basic turn queue functioning', () => {
    it('correctly enqueues new turns', () => {
      const teamManager = new TeamManager(sampleConfig);
      const turnQueue = new TurnQueue(teamManager);
      const zeroPriority = new ActionTurn({ priority: 0 });
      const onePriority = new ActionTurn({ priority: 1 });
      const twoPriority = new EffectTurn({ priority: 2 });
      turnQueue.enqueueTurn(onePriority);
      turnQueue.enqueueTurn(zeroPriority);
      turnQueue.enqueueTurn(twoPriority);
      const turns : IAbstractTurn[] = [];
      while (turnQueue.size() > 0) {
        turns.push(turnQueue.dequeueTurn());
      }
      expect(turns).to.deep.equal([zeroPriority, onePriority, twoPriority]);
    });

    it('dequeues null values if empty', () => {
      const teamManager = new TeamManager(sampleConfig);
      const turnQueue = new TurnQueue(teamManager);
      expect(turnQueue.dequeueTurn()).to.equal(null);
    });

    it ('adds turns correctly', () => {
      const teamManager = new TeamManager(sampleConfig);
      const arenaManager = new ArenaManager(sampleConfig);
      const turnManager = new TurnManager(teamManager, arenaManager, null);
      turnManager.addPlayerTurn(singleHitPlayerAction)
      const turnQueue : TurnQueue = turnManager._getTurnQueue();
      const newAction : IAbstractTurn = new ActionTurn(singleHitPlayerAction);
      expect(turnQueue.dequeueTurn()).to.deep.equal(newAction);
    });

    it('handles priority correctly', () => {
      const teamManager = new TeamManager(sampleConfig);
      const arenaManager = new ArenaManager(sampleConfig);
      const turnManager = new TurnManager(teamManager, arenaManager, null);
      
      const firstPriority = { ...singleHitPlayerAction, priority: 0 };
      const secondPriority = { ...singleHitPlayerAction, priority: 1 };
      const thirdPriority = { ...singleHitPlayerAction, priority: 2 };

      turnManager.addPlayerTurn(secondPriority);
      turnManager.addPlayerTurn(firstPriority);
      turnManager.addPlayerTurn(thirdPriority);

      const turnQueue : TurnQueue = turnManager._getTurnQueue();

      const correctOrdering = [
        new ActionTurn(firstPriority),
        new ActionTurn(secondPriority),
        new ActionTurn(thirdPriority)
      ]
      let ctr = 0;
      while (turnQueue.size() > 0) {
        const nextTurn : IAbstractTurn = turnQueue.dequeueTurn();
        expect(nextTurn).to.deep.equal(correctOrdering[ctr])
        ctr++;
      }
    });

    it('uses hero speed for tie breakers', () => {
      const teamManager = new TeamManager(sampleConfig);
      const arenaManager = new ArenaManager(sampleConfig);
      const turnManager = new TurnManager(teamManager, arenaManager, null);
      
      // hero 1 is faster than hero 2, so even though their moves have the same priority,
      // hero 1's should be first
      const tiePriority1 = { ...singleHitPlayerAction, priority: 1, sourceHeroId: '1' };
      const tiePriority2 = { ...singleHitPlayerAction, priority: 1, sourceHeroId: '2' };

      turnManager.addPlayerTurn(tiePriority2);
      turnManager.addPlayerTurn(tiePriority1);

      const turnQueue : TurnQueue = turnManager._getTurnQueue();
      const correctOrdering = [
        new ActionTurn(tiePriority1),
        new ActionTurn(tiePriority2)
      ];
      let ctr = 0;
      while (turnQueue.size() > 0) {
        const nextTurn : IAbstractTurn = turnQueue.dequeueTurn();
        expect(nextTurn).to.deep.equal(correctOrdering[ctr]);
        ctr++;
      }
    });
  })

  describe('Action turns', () => {
    it('processes single hit action turns correctly', () => {
      const expectedActionLog = [{
        type: 'Action',
        message: 'hero1 used Sample Single Hit Move and dealt 2 to enemy1',
        result: {
          damage: 2,
          move: 'Sample Single Hit Move',
          sourceHeroId: '1',
          targetHeroId: '3'
        }
      }]
      const configClone = cloneObject(sampleConfig);
      const teamManager = new TeamManager(configClone);
      const arenaManager = new ArenaManager(configClone);
      const turnManager = new TurnManager(teamManager, arenaManager, null);

      turnManager.addPlayerTurn(singleHitPlayerAction);
      const actionLog : LooseObject[] = turnManager.processTurnQueue();

      expect(actionLog.indexOf(null)).to.equal(-1);
      expect(actionLog).to.deep.equal(expectedActionLog);
      expect(teamManager.getActiveEnemyHero().getHealth()).to.equal(98);
    });

    it('processes multi-target action turns correctly', () => {
      const expectedActionLog = [{
        type: 'Action',
        message: 'hero1 used Sample Multi hit Move and dealt 2 to enemy1',
        result: {
          damage: 2,
          move: 'Sample Multi hit Move',
          sourceHeroId: '1',
          targetHeroId: '3'
        }
      }, {
        type: 'Action',
        message: 'hero1 used Sample Multi hit Move and dealt 2 to enemy2',
        result: {
          damage: 2,
          move: 'Sample Multi hit Move',
          sourceHeroId: '1',
          targetHeroId: '4'
        }
      }]
      const configClone = cloneObject(sampleConfig);
      const teamManager = new TeamManager(configClone);
      const arenaManager = new ArenaManager(configClone);
      const turnManager = new TurnManager(teamManager, arenaManager, null);
  
      turnManager.addPlayerTurn(multiHitPlayerAction);
      const actionLog : LooseObject[] = turnManager.processTurnQueue();
  
      expect(actionLog.indexOf(null)).to.equal(-1);
      expect(actionLog).to.deep.equal(expectedActionLog);
      expect(teamManager.getActiveEnemyHero().getHealth()).to.equal(98);
      expect(teamManager.getEnemyTeam()['4'].getHealth()).to.equal(148);
    });

    it('processes multi-hit action turns correctly', () => {
      const configClone = cloneObject(sampleConfig);
      const playerTeam : LooseObject = {
        '1': { name: 'hero1', attack: 10, defense: 10, health: 10, speed: 50, heroId: '1', effects: [] }
      }
      const enemyTeam : LooseObject = {
        '2': { name: 'enemy1', attack: 10, defense: 10, health: 100, speed: 50, heroId: '1', effects: [] },
      }
      configClone.playerTeam = playerTeam;
      configClone.enemyTeam = enemyTeam;
      const teamManager = new TeamManager(configClone);
      const arenaManager = new ArenaManager(configClone);
      const turnManager = new TurnManager(teamManager, arenaManager, null);

      turnManager.addPlayerTurn({
        actionType: 'ActionTurn',
        move: {
          power: 10,
          name: 'Multi hit move'
        },
        sourceHeroId: '2',
        targetHeroIds: ['1', '1', '1'],
        priority: -1
      })
      const expectedActionLog = [{
        type: 'Action',
        message: 'enemy1 used Multi hit move and dealt 2 to hero1',
        result: {
          damage: 2,
          move: 'Multi hit move',
          targetHeroId: '1',
          sourceHeroId: '2'
        }
      }, {
        type: 'Action',
        message: 'enemy1 used Multi hit move and dealt 2 to hero1',
        result: {
          damage: 2,
          move: 'Multi hit move',
          targetHeroId: '1',
          sourceHeroId: '2'
        }
      }, {
        type: 'Action',
        message: 'enemy1 used Multi hit move and dealt 2 to hero1',
        result: {
          damage: 2,
          move: 'Multi hit move',
          targetHeroId: '1',
          sourceHeroId: '2'
        }
      }];
      const actionLog : LooseObject[] = turnManager.processTurnQueue()
      expect(actionLog).to.deep.equal(expectedActionLog);
    })

    it('ensures health never goes below zero', () => {
      const expectedActionLog = [{
        type: 'Action',
        message: 'hero1 used KO move and dealt 1 to enemy1',
        result: {
          sourceHeroId: '1',
          targetHeroId: '2',
          damage: 1,
          move: 'KO move'
        }
      }]
      const playerTeam : LooseObject = {
        '1': { name: 'hero1', attack: 10, defense: 10, health: 100, speed: 50, heroId: '1', effects: [] }
      }
      const enemyTeam : LooseObject = {
        '2': { name: 'enemy1', attack: 10, defense: 10, health: 1, speed: 50, heroId: '2', effects: [] },
      }
      const configClone = cloneObject(sampleConfig);
      configClone.playerTeam = playerTeam;
      configClone.enemyTeam = enemyTeam;
      const teamManager = new TeamManager(configClone);
      const arenaManager = new ArenaManager(configClone);
      const turnManager = new TurnManager(teamManager, arenaManager, null);

      turnManager.addPlayerTurn({
        actionType: 'ActionTurn',
        move: {
          power: 10,
          name: 'KO move'
        },
        sourceHeroId: '1',
        targetHeroIds: ['2'],
        priority: 1
      })
      const actionLog : LooseObject[] = turnManager.processTurnQueue();
      expect(actionLog.indexOf(null)).to.equal(-1);
      expect(actionLog[0]).to.deep.equal(expectedActionLog[0]);
      expect(teamManager.getActiveEnemyHero().getHealth()).to.equal(0);
    });

    it('handles dead heroes correctly', () => {
      const configClone = cloneObject(sampleConfig);
      const expectedActionLog = [{
        type: 'Action',
        message: 'hero1 used KO move and dealt 1 to enemy1',
        result: {
          damage: 1,
          sourceHeroId: '1',
          targetHeroId: '2',
          move: 'KO move'
        }
      }];
      const playerTeam : LooseObject = {
        '1': { name: 'hero1', attack: 10, defense: 10, health: 100, speed: 50, heroId: '1', effects: [] }
      }
      const enemyTeam : LooseObject = {
        '2': { name: 'enemy1', attack: 10, defense: 10, health: 1, speed: 50, heroId: '2', effects: [] },
      }
      configClone.playerTeam = playerTeam;
      configClone.enemyTeam = enemyTeam;
      const teamManager = new TeamManager(configClone);
      const arenaManager = new ArenaManager(configClone);
      const turnManager = new TurnManager(teamManager, arenaManager, null);

      turnManager.addPlayerTurn({
        actionType: 'ActionTurn',
        move: {
          power: 10,
          name: 'KO move'
        },
        sourceHeroId: '1',
        targetHeroIds: ['2'],
        priority: 1
      })

      turnManager.addPlayerTurn({
        actionType: 'ActionTurn',
        move: {
          power: 10,
          name: 'KO move'
        },
        sourceHeroId: '2',
        targetHeroIds: ['1'],
        priority: 1
      })

      const actionLog : LooseObject[] = turnManager.processTurnQueue();
      expect(actionLog[0]).to.deep.equal(expectedActionLog[0]);
      expect(teamManager.getActivePlayerHero().getHealth()).to.equal(100);
    })

    it('displays a message if a hero dies', () => {
      const configClone = cloneObject(sampleConfig);
      const playerTeam : LooseObject = {
        '1': { name: 'hero1', attack: 10, defense: 10, health: 1, speed: 50, heroId: '1', effects: [] }
      }
      const enemyTeam : LooseObject = {
        '2': { name: 'enemy1', attack: 10, defense: 10, health: 100, speed: 50, heroId: '1', effects: [] },
      }
      configClone.playerTeam = playerTeam;
      configClone.enemyTeam = enemyTeam;
      configClone.hazards = sampleHazards;
      const teamManager = new TeamManager(configClone);
      const arenaManager = new ArenaManager(configClone);
      const turnManager = new TurnManager(teamManager, arenaManager, null);

      turnManager.addPlayerTurn({
        actionType: 'ActionTurn',
        move: {
          power: 10,
          name: 'KO move'
        },
        sourceHeroId: '2',
        targetHeroIds: ['1'],
        priority: 0
      })
      const actionLog : LooseObject[] = turnManager.processTurnQueue();
      expect(actionLog[1]).to.deep.equal({
        type: 'Death',
        message: 'hero1 died!',
        result: {
          targetHeroId: '1'
        }
      });
    })

    it('stops turn processing if player hero dies', () => {
      const configClone = cloneObject(sampleConfig);
      const playerTeam : LooseObject = {
        '1': { name: 'hero1', attack: 10, defense: 10, health: 1, speed: 50, heroId: '1', effects: [] }
      }
      const enemyTeam : LooseObject = {
        '2': { name: 'enemy1', attack: 10, defense: 10, health: 100, speed: 50, heroId: '1', effects: [] },
      }
      configClone.playerTeam = playerTeam;
      configClone.enemyTeam = enemyTeam;
      configClone.hazards = sampleHazards;
      const teamManager = new TeamManager(configClone);
      const arenaManager = new ArenaManager(configClone);
      const turnManager = new TurnManager(teamManager, arenaManager, null);

      turnManager.addPlayerTurn({
        actionType: 'ActionTurn',
        move: {
          power: 10,
          name: 'KO move'
        },
        sourceHeroId: '2',
        targetHeroIds: ['1'],
        priority: -1
      })
      turnManager.processTurnQueue()
      expect(turnManager._getTurnQueue().size()).to.not.equal(0);
    })

    it('does not process attacks directed at dead heroes', () => {
      const configClone = cloneObject(sampleConfig);
      const playerTeam : LooseObject = {
        '1': { name: 'hero1', attack: 10, defense: 10, health: 1, speed: 50, heroId: '1', effects: [] },
        '3': { name: 'hero2', attack: 10, defense: 10, health: 100, speed: 10, heroId: '3', effects: [] }
      }
      const enemyTeam : LooseObject = {
        '2': { name: 'enemy1', attack: 10, defense: 10, health: 100, speed: 50, heroId: '2', effects: [] },
      }
      configClone.playerTeam = playerTeam;
      configClone.enemyTeam = enemyTeam;
      configClone.hazards = sampleHazards;
      const teamManager = new TeamManager(configClone);
      const arenaManager = new ArenaManager(configClone);
      const turnManager = new TurnManager(teamManager, arenaManager, null);

      turnManager.addPlayerTurn({
        actionType: 'ActionTurn',
        move: {
          power: 10,
          name: 'Multi hit KO move'
        },
        sourceHeroId: '2',
        targetHeroIds: ['1', '1', '1'],
        priority: -1
      })
      const expectedActionLog = [{
        type: 'Action',
        message: 'enemy1 used Multi hit KO move and dealt 1 to hero1',
        result: {
          damage: 1,
          sourceHeroId: '2',
          targetHeroId: '1',
          move: 'Multi hit KO move'
        }
      }, {
        type: 'Death',
        message: 'hero1 died!',
        result: {
          targetHeroId: '1'
        }
      }];
      const actionLog : LooseObject[] = turnManager.processTurnQueue()
      expect(actionLog).to.deep.equal(expectedActionLog);
    })

    it('does not process attacks from dead heroes', () => {
      const configClone = cloneObject(sampleConfig);
      const playerTeam : LooseObject = {
        '1': { name: 'hero1', attack: 10, defense: 10, health: 1, speed: 50, heroId: '1', effects: [] },
        '3': { name: 'hero2', attack: 10, defense: 10, health: 100, speed: 10, heroId: '3', effects: [] }
      }
      const enemyTeam : LooseObject = {
        '2': { name: 'enemy1', attack: 10, defense: 10, health: 100, speed: 50, heroId: '2', effects: [] },
      }
      configClone.playerTeam = playerTeam;
      configClone.enemyTeam = enemyTeam;
      const teamManager = new TeamManager(configClone);
      const arenaManager = new ArenaManager(configClone);
      const turnManager = new TurnManager(teamManager, arenaManager, null);

      turnManager.addPlayerTurn({
        actionType: 'ActionTurn',
        move: {
          power: 10,
          name: 'KO Move'
        },
        sourceHeroId: '2',
        targetHeroIds: ['1'],
        priority: -1
      })
      turnManager.addPlayerTurn({
        actionType: 'ActionTurn',
        move: {
          power: 10,
          name: 'Tackle'
        },
        sourceHeroId: '1',
        targetHeroIds: ['2'],
        priority: -1
      })

      const expectedActionLog = [{
        type: 'Action',
        message: 'enemy1 used KO Move and dealt 1 to hero1',
        result: {
          damage: 1,
          targetHeroId: '1',
          sourceHeroId: '2',
          move: 'KO Move'
        }
      }, {
        type: 'Death',
        message: 'hero1 died!',
        result: {
          targetHeroId: '1'
        }
      }]

      // will break out of turn processing to switch new active hero
      const actionLog1 : LooseObject[] = turnManager.processTurnQueue();
      expect(actionLog1).to.deep.equal(expectedActionLog);
      const actionLog2 : LooseObject[] = turnManager.processTurnQueue();
      expect(actionLog2).to.deep.equal([]);
    })
  })

  describe('Effect turns', () => {
    it('processes effects correctly', () => {
      const configClone = cloneObject(sampleConfig);
      configClone.hazards = sampleHazards;
      const expectedActionLog = [{
        type: 'Effect',
        message: 'enemy1 took 10 damage from Poison Effect',
        result: {
          hp: -10,
          effect: 'Poison Effect',
          targetHeroId: '3'
        }
      }, {
        type: 'Effect',
        message: 'enemy2 took 10 damage from Poison Effect',
        result: {
          hp: -10,
          effect: 'Poison Effect',
          targetHeroId: '4'
        }
      }, {
        type: 'Effect',
        message: 'hero1 healed 10 hp from Healing Effect',
        result: {
          hp: 10,
          effect: 'Healing Effect',
          targetHeroId: '1'
        }
      }, {
        type: 'Effect',
        message: 'hero2 healed 10 hp from Healing Effect',
        result: {
          hp: 10,
          effect: 'Healing Effect',
          targetHeroId: '2'
        }
      }];
      const teamManager = new TeamManager(configClone);
      const arenaManager = new ArenaManager(configClone);
      const turnManager = new TurnManager(teamManager, arenaManager, null);

      const actionLog : LooseObject[] = turnManager.processTurnQueue();
      expect(actionLog).to.deep.equal(expectedActionLog);
      expect(teamManager.getHero('1').getHealth()).to.equal(110);
      expect(teamManager.getHero('2').getHealth()).to.equal(160);
      expect(teamManager.getHero('3').getHealth()).to.equal(90);
      expect(teamManager.getHero('4').getHealth()).to.equal(140);
    });

    it('applies effects to dead heroes correctly', () => {
      const configClone = cloneObject(sampleConfig);
      configClone.hazards = sampleHazards;
      const playerTeam : LooseObject = {
        '1': { name: 'hero1', attack: 10, defense: 10, health: 100, speed: 50, heroId: '1', effects: [] },
        '2': { name: 'hero2', attack: 10, defense: 10, health: 50, speed: 25, heroId: '2', effects: [] }
      }
      const enemyTeam : LooseObject = {
        '3': { name: 'enemy1', attack: 10, defense: 10, health: 100, speed: 50, heroId: '3', effects: [] },
        '4': { name: 'enemy2', attack: 10, defense: 10, health: 0, speed: 50, heroId: '4', effects: [] },
      }
      configClone.playerTeam = playerTeam;
      configClone.enemyTeam = enemyTeam;
      const expectedActionLog = [{
        type: 'Effect',
        message: 'enemy1 took 10 damage from Poison Effect',
        result: {
          hp: -10,
          targetHeroId: '3',
          effect: 'Poison Effect'
        }
      }, {
        type: 'Effect',
        message: 'hero1 healed 10 hp from Healing Effect',
        result: {
          hp: 10,
          targetHeroId: '1',
          effect: 'Healing Effect'
        }
      }, {
        type: 'Effect',
        message: 'hero2 healed 10 hp from Healing Effect',
        result: {
          hp: 10,
          targetHeroId: '2',
          effect: 'Healing Effect'
        }
      }];
      const teamManager = new TeamManager(configClone);
      const arenaManager = new ArenaManager(configClone);
      const turnManager = new TurnManager(teamManager, arenaManager, null);
      const actionLog : LooseObject[] = turnManager.processTurnQueue();
      expect(actionLog).to.deep.equal(expectedActionLog);
      expect(teamManager.getHero('4').getHealth()).to.equal(0);
    })

    it('does not apply effects to heroes that do not exist', () => {
      const configClone = cloneObject(sampleConfig);
      configClone.hazards = sampleHazards;
      const playerTeam : LooseObject = {
        '10': { name: 'hero1', attack: 10, defense: 10, health: 100, speed: 50, heroId: '1', effects: [] },
        '20': { name: 'hero2', attack: 10, defense: 10, health: 50, speed: 25, heroId: '2', effects: [] }
      }
      const enemyTeam : LooseObject = {
        '30': { name: 'enemy1', attack: 10, defense: 10, health: 100, speed: 50, heroId: '1', effects: [] },
        '40': { name: 'enemy2', attack: 10, defense: 10, health: 0, speed: 50, heroId: '1', effects: [] },
      }
      configClone.playerTeam = playerTeam;
      configClone.enemyTeam = enemyTeam;
      const expectedActionLog : LooseObject[] = [];
      const teamManager = new TeamManager(configClone);
      const arenaManager = new ArenaManager(configClone);
      const turnManager = new TurnManager(teamManager, arenaManager, null);
      const actionLog : LooseObject[] = turnManager.processTurnQueue();
      expect(actionLog).to.deep.equal(expectedActionLog);
    })

    it('correctly applies effects even after an enemy was killed by them', () => {
      const configClone = cloneObject(sampleConfig);
      configClone.hazards = sampleHazards;
      const playerTeam : LooseObject = {
        '1': { name: 'hero1', attack: 10, defense: 10, health: 100, speed: 50, heroId: '1', effects: [] },
        '2': { name: 'hero2', attack: 10, defense: 10, health: 50, speed: 25, heroId: '2', effects: [] }
      }
      const enemyTeam : LooseObject = {
        '3': { name: 'enemy1', attack: 10, defense: 10, health: 100, speed: 50, heroId: '3', effects: [] },
        '4': { name: 'enemy2', attack: 10, defense: 10, health: 0, speed: 10, heroId: '4', effects: [] },
      }
      configClone.playerTeam = playerTeam;
      configClone.enemyTeam = enemyTeam;
      const teamManager = new TeamManager(configClone);
      const arenaManager = new ArenaManager(configClone);
      const turnManager = new TurnManager(teamManager, arenaManager, null);

      // process once
      turnManager.processTurnQueue();

      // process twice - enemy2 should now be dead
      const actionLog : LooseObject[] = turnManager.processTurnQueue();
      const expectedActionLog = [{
        type: 'Effect',
        message: 'enemy1 took 10 damage from Poison Effect',
        result: {
          hp: -10,
          effect: 'Poison Effect',
          targetHeroId: '3'
        }
      }, {
        type: 'Effect',
        message: 'hero1 healed 10 hp from Healing Effect',
        result: {
          hp: 10,
          effect: 'Healing Effect',
          targetHeroId: '1'
        }
      }, {
        type: 'Effect',
        message: 'hero2 healed 10 hp from Healing Effect',
        result: {
          hp: 10,
          effect: 'Healing Effect',
          targetHeroId: '2'
        }
      }];
      expect(actionLog).to.deep.equal(expectedActionLog);
      expect(teamManager.getHero('4').getHealth()).to.equal(0);
    })

    it('handles effect durations correctly', () => {
      const configClone = cloneObject(sampleConfig);
      configClone.hazards = sampleHazards;
      const playerTeam : LooseObject = {
        '1': { name: 'hero1', attack: 10, defense: 10, health: 100, speed: 50, heroId: '1', effects: [] },
        '2': { name: 'hero2', attack: 10, defense: 10, health: 50, speed: 25, heroId: '2', effects: [] }
      }
      const enemyTeam : LooseObject = {
        '3': { name: 'enemy1', attack: 10, defense: 10, health: 100, speed: 50, heroId: '1', effects: [] },
        '4': { name: 'enemy2', attack: 10, defense: 10, health: 0, speed: 10, heroId: '1', effects: [] },
      }
      configClone.playerTeam = playerTeam;
      configClone.enemyTeam = enemyTeam;
      const teamManager = new TeamManager(configClone);
      const arenaManager = new ArenaManager(configClone);
      const turnManager = new TurnManager(teamManager, arenaManager, null);

      turnManager.processTurnQueue();
      turnManager.processTurnQueue();
      turnManager.processTurnQueue();


      // this action log should not have poison effects
      const noPoisonLog : LooseObject[] = turnManager.processTurnQueue();
      const expectedActionLog = [{
        type: 'Effect',
        message: 'hero1 healed 10 hp from Healing Effect',
        result: {
          hp: 10,
          effect: 'Healing Effect',
          targetHeroId: '1'
        }
      }, {
        type: 'Effect',
        message: 'hero2 healed 10 hp from Healing Effect',
        result: {
          hp: 10,
          effect: 'Healing Effect',
          targetHeroId: '2'
        }
      }];
      expect(noPoisonLog).to.deep.equal(expectedActionLog);

      // this action log should not have healing effects
      const noHealLog : LooseObject[] = turnManager.processTurnQueue();
      expect(noHealLog).to.deep.equal([]);
    })
  })

  describe('Switch turns', () => {
    it ('correctly switches out player hero', () => {
      const configClone = cloneObject(sampleConfig);
      const playerTeam : LooseObject = {
        '1': { name: 'hero1', attack: 10, defense: 10, health: 100, speed: 50, heroId: '1', effects: [] },
        '2': { name: 'hero2', attack: 10, defense: 10, health: 50, speed: 25, heroId: '2', effects: [] }
      }
      configClone.playerTeam = playerTeam;
      const teamManager = new TeamManager(configClone);
      const arenaManager = new ArenaManager(configClone);
      const turnManager = new TurnManager(teamManager, arenaManager, null);
      turnManager.addPlayerTurn({
        actionType: 'SwitchTurn',
        newActiveHero: '2',
        side: 'player'
      })
      const expectedActionLog : LooseObject[] = [{
        type: 'Switch',
        message: 'Player sent out hero2',
        result: {
          side: 'player',
          old: '1',
          new: '2'
        }
      }]
      const actionLog : LooseObject[] = turnManager.processTurnQueue();
      expect(actionLog).to.deep.equal(expectedActionLog);
      expect(teamManager.getActivePlayerHero().getName()).to.equal(playerTeam['2'].name);
      expect(teamManager.getActivePlayerHero().getHeroId()).to.equal('2');
    })
    it('correctly switches out an enemy hero', () => {
      const configClone = cloneObject(sampleConfig);
      const enemyTeam : LooseObject = {
        '1': { name: 'hero1', attack: 10, defense: 10, health: 100, speed: 50, heroId: '1', effects: [] },
        '2': { name: 'hero2', attack: 10, defense: 10, health: 50, speed: 25, heroId: '2', effects: [] }
      }
      configClone.enemyTeam = enemyTeam;
      const teamManager = new TeamManager(configClone);
      const arenaManager = new ArenaManager(configClone);
      const turnManager = new TurnManager(teamManager, arenaManager, null);
      turnManager.addPlayerTurn({
        actionType: 'SwitchTurn',
        newActiveHero: '2',
        side: 'enemy'
      })
      const expectedActionLog : LooseObject[] = [{
        type: 'Switch',
        message: 'Enemy sent out hero2',
        result: {
          old: '1',
          new: '2',
          side: 'enemy'
        }
      }]
      const actionLog : LooseObject[] = turnManager.processTurnQueue();
      expect(actionLog).to.deep.equal(expectedActionLog);
      expect(teamManager.getActiveEnemyHero().getName()).to.equal(enemyTeam['2'].name);
      expect(teamManager.getActiveEnemyHero().getHeroId()).to.equal('2');
    })
    it('does not allow switching to nonexistent or dead heroes', () => {
      const configClone = cloneObject(sampleConfig);
      const playerTeam : LooseObject = {
        '1': { name: 'hero1', attack: 10, defense: 10, health: 100, speed: 50, heroId: '1', effects: [] },
        '2': { name: 'hero2', attack: 10, defense: 10, health: 0, speed: 25, heroId: '2', effects: [] }
      }
      configClone.playerTeam = playerTeam;
      const teamManager = new TeamManager(configClone);
      const arenaManager = new ArenaManager(configClone);
      const turnManager = new TurnManager(teamManager, arenaManager, null);
      turnManager.addPlayerTurn({
        actionType: 'SwitchTurn',
        newActiveHero: '3',
        side: 'player'
      })
      const actionLogNonexistentHero : LooseObject[] = turnManager.processTurnQueue();
      expect(actionLogNonexistentHero).to.deep.equal([]);

      turnManager.addPlayerTurn({
        actionType: 'SwitchTurn',
        newActiveHero: '2',
        side: 'player'
      })

      const actionLogDeadHero : LooseObject[] = turnManager.processTurnQueue();
      expect(actionLogDeadHero).to.deep.equal([]);
    })
    it('puts all switch actions at top priority', () => {
      const configClone = cloneObject(sampleConfig);
      const playerTeam : LooseObject = {
        '1': { name: 'hero1', attack: 10, defense: 10, health: 100, speed: 50, heroId: '1', effects: [] },
        '2': { name: 'hero2', attack: 10, defense: 10, health: 50, speed: 25, heroId: '2', effects: [] }
      }
      const enemyTeam : LooseObject = {
        '3': { name: 'enemy1', attack: 10, defense: 10, health: 100, speed: 50, heroId: '1', effects: [] },
        '4': { name: 'enemy2', attack: 10, defense: 10, health: 50, speed: 10, heroId: '1', effects: [] },
      }
      configClone.playerTeam = playerTeam;
      configClone.enemyTeam = enemyTeam;
      const teamManager = new TeamManager(configClone);
      const arenaManager = new ArenaManager(configClone);
      const turnManager = new TurnManager(teamManager, arenaManager, null);
      turnManager.addPlayerTurn({
        actionType: 'ActionTurn',
        move: {
          power: 10,
          name: 'KO move'
        },
        sourceHeroId: '3',
        targetHeroIds: ['1'],
        priority: 1
      })
      turnManager.addPlayerTurn({
        actionType: 'SwitchTurn',
        newActiveHero: '2',
        side: 'player'
      })
      const expectedFirstAction = {
        type: 'Switch',
        message: 'Player sent out hero2',
        result: {
          old: '1',
          new: '2',
          side: 'player'
        }
      };
      const actionLog = turnManager.processTurnQueue();
      expect(actionLog[0]).to.deep.equal(expectedFirstAction);
      expect(teamManager.getActivePlayerHero().getHeroId()).to.equal('2');
    })

    it('redirects all attacks at the new active hero', () => {
      const configClone = cloneObject(sampleConfig);
      const playerTeam : LooseObject = {
        '1': { name: 'hero1', attack: 10, defense: 10, health: 100, speed: 50, heroId: '1', effects: [] },
        '2': { name: 'hero2', attack: 10, defense: 10, health: 50, speed: 25, heroId: '2', effects: [] }
      }
      const enemyTeam : LooseObject = {
        '3': { name: 'enemy1', attack: 10, defense: 10, health: 100, speed: 50, heroId: '1', effects: [] },
        '4': { name: 'enemy2', attack: 10, defense: 10, health: 50, speed: 10, heroId: '1', effects: [] },
      }
      configClone.playerTeam = playerTeam;
      configClone.enemyTeam = enemyTeam;
      const teamManager = new TeamManager(configClone);
      const arenaManager = new ArenaManager(configClone);
      const turnManager = new TurnManager(teamManager, arenaManager, null);
      turnManager.addPlayerTurn({
        actionType: 'ActionTurn',
        move: {
          power: 10,
          name: 'KO move'
        },
        sourceHeroId: '3',
        targetHeroIds: ['1'],
        priority: 1
      })
      turnManager.addPlayerTurn({
        actionType: 'SwitchTurn',
        newActiveHero: '2',
        side: 'player'
      })
      const expectedAction = {
        type: 'Action',
        message: 'enemy1 used KO move and dealt 2 to hero2',
        result: {
          damage: 2,
          targetHeroId: '2',
          sourceHeroId: '3',
          move: 'KO move'
        }
      }
      const actionLog = turnManager.processTurnQueue();
      expect(actionLog[1]).to.deep.equal(expectedAction);
      expect(teamManager.getActivePlayerHero().getHeroId()).to.equal('2');
      expect(teamManager.getHero('2').getHealth()).to.equal(playerTeam['2'].health - 2);
    })

    it('redirects single-target arena hazards towards the switched out hero as well', () => {
      const configClone = cloneObject(sampleConfig);
      const playerTeam : LooseObject = {
        '1': { name: 'hero1', attack: 10, defense: 10, health: 100, speed: 50, heroId: '1', effects: [] },
        '2': { name: 'hero2', attack: 10, defense: 10, health: 50, speed: 25, heroId: '2', effects: [] }
      }
      const enemyTeam : LooseObject = {
        '3': { name: 'enemy1', attack: 10, defense: 10, health: 100, speed: 50, heroId: '1', effects: [] },
        '4': { name: 'enemy2', attack: 10, defense: 10, health: 50, speed: 10, heroId: '1', effects: [] },
      }
      configClone.playerTeam = playerTeam;
      configClone.enemyTeam = enemyTeam;
      configClone.hazards = [{
        duration: 4,
        name: 'Spikes',
        priority: 1,
        targetHeroes: ['1'],
        effect: (heroes : LooseObject[]) : LooseObject[] => {
          const actionLog : LooseObject[] = [];
          heroes.forEach((h : LooseObject) => {
            h.setHealth(h.getHealth() - 10);
            actionLog.push({
              type: 'Effect',
              message: `${h.getName()} took 10 damage from spikes!`,
              result: {
                hp: -10,
                effect: 'Spikes',
                targetHeroId: h.getHeroId()
              }
            })
          })
          return actionLog;
        }
      }]
      const teamManager = new TeamManager(configClone);
      const arenaManager = new ArenaManager(configClone);
      const turnManager = new TurnManager(teamManager, arenaManager, null);
      turnManager.addPlayerTurn({
        actionType: 'SwitchTurn',
        newActiveHero: '2',
        side: 'player'
      })
      const expectedAction = {
        type: 'Effect',
        message: 'hero2 took 10 damage from spikes!',
        result: {
          hp: -10,
          effect: 'Spikes',
          targetHeroId: '2'
        }
      };
      const actionLog = turnManager.processTurnQueue();
      expect(actionLog[1]).to.deep.equal(expectedAction);
      expect(teamManager.getHero('2').getHealth()).to.equal(playerTeam['2'].health - 10);
    })
  })

  describe.only('Win Condition check', () => {
    it('correctly detects a player win condition', () => {
      const configClone = cloneObject(sampleConfig);
      const playerTeam : LooseObject = {
        '1': { name: 'hero1', attack: 10, defense: 10, health: 100, speed: 50, heroId: '1', effects: [] },
        '2': { name: 'hero2', attack: 10, defense: 10, health: 50, speed: 25, heroId: '2', effects: [] }
      }
      const enemyTeam : LooseObject = {
        '3': { name: 'enemy1', attack: 10, defense: 10, health: 1, speed: 50, heroId: '3', effects: [] },
      }

      configClone.playerTeam = playerTeam;
      configClone.enemyTeam = enemyTeam;

      const teamManager = new TeamManager(configClone);
      const arenaManager = new ArenaManager(configClone);
      const turnManager = new TurnManager(teamManager, arenaManager, null);

      turnManager.addPlayerTurn({
        actionType: 'ActionTurn',
        move: {
          power: 10,
          name: 'KO move'
        },
        sourceHeroId: '1',
        targetHeroIds: ['3'],
        priority: 1
      })

      const expectedActionLog = [{
        type: 'Action',
        message: 'hero1 used KO move and dealt 1 to enemy1',
        result: {
          damage: 1,
          targetHeroId: '3',
          sourceHeroId: '1',
          move: 'KO move'
        }
      }, {
        type: 'Death',
        message: 'enemy1 died!',
        result: {
          targetHeroId: '3'
        }
      }, {
        type: 'Win',
        result: {
          side: 'player'
        }
      }];
      const actionLog : LooseObject[] = turnManager.processTurnQueue();
      expect(actionLog).to.deep.equal(expectedActionLog);
    })

    it('correctly detects an enemy win condition', () => {
      const configClone = cloneObject(sampleConfig);
      const playerTeam : LooseObject = {
        '2': { name: 'hero2', attack: 10, defense: 10, health: 1, speed: 25, heroId: '2', effects: [] }
      }
      const enemyTeam : LooseObject = {
        '3': { name: 'enemy1', attack: 10, defense: 10, health: 3, speed: 50, heroId: '3', effects: [] },
      }
      configClone.playerTeam = playerTeam;
      configClone.enemyTeam = enemyTeam;

      const teamManager = new TeamManager(configClone);
      const arenaManager = new ArenaManager(configClone);
      const turnManager = new TurnManager(teamManager, arenaManager, null);

      turnManager.addPlayerTurn({
        actionType: 'ActionTurn',
        move: {
          power: 10,
          name: 'KO move'
        },
        sourceHeroId: '3',
        targetHeroIds: ['2'],
        priority: 1
      })

      const expectedActionLog = [{
        type: 'Action',
        message: 'enemy1 used KO move and dealt 1 to hero2',
        result: {
          damage: 1,
          targetHeroId: '2',
          sourceHeroId: '3',
          move: 'KO move'
        }
      }, {
        type: 'Death',
        message: 'hero2 died!',
        result: {
          targetHeroId: '2'
        }
      }, {
        type: 'Win',
        result: {
          side: 'enemy'
        }
      }];
      const actionLog : LooseObject[] = turnManager.processTurnQueue();
      expect(actionLog).to.deep.equal(expectedActionLog);
    })
  })
})