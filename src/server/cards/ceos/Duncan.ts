import {CardName} from '../../../common/cards/CardName';
import {Player} from '../../Player';
import {PlayerInput} from '../../PlayerInput';
import {CardRenderer} from '../render/CardRenderer';
import {CeoCard} from './CeoCard';

import {Resources} from '../../../common/Resources';
import {multiplier} from '../Options';


// TODO: Does Duncan trigger Vitor?
export class Duncan extends CeoCard {
  constructor() {
    super({
      name: CardName.DUNCAN,
      metadata: {
        cardNumber: 'L04',
        renderData: CardRenderer.builder((b) => {
          b.opgArrow().vpIcon().asterix().megacredits(4, {multiplier});
          b.br;
        }),
        description: 'Once per game, gain 6-X VP and 4X M€, where X is the current generation number.',
      },
    });
  }

  public generationUsed = -1;

  public action(player: Player): PlayerInput | undefined {
    player.addResource(Resources.MEGACREDITS, 4 * player.game.generation, {log: true});
    this.isDisabled = true;
    this.generationUsed = player.game.generation;
    return undefined;
  }
}
