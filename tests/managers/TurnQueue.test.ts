import { expect } from 'chai';
import 'mocha';

/** Managers */
import { TurnQueue } from '../../src/managers/TurnManager';
import { ActionTurn } from '../../src/models/ActionTurn';
import { EffectTurn } from '../../src/models/EffectTurn';
import { IAbstractTurn } from '../../src/interface/IAbstractTurn';

describe('Turn Queue', () => {
  it('correctly enqueues new turns', () => {
    const turnQueue = new TurnQueue();
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
  })
  it('dequeues null values if empty', () => {
    const turnQueue = new TurnQueue();
    expect(turnQueue.dequeueTurn()).to.equal(null);
  })
})