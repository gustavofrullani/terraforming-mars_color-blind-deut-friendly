import {Philares} from '../../../src/server/cards/promo/Philares';
import {Game} from '../../../src/server/Game';
import {SpaceType} from '../../../src/common/boards/SpaceType';
import {EmptyBoard} from '../../ares/EmptyBoard';
import {TileType} from '../../../src/common/TileType';
import {ISpace} from '../../../src/server/boards/ISpace';
import {expect} from 'chai';
import {Phase} from '../../../src/common/Phase';
import {AndOptions} from '../../../src/server/inputs/AndOptions';
import {TestPlayer} from '../../TestPlayer';
import {Units} from '../../../src/common/Units';
import {MAX_OXYGEN_LEVEL, MAX_TEMPERATURE} from '../../../src/common/constants';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {cast, runAllActions} from '../../TestingUtils';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';

describe('Philares', () => {
  let card: Philares;
  let philaresPlayer : TestPlayer;
  let otherPlayer: TestPlayer;
  let game: Game;
  let space: ISpace;
  let adjacentSpace: ISpace;
  let adjacentSpace2: ISpace;

  beforeEach(() => {
    card = new Philares();
    philaresPlayer = TestPlayer.BLUE.newPlayer();
    otherPlayer = TestPlayer.RED.newPlayer();
    // redPlayer is first for the final placement test.
    game = Game.newInstance('gameid', [otherPlayer, philaresPlayer], otherPlayer);
    game.board = EmptyBoard.newInstance();
    space = game.board.spaces[4];
    adjacentSpace = game.board.getAdjacentSpaces(space)[0];
    adjacentSpace2 = game.board.getAdjacentSpaces(space)[2];

    philaresPlayer.setCorporationForTest(card);
  });

  it('No bonus when placing next to self', () => {
    game.addTile(philaresPlayer, space, {tileType: TileType.GREENERY});
    expect(game.deferredActions).has.length(0);
    game.addTile(philaresPlayer, adjacentSpace, {tileType: TileType.GREENERY});
    expect(game.deferredActions).has.length(0);
  });

  it('bonus when placing next to opponent', () => {
    game.addTile(otherPlayer, space, {tileType: TileType.GREENERY});
    expect(game.deferredActions).has.length(0);
    game.addTile(philaresPlayer, adjacentSpace, {tileType: TileType.GREENERY});
    expect(game.deferredActions).has.length(1);
  });

  it('bonus when opponent places next to you', () => {
    game.addTile(philaresPlayer, space, {tileType: TileType.GREENERY});
    expect(game.deferredActions).has.length(0);
    game.addTile(otherPlayer, adjacentSpace, {tileType: TileType.GREENERY});
    expect(game.deferredActions).has.length(1);
  });

  it('placing ocean tile does not grant bonus', () => {
    game.addTile(otherPlayer, space, {tileType: TileType.GREENERY});
    expect(game.deferredActions).has.length(0);
    adjacentSpace.spaceType = SpaceType.OCEAN; // Make this space an ocean space.
    game.addTile(philaresPlayer, adjacentSpace, {tileType: TileType.OCEAN});
    expect(game.deferredActions).has.length(0);
  });

  it('ocean tile next to yours does not grant bonus', () => {
    space.spaceType = SpaceType.OCEAN; // Make this space an ocean space.
    game.addTile(otherPlayer, space, {tileType: TileType.OCEAN});
    expect(game.deferredActions).has.length(0);
    game.addTile(philaresPlayer, adjacentSpace, {tileType: TileType.GREENERY});
    expect(game.deferredActions).has.length(0);
  });

  it('No adjacency bonus during WGT', () => {
    game.addTile(philaresPlayer, space, {tileType: TileType.GREENERY});
    expect(game.deferredActions).has.length(0);
    game.phase = Phase.SOLAR;
    game.addTile(otherPlayer, adjacentSpace, {tileType: TileType.GREENERY});
    expect(game.deferredActions).has.length(0);
  });

  it('one tile one bonus', () => {
    game.addTile(philaresPlayer, space, {tileType: TileType.GREENERY});
    game.addTile(otherPlayer, adjacentSpace, {tileType: TileType.GREENERY});
    const action = game.deferredActions.pop();
    const options = cast(action?.execute(), AndOptions);
    // Options are ordered 0-5, MC to heat.
    expect(philaresPlayer.purse()).deep.eq(Units.EMPTY);
    options.options[0].cb(1);
    options.cb();
    expect(philaresPlayer.purse()).deep.eq(Units.of({megacredits: 1}));
  });

  it('one tile one bonus - player is greedy', () => {
    game.addTile(philaresPlayer, space, {tileType: TileType.GREENERY});
    game.addTile(otherPlayer, adjacentSpace, {tileType: TileType.GREENERY});
    const action = game.deferredActions.pop();
    const options = cast(action?.execute(), AndOptions);
    // Options are ordered 0-5, MC to heat.
    expect(philaresPlayer.purse()).deep.eq(Units.EMPTY);
    options.options[0].cb(1);
    options.options[1].cb(1);
    expect(() => options.cb()).to.throw('Need to select 1 resource(s)');
  });

  it('Multiple bonuses when placing next to multiple tiles', () => {
    game.addTile(otherPlayer, adjacentSpace, {tileType: TileType.GREENERY});
    game.addTile(otherPlayer, adjacentSpace2, {tileType: TileType.GREENERY});
    expect(game.deferredActions).has.length(0);
    game.addTile(philaresPlayer, space, {tileType: TileType.GREENERY});
    expect(game.deferredActions).has.length(1);
    const action = game.deferredActions.pop();
    const options = cast(action?.execute(), AndOptions);
    // Options are ordered 0-5, MC to heat.
    expect(philaresPlayer.purse()).deep.eq(Units.EMPTY);
    options.options[0].cb(1);
    options.options[1].cb(1);
    options.cb();
    expect(philaresPlayer.purse()).deep.eq(Units.of({megacredits: 1, steel: 1}));
  });

  it('Multiple bonuses when opponent places next to multiple of your tiles', () => {
    game.addTile(philaresPlayer, adjacentSpace, {tileType: TileType.GREENERY});
    game.addTile(philaresPlayer, adjacentSpace2, {tileType: TileType.GREENERY});
    expect(game.deferredActions).has.length(0);
    game.addTile(otherPlayer, space, {tileType: TileType.GREENERY});
    expect(game.deferredActions).has.length(1);
    const action = game.deferredActions.pop();
    const options = cast(action?.execute(), AndOptions);
    // Options are ordered 0-5, MC to heat.
    expect(philaresPlayer.purse()).deep.eq(Units.EMPTY);
    options.options[0].cb(1);
    options.options[1].cb(1);
    options.cb();
    expect(philaresPlayer.purse()).deep.eq(Units.of({megacredits: 1, steel: 1}));
  });

  it('two tiles two bonuses - player is greedy', () => {
    game.addTile(otherPlayer, adjacentSpace, {tileType: TileType.GREENERY});
    game.addTile(otherPlayer, adjacentSpace2, {tileType: TileType.GREENERY});
    game.addTile(philaresPlayer, space, {tileType: TileType.GREENERY});
    const action = game.deferredActions.pop();
    const options = cast(action?.execute(), AndOptions);
    // Options are ordered 0-5, MC to heat.
    expect(philaresPlayer.purse()).deep.eq(Units.EMPTY);
    options.options[0].cb(1);
    options.options[1].cb(1);
    options.options[2].cb(1);
    expect(() => options.cb()).to.throw('Need to select 2 resource(s)');
  });

  it('Should take initial action', function() {
    philaresPlayer.runInitialAction(card);
    runAllActions(game);

    const action = cast(philaresPlayer.popWaitingFor(), SelectSpace);
    action.cb(action.availableSpaces[0]);
    expect(philaresPlayer.getTerraformRating()).to.eq(21);
  });

  it('Can place final greenery if gains enough plants from earlier players placing adjacent greeneries', function() {
    game.addGreenery(philaresPlayer, space);

    // Max out all global parameters
    (game as any).temperature = MAX_TEMPERATURE;
    (game as any).oxygenLevel = MAX_OXYGEN_LEVEL;
    // maxOutOceans(player);

    // Setup plants for endgame
    philaresPlayer.plants = 7;
    otherPlayer.plants = 8;

    // First player final greenery placement, done adjacent to one of Philares' tiles
    game.takeNextFinalGreeneryAction();
    const firstPlayerGreeneryPlacement = cast(otherPlayer.getWaitingFor(), OrOptions);

    // Option 1 is 'Don't place a greenery'
    // Don't place a greenery using the callback; add it directly via game.addGreenery() instead
    // Workaround for test since the greenery placement option auto resolves deferred action
    firstPlayerGreeneryPlacement.options[1].cb();
    game.addGreenery(otherPlayer, adjacentSpace);
    expect(game.deferredActions).has.lengthOf(1);

    // Philares player gains plant and can subsequently place a greenery
    philaresPlayer.takeActionForFinalGreenery();
    const philaresPlayerResourceSelection = cast(philaresPlayer.getWaitingFor(), AndOptions);
    // Option 3 is plants.
    philaresPlayerResourceSelection.options[3].cb(1);
    philaresPlayerResourceSelection.cb();
    expect(philaresPlayer.plants).to.eq(8);
    philaresPlayer.popWaitingFor();
    game.takeNextFinalGreeneryAction();
    const finalGreeneryPlacement = cast(philaresPlayer.getWaitingFor(), OrOptions);
    expect(game.phase).eq(Phase.RESEARCH);
    finalGreeneryPlacement.options[1].cb();
    expect(game.phase).eq(Phase.END);
  });
});
