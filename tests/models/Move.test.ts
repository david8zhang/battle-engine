import { expect } from 'chai';
import { Move } from '../../src/models/Move';
import 'mocha';
import { Hero } from '../../src/models/Hero';
import { LooseObject } from '../../src/interface/LooseObject';

describe('Move', () => {
  it('allows custom damage calculation logic', () => {
    const customDamageCalculator = (source : LooseObject, target : LooseObject) => {
      return Math.floor(target.getHealth() * 0.5);
    }
    const moveConfig = {
      power: 10,
      name: 'Headbutt',
      priority: 0,
      isHeal: false,
      healAmt: 0,
      customDamageCalculator 
    }

    const move = new Move(moveConfig);
    const sourceHero = new Hero({ name: 'hero1', attack: 10, defense: 10, health: 4, speed: 50, heroId: '1', effects: [], moveSet: [] })
    const targetHero = new Hero({ name: 'hero2', attack: 10, defense: 10, health: 4, speed: 50, heroId: '2', effects: [], moveSet: [] })
    const damage = move.calculateDamage(sourceHero, targetHero)
    expect(damage).to.equal(2)
  })

  it('processes healing logic correctly', () => {
    const moveConfig = {
      power: 0,
      name: 'Healing Light',
      priority: 0,
      isHeal: false,
      healAmt: 0.5
    }
    const move = new Move(moveConfig)
    const sourceHero = new Hero({ name: 'hero1', attack: 10, defense: 10, health: 4, speed: 50, heroId: '1', effects: [], moveSet: [] })
    const targetHero = new Hero({ name: 'hero2', attack: 10, defense: 10, health: 4, speed: 50, heroId: '2', effects: [], moveSet: [] })

    targetHero.setHealth(2);

    const healAmt = move.calculateHealing(sourceHero, targetHero);
    expect(healAmt).to.equal(2)
  })

  it('only heals up to max health', () => {
    const moveConfig = {
      power: 0,
      name: 'Healing Light',
      priority: 0,
      isHeal: false,
      healAmt: 0.5
    }
    const move = new Move(moveConfig)
    const sourceHero = new Hero({ name: 'hero1', attack: 10, defense: 10, health: 4, speed: 50, heroId: '1', effects: [], moveSet: [] })
    const targetHero = new Hero({ name: 'hero2', attack: 10, defense: 10, health: 4, speed: 50, heroId: '2', effects: [], moveSet: [] })

    targetHero.setHealth(3);

    const healAmt = move.calculateHealing(sourceHero, targetHero);
    expect(healAmt).to.equal(1)
  })
})