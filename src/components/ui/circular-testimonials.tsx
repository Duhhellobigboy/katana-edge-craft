import { useCallback, useEffect, useRef, useState } from "react";

export type Testimonial = {
  quote: string;
  name: string;
  designation: string;
  src: string;
};

type Colors = {
  name: string;
  designation: string;
  testimony: string;
  arrowBackground: string;
  arrowForeground: string;
  arrowHoverBackground: string;
};

type FontSizes = {
  name: string;
  designation: string;
  quote: string;
};

export type CircularTestimonialsProps = {
  testimonials: Testimonial[];
  autoplay?: boolean;
  colors?: Partial<Colors>;
  fontSizes?: Partial<FontSizes>;
};

const defaultColors: Colors = {
  name: "#0a0a0a",
  designation: "#454545",
  testimony: "#171717",
  arrowBackground: "#141414",
  arrowForeground: "#f1f1f7",
  arrowHoverBackground: "#00A6FB",
};

const defaultFontSizes: FontSizes = {
  name: "28px",
  designation: "20px",
  quote: "20px",
};

function calculateGap(width: number) {
  const minWidth = 1024;
  const maxWidth = 1456;
  const minGap = 60;
  const maxGap = 86;
  if (width <= minWidth) return minGap;
  if (width >= maxWidth) return Math.max(minGap, maxGap + 0.06018 * (width - maxWidth));
  return minGap + (maxGap - minGap) * ((width - minWidth) / (maxWidth - minWidth));
}

function getImageStyle(
  index: number,
  activeIndex: number,
  len: number,
  gap: number,
  maxStickUp: number,
): React.CSSProperties {
  const isActive = index === activeIndex;
  const isLeft = (activeIndex - 1 + len) % len === index;
  const isRight = (activeIndex + 1) % len === index;

  if (isActive) {
    return {
      zIndex: 3,
      opacity: 1,
      pointerEvents: "auto",
      transform: "translateX(0px) translateY(0px) scale(1) rotateY(0deg)",
    };
  }
  if (isLeft) {
    return {
      zIndex: 2,
      opacity: 1,
      pointerEvents: "auto",
      transform: `translateX(-${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(15deg)`,
    };
  }
  if (isRight) {
    return {
      zIndex: 2,
      opacity: 1,
      pointerEvents: "auto",
      transform: `translateX(${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(-15deg)`,
    };
  }
  return { zIndex: 1, opacity: 0, pointerEvents: "none" };
}

function AnimatedQuote({
  quote,
  color,
  fontSize,
  animateKey,
}: {
  quote: string;
  color: string;
  fontSize: string;
  animateKey: number;
}) {
  const [words, setWords] = useState<string[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setWords(quote.split(" "));
    setVisible(false);
    const t = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    return () => cancelAnimationFrame(t);
  }, [quote, animateKey]);

  return (
    <p className="mb-8 leading-[1.75]" style={{ color, fontSize }}>
      {words.map((word, i) => (
        <span
          key={`${animateKey}-${i}-${word}`}
          className="inline-block transition-none"
          style={{
            opacity: visible ? 1 : 0,
            filter: visible ? "blur(0)" : "blur(10px)",
            transform: visible ? "translateY(0)" : "translateY(5px)",
            transition: `opacity 0.22s ease-in-out ${i * 0.02}s, filter 0.22s ease-in-out ${i * 0.02}s, transform 0.22s ease-in-out ${i * 0.02}s`,
          }}
        >
          {word}
          {i < words.length - 1 ? "\u00a0" : ""}
        </span>
      ))}
    </p>
  );
}

export function CircularTestimonials({
  testimonials,
  autoplay = true,
  colors: colorsProp,
  fontSizes: fontSizesProp,
}: CircularTestimonialsProps) {
  const colors = { ...defaultColors, ...colorsProp };
  const fontSizes = { ...defaultFontSizes, ...fontSizesProp };
  const [activeIndex, setActiveIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [arrowHover, setArrowHover] = useState<"prev" | "next" | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [userInteractedAt, setUserInteractedAt] = useState<number>(0);

  const len = testimonials.length;
  const gap = calculateGap(containerWidth || 1024);
  const maxStickUp = gap * 0.8;

  const measure = useCallback(() => {
    if (imageContainerRef.current) {
      setContainerWidth(imageContainerRef.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const goTo = useCallback(
    (index: number) => {
      setUserInteractedAt(Date.now());
      setActiveIndex(((index % len) + len) % len);
    },
    [len],
  );

  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [next, prev]);

  useEffect(() => {
    if (!autoplay || len <= 1) return;

    if (userInteractedAt > 0) {
      const timeoutId = setTimeout(() => {
        setUserInteractedAt(0);
      }, 7000);
      return () => clearTimeout(timeoutId);
    }

    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % len);
    }, 5000);
    return () => clearInterval(id);
  }, [autoplay, len, userInteractedAt]);

  return (
    <div className="w-full p-4 md:p-8">
      <div className="grid gap-8 md:grid-cols-2 md:gap-20">
        <div
          ref={imageContainerRef}
          className="relative h-72 w-full md:h-96"
          style={{ perspective: "1000px" }}
        >
          {testimonials.map((t, index) => (
            <img
              key={t.name}
              src={t.src}
              alt={t.name}
              className="absolute h-full w-full rounded-3xl object-cover shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition-all duration-[800ms] ease-[cubic-bezier(0.4,2,0.3,1)]"
              style={getImageStyle(index, activeIndex, len, gap, maxStickUp)}
            />
          ))}
        </div>

        <div className="flex flex-col justify-between">
          <div className="min-h-[250px] max-md:min-h-0">
            {testimonials.map((t, index) =>
              index === activeIndex ? (
                <div key={t.name}>
                  <h3
                    className="mb-1 font-bold"
                    style={{ color: colors.name, fontSize: fontSizes.name }}
                  >
                    {t.name}
                  </h3>
                  <p
                    className="mb-8"
                    style={{ color: colors.designation, fontSize: fontSizes.designation }}
                  >
                    {t.designation}
                  </p>
                  <AnimatedQuote
                    quote={t.quote}
                    color={colors.testimony}
                    fontSize={fontSizes.quote}
                    animateKey={activeIndex}
                  />
                </div>
              ) : null,
            )}
          </div>

          <div className="flex gap-6 pt-12 md:pt-0">
            <button
              type="button"
              aria-label="Previous testimonial"
              className="flex size-[2.7rem] shrink-0 cursor-pointer items-center justify-center rounded-full border-0 transition-[background-color,transform] duration-200 hover:scale-105"
              style={{
                backgroundColor: arrowHover === "prev" ? colors.arrowHoverBackground : colors.arrowBackground,
              }}
              onClick={prev}
              onMouseEnter={() => setArrowHover("prev")}
              onMouseLeave={() => setArrowHover(null)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="size-5 transition-transform duration-300"
                style={{ fill: colors.arrowForeground }}
              >
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next testimonial"
              className="flex size-[2.7rem] shrink-0 cursor-pointer items-center justify-center rounded-full border-0 transition-[background-color,transform] duration-200 hover:scale-105"
              style={{
                backgroundColor: arrowHover === "next" ? colors.arrowHoverBackground : colors.arrowBackground,
              }}
              onClick={next}
              onMouseEnter={() => setArrowHover("next")}
              onMouseLeave={() => setArrowHover(null)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="size-5 transition-transform duration-300"
                style={{ fill: colors.arrowForeground }}
              >
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
