import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { timelines } from './data/timelineData';
import { gsap } from 'gsap';

import EventsSlider from './components/EventSlider';
import CircleNav from './components/CircleNav';
import TimelineControls from './components/TimelineControls';
import './assets/styles/main.scss';
import styles from './components/CircleNav.module.scss';

function usePrevious(value: number) {
  const ref = useRef<number>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const App: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const activeTimeline = timelines[activeIndex];
  const prevIndex = usePrevious(activeIndex);

  const startYearRef = useRef<HTMLSpanElement>(null);
  const endYearRef = useRef<HTMLSpanElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (prevIndex === undefined) {
      gsap.set(circleRef.current, { rotation: 0 });
      gsap.set(gsap.utils.toArray(`.${styles.dotContent}`), { rotation: 0 });
      return;
    }

    const prevTimeline = timelines[prevIndex];
    if (!prevTimeline) return;

    const totalItems = timelines.length;
    const currentRotation = gsap.getProperty(
      circleRef.current,
      'rotation'
    ) as number;
    const targetAngle = -(activeIndex / totalItems) * 360;

    let rotationChange = targetAngle - currentRotation;
    if (rotationChange > 180) rotationChange -= 360;
    if (rotationChange < -180) rotationChange += 360;
    const finalRotation = currentRotation + rotationChange;

    const yearProxy = {
      start: prevTimeline.startYear,
      end: prevTimeline.endYear,
    };

    gsap
      .timeline()
      // 1. Animate the main circle to its final rotation
      .to(circleRef.current, {
        rotation: finalRotation,
        duration: 0.8,
        ease: 'power2.inOut',
      })
      // 2. Animate ALL dot contents to the NEGATIVE of the circle's FINAL rotation
      .to(
        gsap.utils.toArray(`.${styles.dotContent}`),
        {
          rotation: -finalRotation,
          duration: 0.8,
          ease: 'power2.inOut',
        },
        '<'
      )
      .to(
        yearProxy,
        {
          start: activeTimeline.startYear,
          end: activeTimeline.endYear,
          duration: 0.8,
          ease: 'sine.inOut',
          onUpdate: () => {
            if (startYearRef.current) {
              startYearRef.current.innerText = String(
                Math.round(yearProxy.start)
              );
            }
            if (endYearRef.current) {
              endYearRef.current.innerText = String(Math.round(yearProxy.end));
            }
          },
        },
        '<'
      );
  }, [activeIndex, prevIndex, activeTimeline]);

  return (
    <main className="historical-timeline">
      <div className="historical-timeline__container">
        <h1 className="historical-timeline__title">
          Исторические
          <br /> даты
        </h1>

        <CircleNav
          timelines={timelines}
          activeIndex={activeIndex}
          onSelect={setActiveIndex}
          circleRef={circleRef}
        />

        <div className="historical-timeline__display">
          <span
            ref={startYearRef}
            className="historical-timeline__year historical-timeline__year--start"
          >
            {activeTimeline.startYear}
          </span>
          <span
            ref={endYearRef}
            className="historical-timeline__year historical-timeline__year--end"
          >
            {activeTimeline.endYear}
          </span>
        </div>

        <div className="historical-timeline__bottom-section">
          <EventsSlider
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
            activeTimeline={activeTimeline}
            timelines={timelines}
          />
          <TimelineControls
            activeIndex={activeIndex}
            total={timelines.length}
            onPrev={() =>
              setActiveIndex(
                (prev) => (prev - 1 + timelines.length) % timelines.length
              )
            }
            onNext={() =>
              setActiveIndex((prev) => (prev + 1) % timelines.length)
            }
          />
        </div>
      </div>
    </main>
  );
};

export default App;
