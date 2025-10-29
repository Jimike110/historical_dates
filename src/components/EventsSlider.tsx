import React, { useRef, useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { type Swiper as SwiperCore, Navigation } from 'swiper';

import 'swiper/scss';
import 'swiper/scss/navigation';

import { TimelineData } from '../types/types';
import styles from './EventsSlider.module.scss';

interface EventsSliderProps {
  activeTimeline: TimelineData;
  timelines: TimelineData[];
  activeIndex: number;
  handleTimelineChange: (index: number) => void;
  eventsWrapperRef: React.RefObject<HTMLDivElement>;
}

const EventsSlider: React.FC<EventsSliderProps> = ({
  activeTimeline,
  timelines,
  activeIndex,
  handleTimelineChange,
  eventsWrapperRef,
}) => {
  const swiperRef = useRef<{ swiper: SwiperCore }>(null);

  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const navPrevButtonRef = useRef<HTMLButtonElement>(null);
  const navNextButtonRef = useRef<HTMLButtonElement>(null);

  const handleProgress = (swiper?: SwiperCore) => {
    if (!swiper || !swiper.slides) return; // safety check

    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);

    swiper.slides.forEach((slide) => {
      const slideEl = slide as HTMLElement;
      const slideLeft = slideEl.offsetLeft;
      const slideWidth = slideEl.offsetWidth;
      const sliderWidth = swiper.width;
      const slidePosition = slideLeft + swiper.translate;
      const isFullyVisible =
        slidePosition >= -1 && slidePosition + slideWidth <= sliderWidth + 1;
      isFullyVisible
        ? slideEl.classList.add(styles.isFullyVisible)
        : slideEl.classList.remove(styles.isFullyVisible);
    });
  };

  const handleSetTransition = (swiper: SwiperCore, duration: number) => {
    swiper.slides.forEach((slide) => {
      const slideEl = slide as HTMLElement;
      slideEl.style.transitionDuration = `${duration}ms`;
    });
  };

  useEffect(() => {
    const swiperInstance = swiperRef.current?.swiper;
    if (swiperInstance) {
      swiperInstance.update(); // force Swiper to recalc slide positions
      swiperInstance.slideTo(0, 0);

      // Use setTimeout to ensure DOM layout has been applied
      setTimeout(() => handleProgress(swiperInstance), 50);

      setIsBeginning(swiperInstance.isBeginning);
      setIsEnd(swiperInstance.isEnd);
    }
  }, [activeTimeline]);

  return (
    <div ref={eventsWrapperRef}>
      <h3 className={styles.timelineTitle}>{activeTimeline.title}</h3>
      <div className={styles.eventsSliderContainer}>
        <div className={styles.swiperWithNav}>
          <div>
            <Swiper
              ref={swiperRef}
              modules={[Navigation]}
              navigation={{
                // Use the refs to connect the buttons
                nextEl: navNextButtonRef.current,
                prevEl: navPrevButtonRef.current,
              }}
              // This on-the-fly config ensures Swiper re-initializes navigation when refs are ready
              onBeforeInit={(swiper) => {
                if (typeof swiper.params.navigation !== 'boolean') {
                  swiper.params.navigation.prevEl = navPrevButtonRef.current;
                  swiper.params.navigation.nextEl = navNextButtonRef.current;
                }
              }}
              spaceBetween={window.innerWidth >= 1024 ? 80 : 25}
              slidesPerView={'auto'}
              className={styles.swiper}
              watchSlidesProgress={true}
              speed={500}
              onProgress={(swiper) => handleProgress(swiper)}
              onSlideChange={(swiper) => handleProgress(swiper)}
              onTransitionEnd={(swiper) => handleProgress(swiper)}
              onResize={(swiper) => handleProgress(swiper)}
              onPaginationUpdate={(swiper) => handleProgress(swiper)}
              onSwiper={(swiper) => handleProgress(swiper)}
              onFromEdge={() => handleProgress(swiperRef.current?.swiper)}
              onToEdge={() => handleProgress(swiperRef.current?.swiper)}
              onSetTransition={handleSetTransition}
              onInit={(swiper) => handleProgress(swiper)}
              onPaginationRender={(swiper) => handleProgress(swiper)}
            >
              {activeTimeline.events.map((event) => (
                <SwiperSlide key={event.id} className={styles.swiperSlide}>
                  <h3 className={styles.slideYear}>{event.year}</h3>
                  <p className={styles.slideDescription}>{event.description}</p>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          <div className={styles.sliderNav}>
            {/* Attach the refs and use conditional classes for visibility */}
            <button
              ref={navPrevButtonRef}
              className={`${styles.navButton} ${styles.navButtonPrev} ${isBeginning ? styles.navButtonDisabled : ''}`}
              aria-label="Previous event"
            ></button>
            <button
              ref={navNextButtonRef}
              className={`${styles.navButton} ${styles.navButtonNext} ${isEnd ? styles.navButtonDisabled : ''}`}
              aria-label="Next event"
            ></button>
          </div>
        </div>

        <div className={styles.customPagination}>
          {timelines.map((_, index) => (
            <button
              key={index}
              onClick={() => handleTimelineChange(index)}
              className={`${styles.dot} ${index === activeIndex ? styles.activeDot : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
export default EventsSlider;
