import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { timelines } from './data/timelineData';
import { gsap } from 'gsap';

import EventsSlider from './components/EventsSlider';
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
  const eventsWrapperRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (prevIndex === undefined) {
      gsap.set(circleRef.current, { rotation: 0 });
      gsap.set(gsap.utils.toArray(`.${styles.dotContent}`), { rotation: 0 });
      return;
    }

    const prevTimeline = timelines[prevIndex];
    if (!prevTimeline) return;

    if (startYearRef.current)
      startYearRef.current.innerText = String(prevTimeline.startYear);
    if (endYearRef.current)
      endYearRef.current.innerText = String(prevTimeline.endYear);

    const yearProxy = {
      start: prevTimeline.startYear,
      end: prevTimeline.endYear,
    };

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

    const tl = gsap.timeline();

    tl.to(eventsWrapperRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: 'power1.inOut',
    });

    tl.to(circleRef.current, {
      rotation: finalRotation,
      duration: 0.8,
      ease: 'power2.inOut',
    })
      .to(
        gsap.utils.toArray(`.${styles.dotContent}`),
        {
          rotation: -finalRotation,
          duration: 0.8,
          ease: 'power2.inOut',
        },
        '<'
      )

      .fromTo(
        yearProxy,
        {
          start: prevTimeline.startYear,
          end: prevTimeline.endYear,
        },
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

    tl.to(eventsWrapperRef.current, {
      opacity: 1,
      duration: 0.4,
      ease: 'power1.inOut',
    });
  }, [activeIndex, prevIndex, activeTimeline, timelines.length]);

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
          <EventsSlider
            activeTimeline={activeTimeline}
            timelines={timelines}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
            eventsWrapperRef={eventsWrapperRef}
          />
        </div>
      </div>
    </main>
  );
};

export default App;
