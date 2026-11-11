import { Card, type CardEdition } from './Card';
import {
  BlueChalkJoker,
  GroselhaJoker,
  BilliardJoker,
  JollyJoker,
  LuckyEightJoker,
  TelescopeJoker,
  GoldenPocketJoker,
  BaronJoker,
  DuetJoker,
  BullJoker,
  SolidSteelJoker,
  BurningStripesJoker,
  WizardCueJoker,
  GoldDiggerJoker,
} from './JokerCards';
import {
  EmpressTarot,
  MagicianTarot,
  ChariotTarot,
  FuzzyTarot,
  HermitTarot,
  FoolTarot,
  WheelOfFortuneTarot,
} from './TarotCards';

export class CardCatalog {
    private static jokerConstructors = [
    BlueChalkJoker,
    GroselhaJoker,
    BilliardJoker,
    JollyJoker,
    LuckyEightJoker,
    TelescopeJoker,
    GoldenPocketJoker,
    BaronJoker,
    DuetJoker,
    BullJoker,
    SolidSteelJoker,
    BurningStripesJoker,
    WizardCueJoker,
    GoldDiggerJoker,
  ];

    private static tarotConstructors = [
    EmpressTarot,
    MagicianTarot,
    ChariotTarot,
    FuzzyTarot,
    HermitTarot,
    FoolTarot,
    WheelOfFortuneTarot,
  ];

  static getRandomEdition(): CardEdition {
    const roll = Math.random();
    if (roll < 0.85) return 'Base';
    if (roll < 0.94) return 'Foil';
    if (roll < 0.98) return 'Holográfico';
    return 'Policromático';
  }

  static createRandomJoker(): Card {
    const idx = Math.floor(Math.random() * this.jokerConstructors.length);
    const Ctor = this.jokerConstructors[idx];
    const edition = this.getRandomEdition();
    return new Ctor(edition);
  }

  static createRandomTarot(): Card {
    const idx = Math.floor(Math.random() * this.tarotConstructors.length);
    const Ctor = this.tarotConstructors[idx];
    return new Ctor('Base');
  }

  static generateShopOffers(count: number = 3): Card[] {
    const offers: Card[] = [];
    for (let i = 0; i < count; i++) {
            if (Math.random() < 0.75) {
        offers.push(this.createRandomJoker());
      } else {
        offers.push(this.createRandomTarot());
      }
    }
    return offers;
  }
}
