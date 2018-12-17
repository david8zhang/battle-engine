import { expect } from 'chai';
import 'mocha';
import { TurnManager, TurnQueue } from '../../src/managers/TurnManager';
import { ArenaManager } from '../../src/managers/ArenaManager';
import { TeamManager } from '../../src/managers/TeamManager';
import { sampleConfig, samplePlayerTurnAction } from '../../seed/battleConfig';
import { ActionTurn } from '../../src/models/ActionTurn';

describe('Turn Manager', () => {
  it ('adds turns correctly', () => {
    const teamManager = new TeamManager(sampleConfig);
    const arenaManager = new ArenaManager(sampleConfig);
    const turnManager = new TurnManager(teamManager, arenaManager);
    turnManager.addPlayerTurn(samplePlayerTurnAction)
    const turnQueue : TurnQueue = turnManager._getTurnQueue();
    const newAction = new ActionTurn(samplePlayerTurnAction);
    expect(turnQueue.dequeueTurn()).to.deep.equal(newAction);
  })

  it ('processes turns correctly', () => {
    const expectedActionLog = [
      'hero1 used Sample Move and dealt 2 to enemy1',
      'hero1 used Sample Move and dealt 2 to enemy2' 
    ]
    const teamManager = new TeamManager(sampleConfig);
    const arenaManager = new ArenaManager(sampleConfig);
    const turnManager = new TurnManager(teamManager, arenaManager);
    turnManager.addPlayerTurn(samplePlayerTurnAction);
    const actionLog : string[] = turnManager.processTurnQueue();
    expect(actionLog.indexOf(null)).to.equal(-1);
    expect(actionLog).to.deep.equal(expectedActionLog);
  })
})