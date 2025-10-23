import React from 'react';
import styles from './TimelineControls.module.scss';

interface TimelineControlsProps {
  activeIndex: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}

const TimelineControls: React.FC<TimelineControlsProps> = ({
  activeIndex,
  total,
  onPrev,
  onNext,
}) => {
  return (
    <div className={styles.controls}>
      <p className={styles.counter}>
        {String(activeIndex + 1).padStart(2, '0')}/
        {String(total).padStart(2, '0')}
      </p>
      <div className={styles.buttons}>
        <button
          className={styles.button}
          disabled={activeIndex === 0}
          onClick={onPrev}
          aria-label="Previous Timeline"
        />
        <button
          disabled={activeIndex === total - 1}
          className={`${styles.button} ${styles.buttonNext}`}
          onClick={onNext}
          aria-label="Next Timeline"
        />
      </div>
    </div>
  );
};
export default TimelineControls;
