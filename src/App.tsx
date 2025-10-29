import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { timelines } from './data/timelineData';
import { gsap } from 'gsap';

import EventsSlider from './components/EventsSlider';
import CircleNav from './components/CircleNav';
import TimelineControls from './components/TimelineControls';
import './assets/styles/main.scss';
import styles from './components/CircleNav.module.scss';
import { Analytics } from '@vercel/analytics/next';

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

  const handleTimelineChange = (newIndex: number) => {
    const wrapper = eventsWrapperRef.current;
    if (!wrapper || newIndex === activeIndex) return;

    gsap.to(wrapper, {
      opacity: 0,
      duration: 0.4,
      ease: 'power1.inOut',
      onComplete: () => setActiveIndex(newIndex),
    });
  };

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

    const tl = gsap.timeline({ defaults: { ease: 'power1.inOut' } });

    // fade out old events as rotation starts
    tl.to(
      eventsWrapperRef.current,
      {
        opacity: 0,
        duration: 0.4,
      },
      0
    );

    // rotate circle and dots
    tl.to(
      circleRef.current,
      {
        rotation: finalRotation,
        duration: 0.8,
      },
      0
    )
      .to(
        gsap.utils.toArray(`.${styles.dotContent}`),
        {
          rotation: -finalRotation,
          duration: 0.8,
        },
        '<'
      )

      // roll the years
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
            if (startYearRef.current)
              startYearRef.current.innerText = String(
                Math.round(yearProxy.start)
              );
            if (endYearRef.current)
              endYearRef.current.innerText = String(Math.round(yearProxy.end));
          },
        },
        '<'
      );

    // At the midpoint (after fade-out), React updates to the new timeline
    // This ensures that EventsSlider rerenders new content before fade-in starts.
    tl.add(() => {
      // Force the new data render just in time
      const wrapper = eventsWrapperRef.current;
      if (wrapper) wrapper.style.opacity = '0'; // keep hidden until fade-in
    });

    // fade in new events after rotation finishes
    tl.to(eventsWrapperRef.current, {
      opacity: 1,
      duration: 0.5,
      ease: 'power1.out',
    });
  }, [activeIndex, prevIndex, activeTimeline]);

  return (
    <main className="historical-timeline">
      <Analytics />
      <div className="historical-timeline__container">
        <h1 className="historical-timeline__title">
          Исторические
          <br /> даты
        </h1>

        <CircleNav
          timelines={timelines}
          activeIndex={activeIndex}
          onSelect={(index) => handleTimelineChange(index)}
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
              handleTimelineChange(
                (activeIndex - 1 + timelines.length) % timelines.length
              )
            }
            onNext={() =>
              handleTimelineChange((activeIndex + 1) % timelines.length)
            }
          />
          <EventsSlider
            activeTimeline={activeTimeline}
            timelines={timelines}
            activeIndex={activeIndex}
            handleTimelineChange={handleTimelineChange}
            eventsWrapperRef={eventsWrapperRef}
          />
        </div>
      </div>
    </main>
  );
};

export default App;
