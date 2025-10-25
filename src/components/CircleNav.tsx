import React from 'react';
import { TimelineData } from '../types/types';
import styles from './CircleNav.module.scss';
interface CircleNavProps {
  timelines: TimelineData[];
  activeIndex: number;
  onSelect: (index: number) => void;
  circleRef: React.RefObject<HTMLDivElement>;
}
const CircleNav: React.FC<CircleNavProps> = ({
  timelines,
  activeIndex,
  onSelect,
  circleRef,
}) => {
  const radius = 265;
  const center = 265;
  return (
    <div ref={circleRef} className={styles.circle}>
      {timelines.map((timeline, index) => {
        // Calculate the position of each dot
        const angle =
          (index / timelines.length) * 2 * Math.PI - Math.PI / 2 - 100;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        const isActive = index === activeIndex;

        return (
          <div
            key={timeline.id}
            className={`${styles.dotContainer} ${isActive ? styles.active : ''}`}
            style={{ left: `${x}px`, top: `${y}px` }}
            onClick={() => onSelect(index)}
          >
            <div className={styles.dotContent}>
              <div className={styles.dot}>
                <div className={styles.dotFill}></div>
              </div>
              <span className={styles.dotLabel}>{index + 1}</span>
              {isActive && (
                <span className={styles.dotTitle}>{timeline.title}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default CircleNav;
