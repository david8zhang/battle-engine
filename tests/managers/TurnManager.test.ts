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
      const expectedActionLog = [
        'hero1 used Sample Single Hit Move and dealt 2 to enemy1'
      ]
      const configClone = cloneObject(sampleConfig);
      const teamManager = new TeamManager(configClone);
      const arenaManager = new ArenaManager(configClone);
      const turnManager = new TurnManager(teamManager, arenaManager, null);

      turnManager.addPlayerTurn(singleHitPlayerAction);
      const actionLog : string[] = turnManager.processTurnQueue();

      expect(actionLog.indexOf(null)).to.equal(-1);
      expect(actionLog).to.deep.equal(expectedActionLog);
      expect(teamManager.getActiveEnemyHero().getHealth()).to.equal(98);
    });

    it('processes multi-target action turns correctly', () => {
      const expectedActionLog = [
        'hero1 used Sample Multi hit Move and dealt 2 to enemy1',
        'hero1 used Sample Multi hit Move and dealt 2 to enemy2' 
      ]
      const configClone = cloneObject(sampleConfig);
      const teamManager = new TeamManager(configClone);
      const arenaManager = new ArenaManager(configClone);
      const turnManager = new TurnManager(teamManager, arenaManager, null);
  
      turnManager.addPlayerTurn(multiHitPlayerAction);
      const actionLog : string[] = turnManager.processTurnQueue();
  
      expect(actionLog.indexOf(null)).to.equal(-1);
      expect(actionLog).to.deep.equal(expectedActionLog);
      expect(teamManager.getActiveEnemyHero().getHealth()).to.equal(98);
      expect(teamManager.getEnemyTeam()['4'].getHealth()).to.equal(148);
    });

    it('ensures health never goes below zero', () => {
      const expectedActionLog = [
        'hero1 used KO move and dealt 1 to enemy1'
      ]
      const playerTeam : LooseObject = {
        '1': { name: 'hero1', attack: 10, defense: 10, health: 100, speed: 50, heroId: '1', effects: [] }
      }
      const enemyTeam : LooseObject = {
        '2': { name: 'enemy1', attack: 10, defense: 10, health: 1, speed: 50, heroId: '1', effects: [] },
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
      const actionLog : string[] = turnManager.processTurnQueue();
      expect(actionLog.indexOf(null)).to.equal(-1);
      expect(actionLog).to.deep.equal(expectedActionLog);
      expect(teamManager.getActiveEnemyHero().getHealth()).to.equal(0);
    });

    it('handles dead heroes correctly', () => {
      const configClone = cloneObject(sampleConfig);
      const expectedActionLog = ['hero1 used KO move and dealt 1 to enemy1'];
      const playerTeam : LooseObject = {
        '1': { name: 'hero1', attack: 10, defense: 10, health: 100, speed: 50, heroId: '1', effects: [] }
      }
      const enemyTeam : LooseObject = {
        '2': { name: 'enemy1', attack: 10, defense: 10, health: 1, speed: 50, heroId: '1', effects: [] },
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

      const actionLog : string[] = turnManager.processTurnQueue();
      expect(actionLog).to.deep.equal(expectedActionLog);
      expect(teamManager.getActivePlayerHero().getHealth()).to.equal(100);
    })
  })

  describe('Effect turns', () => {
    it('processes effects correctly', () => {
      const configClone = cloneObject(sampleConfig);
      configClone.hazards = sampleHazards;
      const expectedActionLog = [
        'enemy1 took 10 damage from Poison Effect',
        'enemy2 took 10 damage from Poison Effect',
        'hero1 healed 10 hp from Healing Effect',
        'hero2 healed 10 hp from Healing Effect'
      ];
      const teamManager = new TeamManager(configClone);
      const arenaManager = new ArenaManager(configClone);
      const turnManager = new TurnManager(teamManager, arenaManager, null);

      const actionLog = turnManager.processTurnQueue();
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
        '3': { name: 'enemy1', attack: 10, defense: 10, health: 100, speed: 50, heroId: '1', effects: [] },
        '4': { name: 'enemy2', attack: 10, defense: 10, health: 0, speed: 50, heroId: '1', effects: [] },
      }
      configClone.playerTeam = playerTeam;
      configClone.enemyTeam = enemyTeam;
      const expectedActionLog = [
        'enemy1 took 10 damage from Poison Effect',
        'hero1 healed 10 hp from Healing Effect',
        'hero2 healed 10 hp from Healing Effect'
      ];
      const teamManager = new TeamManager(configClone);
      const arenaManager = new ArenaManager(configClone);
      const turnManager = new TurnManager(teamManager, arenaManager, null);
      const actionLog : string[] = turnManager.processTurnQueue();
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
      const expectedActionLog : string[] = [];
      const teamManager = new TeamManager(configClone);
      const arenaManager = new ArenaManager(configClone);
      const turnManager = new TurnManager(teamManager, arenaManager, null);
      const actionLog : string[] = turnManager.processTurnQueue();
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
        '3': { name: 'enemy1', attack: 10, defense: 10, health: 100, speed: 50, heroId: '1', effects: [] },
        '4': { name: 'enemy2', attack: 10, defense: 10, health: 0, speed: 10, heroId: '1', effects: [] },
      }
      configClone.playerTeam = playerTeam;
      configClone.enemyTeam = enemyTeam;
      const teamManager = new TeamManager(configClone);
      const arenaManager = new ArenaManager(configClone);
      const turnManager = new TurnManager(teamManager, arenaManager, null);

      // process once
      turnManager.processTurnQueue();

      // process twice - enemy2 should now be dead
      const actionLog : string[] = turnManager.processTurnQueue();
      const expectedActionLog = [
        'enemy1 took 10 damage from Poison Effect',
        'hero1 healed 10 hp from Healing Effect',
        'hero2 healed 10 hp from Healing Effect'
      ];
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
      const noPoisonLog = turnManager.processTurnQueue();
      const expectedActionLog = [
        'hero1 healed 10 hp from Healing Effect',
        'hero2 healed 10 hp from Healing Effect'
      ];
      expect(noPoisonLog).to.deep.equal(expectedActionLog);

      // this action log should not have healing effects
      const noHealLog = turnManager.processTurnQueue();
      expect(noHealLog).to.deep.equal([]);
    })
  })

  describe.only('Switch turns', () => {
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
      const expectedActionLog : string[] = [
        'Player sent out hero2'
      ]
      const actionLog : string[] = turnManager.processTurnQueue();
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
      const expectedActionLog : string[] = [
        'Enemy sent out hero2'
      ]
      const actionLog : string[] = turnManager.processTurnQueue();
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
      const actionLogNonexistentHero : string[] = turnManager.processTurnQueue();
      expect(actionLogNonexistentHero).to.deep.equal([]);

      turnManager.addPlayerTurn({
        actionType: 'SwitchTurn',
        newActiveHero: '2',
        side: 'player'
      })

      const actionLogDeadHero : string[] = turnManager.processTurnQueue();
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
      const expectedFirstAction = 'Player sent out hero2';
      const actionLog = turnManager.processTurnQueue();
      expect(actionLog[0]).to.equal(expectedFirstAction);
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
      const expectedAction = 'enemy1 used KO move and dealt 2 to hero2'
      const actionLog = turnManager.processTurnQueue();
      expect(actionLog[1]).to.equal(expectedAction);
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
        effect: (heroes : LooseObject[]) : string[] => {
          const actionLog : string[] = [];
          heroes.forEach((h : LooseObject) => {
            h.setHealth(h.getHealth() - 10);
            actionLog.push(`${h.getName()} took 10 damage from spikes!`)
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
      const expectedAction = 'hero2 took 10 damage from spikes!';
      const actionLog = turnManager.processTurnQueue();
      expect(actionLog[1]).to.equal(expectedAction);
      expect(teamManager.getHero('2').getHealth()).to.equal(playerTeam['2'].health - 10);
    })
  })
})