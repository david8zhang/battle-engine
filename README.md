# Turn-based Battle Engine

This is an implementation of a simplified Pokemon-style turn-based battle engine. Players each initialize with a team of "heroes", each with their own stats affecting their damage output, resistance, and health. They also contain a moveset that they can use to damage other heroes. Victory is achieved when one player reduces all the other player's heroes' health to 0. 

## Architecture

- Battle Manager - orchestrates all other managers, talks to UI and recieves player input
	- Arena Manager - manages the arena, such as arena hazards
	- Team Manager - manages the player and enemy teams, as well as effects applied to all the heroes on each team
	- Turn Manager - manages the team and arena state and processes turns which mutate that state

- Models:
  - ActionTurn, EffectTurn - different types of turns which mutate game state in different ways
  - Hero - maintains stats, movepool data about a single hero
  - Move - maintains move name, power, logic for damage calculation


## How to run

- Tests: `npm run test`