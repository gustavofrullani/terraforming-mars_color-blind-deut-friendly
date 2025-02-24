import {CardName} from '../../../common/cards/CardName';
import {Player} from '../../Player';
import {PlayerInput} from '../../PlayerInput';
import {CardRenderer} from '../render/CardRenderer';
import {CeoCard} from './CeoCard';

import {Turmoil} from '../../turmoil/Turmoil';

export class Oscar extends CeoCard {
  constructor() {
    super({
      name: CardName.OSCAR,
      metadata: {
        cardNumber: 'L15',
        renderData: CardRenderer.builder((b) => {
          b.plus().influence();
          b.br.br;
          b.opgArrow().chairman();
        }),
        description: 'You have +1 influence. Once per game, replace the Chairman with one of your delegates.',
      },
    });
  }

  public override play(player: Player) {
    const turmoil = player.game.turmoil;
    if (turmoil) turmoil.addInfluenceBonus(player);
    return undefined;
  }

  public override canAct(player: Player): boolean {
    if (!super.canAct(player)) {
      return false;
    }
    const turmoil = Turmoil.getTurmoil(player.game);
    return turmoil.hasDelegatesInReserve(player.id) && turmoil.chairman !== player.id;
  }

  public action(player: Player): PlayerInput | undefined {
    const turmoil = Turmoil.getTurmoil(player.game);
    turmoil.setNewChairman(player.id, player.game, /* setAgenda*/false, /* gainTR*/false);

    // Increase totalDelegatesPlaced manually since we're not using SendDeletageToArea()
    // If we dont do this player will not get the bonus for POLITICAN Awards
    player.totalDelegatesPlaced += 1;
    this.isDisabled = true;
    return undefined;
  }
}
