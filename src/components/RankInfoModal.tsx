import { useEffect } from 'react';
import { ELO_TIERS, eloTierRange, iconUrl } from './eloTiers';
import styles from './RankInfoModal.module.css';

interface RankInfoModalProps {
  onClose: () => void;
}

export default function RankInfoModal({ onClose }: RankInfoModalProps) {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const tiersHighToLow = ELO_TIERS.map((tier, index) => ({ tier, range: eloTierRange(tier, index) })).reverse();

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.panel} onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Rank Tiers</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <ul className={styles.tierList}>
          {tiersHighToLow.map(({ tier, range }) => (
            <li key={tier.name} className={styles.tierRow}>
              <img className={styles.tierIcon} src={iconUrl(tier.icon)} alt="" />
              <span className={styles.tierName}>{tier.name}</span>
              <span className={styles.tierRange}>{range}</span>
            </li>
          ))}
        </ul>

        <p className={styles.description}>
          Every player starts at 50. Winning raises your rating and losing lowers it. The size of
          the change depends on how surprising the result was: beating a higher-rated opponent
          gains more than beating a lower-rated one, and losing to a stronger player costs less
          than losing to a weaker one. In games with more than two players, a win is compared
          against each opponent individually, so a win in a big free-for-all is worth about the
          same as a win in a 1-on-1, and a loss in a big game costs less than a loss in a 1-on-1.
          Ratings are capped between 1 and 100.
        </p>
      </div>
    </div>
  );
}
