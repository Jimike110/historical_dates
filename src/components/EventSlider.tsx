import React, { useRef, useLayoutEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { type Swiper as SwiperCore } from 'swiper';

import 'swiper/scss';

import { TimelineData } from '../types/types';
import styles from './EventsSlider.module.scss';
import { gsap } from 'gsap';

interface EventsSliderProps {
  activeTimeline: TimelineData;
  timelines: TimelineData[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
}

const EventsSlider: React.FC<EventsSliderProps> = ({
  activeTimeline,
  timelines,
  activeIndex,
  setActiveIndex,
}) => {
  const swiperRef = useRef<{ swiper: SwiperCore }>(null);
  const isInitialRender = useRef(true);

  useLayoutEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    const swiperWrapper = swiperRef.current?.swiper.wrapperEl;
    if (!swiperWrapper) return;

    gsap
      .timeline()
      .to(swiperWrapper, { opacity: 0, duration: 0.3, ease: 'power1.in' })
      .call(() => {
        swiperRef.current?.swiper.slideTo(0, 0);
      })
      .to(swiperWrapper, { opacity: 1, duration: 0.4, ease: 'power1.out' });
  }, [activeTimeline]);

  const handleProgress = (swiper: SwiperCore) => {
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

  return (
    <>
      <h3 className={styles.timelineTitle}>{activeTimeline.title}</h3>
      <div className={styles.eventsSliderContainer}>
        <Swiper
          ref={swiperRef}
          spaceBetween={25}
          slidesPerView={'auto'}
          className={styles.swiper}
          watchSlidesProgress={true}
          speed={500}
          onProgress={handleProgress}
          onSlideChange={handleProgress}
          onTransitionEnd={handleProgress}
          onResize={handleProgress}
          onSetTransition={handleSetTransition}
          onInit={handleProgress}
        >
          {activeTimeline.events.map((event) => (
            <SwiperSlide key={event.id} className={styles.swiperSlide}>
              <h3 className={styles.slideYear}>{event.year}</h3>
              <p className={styles.slideDescription}>{event.description}</p>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className={styles.customPagination}>
          {timelines.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`${styles.dot} ${index === activeIndex ? styles.activeDot : ''}`}
            />
          ))}
        </div>
      </div>
    </>
  );
};
export default EventsSlider;
