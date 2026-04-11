import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import { cn } from "../../lib/utils";
import { Card, CardContent } from "./card";
import { Calendar } from "lucide-react";

const DEFAULT_EVENTS = [
  {
    year: "2023",
    title: "Major Achievement",
    subtitle: "Organization Name",
    description:
      "Description of the achievement or milestone reached during this time period.",
  },
  {
    year: "2022",
    title: "Important Milestone",
    subtitle: "Organization Name",
    description: "Details about this significant milestone and its impact.",
  },
  {
    year: "2021",
    title: "Key Event",
    subtitle: "Organization Name",
    description: "Information about this key event in the timeline.",
  },
];

export const ScrollTimeline = ({
  events = DEFAULT_EVENTS,
  title = "Timeline",
  subtitle = "Scroll to explore the journey",
  animationOrder = "sequential",
  cardAlignment = "alternating",
  lineColor = "bg-primary/30",
  activeColor = "bg-primary",
  progressIndicator = true,
  cardVariant = "default",
  cardEffect = "none",
  parallaxIntensity = 0.2,
  progressLineWidth = 2,
  progressLineCap = "round",
  dateFormat = "badge",
  revealAnimation = "fade",
  className = "",
  connectorStyle = "line",
  perspective = false,
  darkMode = false,
  smoothScroll = true,
}) => {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const timelineRefs = useRef([]);

  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const progressHeight = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((value) => {
      const newIndex = Math.floor(value * events.length);
      if (
        newIndex !== activeIndex &&
        newIndex >= 0 &&
        newIndex < events.length
      ) {
        setActiveIndex(newIndex);
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress, events.length, activeIndex]);

  const getCardVariants = (index) => {
    const baseDelay =
      animationOrder === "simultaneous"
        ? 0
        : animationOrder === "staggered"
        ? index * 0.2
        : index * 0.3;

    const initialStates = {
      fade: { opacity: 0, y: 20 },
      slide: {
        x:
          cardAlignment === "left"
            ? -100
            : cardAlignment === "right"
            ? 100
            : index % 2 === 0
            ? -100
            : 100,
        opacity: 0,
      },
      scale: { scale: 0.8, opacity: 0 },
      flip: { rotateY: 90, opacity: 0 },
      none: { opacity: 1 },
    };

    return {
      initial: initialStates[revealAnimation],
      whileInView: {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        rotateY: 0,
        transition: {
          duration: 0.7,
          delay: baseDelay,
          ease: [0.25, 0.1, 0.25, 1.0],
        },
      },
      viewport: { once: false, margin: "-100px" },
    };
  };

  const getConnectorClasses = () => {
    const baseClasses = cn(
      "absolute left-1/2 transform -translate-x-1/2",
      lineColor
    );
    const widthStyle = `w-[${progressLineWidth}px]`;
    switch (connectorStyle) {
      case "dots":
        return cn(baseClasses, "w-1 rounded-full");
      case "dashed":
        return cn(
          baseClasses,
          widthStyle,
          `[mask-image:linear-gradient(to_bottom,black_33%,transparent_33%,transparent_66%,black_66%)] [mask-size:1px_12px]`
        );
      case "line":
      default:
        return cn(baseClasses, widthStyle);
    }
  };

  const getCardClasses = (index) => {
    const baseClasses = "relative z-30 rounded-lg transition-all duration-300";
    const variantClasses = {
      default: darkMode 
        ? "bg-white/10 backdrop-blur-xl border border-white/20 shadow-sm" 
        : "bg-white border border-gray-200 shadow-sm",
      elevated: darkMode
        ? "bg-white/10 backdrop-blur-xl border border-white/20 shadow-md hover:shadow-cyan-500/20"
        : "bg-white border border-gray-200 shadow-md hover:shadow-cyan-300/30",
      outlined: darkMode
        ? "bg-white/5 backdrop-blur border-2 border-cyan-500/30"
        : "bg-white/50 backdrop-blur border-2 border-cyan-400/30",
      filled: darkMode
        ? "bg-cyan-500/10 border border-cyan-500/30"
        : "bg-cyan-100/50 border border-cyan-300",
    };
    const effectClasses = {
      none: "",
      glow: darkMode 
        ? "hover:shadow-[0_0_15px_rgba(34,211,238,0.5)]" 
        : "hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]",
      shadow: darkMode
        ? "hover:shadow-lg hover:shadow-cyan-500/30 hover:-translate-y-1"
        : "hover:shadow-lg hover:shadow-cyan-300/40 hover:-translate-y-1",
      bounce: "hover:scale-[1.03] hover:shadow-md active:scale-[0.97]",
    };
    const alignmentClassesDesktop =
      cardAlignment === "alternating"
        ? index % 2 === 0
          ? "lg:mr-[calc(50%+20px)]"
          : "lg:ml-[calc(50%+20px)]"
        : cardAlignment === "left"
        ? "lg:mr-auto lg:ml-0"
        : "lg:ml-auto lg:mr-0";

    return cn(
      baseClasses,
      variantClasses[cardVariant],
      effectClasses[cardEffect],
      alignmentClassesDesktop,
      "w-full lg:w-[calc(50%-40px)]"
    );
  };

  return (
    <div
      ref={scrollRef}
      className={cn(
        "relative min-h-screen w-full overflow-hidden",
        className
      )}
    >
      <div className="text-center py-10 px-4">
        <h2 className={cn(
          "text-2xl md:text-4xl font-bold mb-3",
          darkMode ? "text-white" : "text-gray-900"
        )}>
          {title}
        </h2>
        <p className={cn(
          "text-sm md:text-base max-w-2xl mx-auto",
          darkMode ? "text-gray-400" : "text-gray-600"
        )}>
          {subtitle}
        </p>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 pb-16">
        <div className="relative mx-auto">
          <div
            className={cn(getConnectorClasses(), "h-full absolute top-0 z-10")}
          ></div>

          {progressIndicator && (
            <>
              <motion.div
                className="absolute top-0 z-10"
                style={{
                  height: progressHeight,
                  width: progressLineWidth,
                  left: "50%",
                  transform: "translateX(-50%)",
                  borderRadius:
                    progressLineCap === "round" ? "9999px" : "0px",
                  background: `linear-gradient(to bottom, #22d3ee, #6366f1, #a855f7)`,
                  boxShadow: `
                    0 0 15px rgba(99,102,241,0.5),
                    0 0 25px rgba(168,85,247,0.3)
                  `,
                }}
              />
              <motion.div
                className="absolute z-20"
                style={{
                  top: progressHeight,
                  left: "50%",
                  translateX: "-50%",
                  translateY: "-50%",
                }}
              >
                <motion.div
                  className="w-5 h-5 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(168,85,247,0.8) 0%, rgba(99,102,241,0.5) 40%, rgba(34,211,238,0) 70%)",
                    boxShadow: `
                      0 0 15px 4px rgba(168, 85, 247, 0.6),
                      0 0 25px 8px rgba(99, 102, 241, 0.4),
                      0 0 40px 15px rgba(34, 211, 238, 0.2)
                    `,
                  }}
                  animate={{
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            </>
          )}

          <div className="relative z-20">
            {events.map((event, index) => {
              const yOffset = useTransform(
                smoothProgress,
                [0, 1],
                [parallaxIntensity * 100, -parallaxIntensity * 100]
              );
              return (
                <div
                  key={event.id || index}
                  ref={(element) => {
                    timelineRefs.current[index] = element;
                  }}
                  className={cn(
                    "relative flex items-center mb-12 py-3",
                    "flex-col lg:flex-row",
                    cardAlignment === "alternating"
                      ? index % 2 === 0
                        ? "lg:justify-start"
                        : "lg:flex-row-reverse lg:justify-start"
                      : cardAlignment === "left"
                      ? "lg:justify-start"
                      : "lg:flex-row-reverse lg:justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-1/2 transform -translate-y-1/2 z-30",
                      "left-1/2 -translate-x-1/2"
                    )}
                  >
                    <motion.div
                      className={cn(
                        "w-6 h-6 rounded-full border-4 flex items-center justify-center",
                        darkMode 
                          ? index <= activeIndex
                            ? "border-cyan-400 bg-slate-950 shadow-cyan-400/50"
                            : "border-white/30 bg-slate-950"
                          : index <= activeIndex
                          ? "border-cyan-500 bg-white shadow-cyan-500/50"
                          : "border-gray-300 bg-white"
                      )}
                      animate={
                        index <= activeIndex
                          ? {
                              scale: [1, 1.3, 1],
                              boxShadow: darkMode
                                ? [
                                    "0 0 0px rgba(34,211,238,0)",
                                    "0 0 12px rgba(34,211,238,0.6)",
                                    "0 0 0px rgba(34,211,238,0)",
                                  ]
                                : [
                                    "0 0 0px rgba(6,182,212,0)",
                                    "0 0 12px rgba(6,182,212,0.6)",
                                    "0 0 0px rgba(6,182,212,0)",
                                  ],
                            }
                          : {}
                      }
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        repeatDelay: 4,
                        ease: "easeInOut",
                      }}
                    />
                  </div>
                  <motion.div
                    className={cn(
                      getCardClasses(index),
                      "mt-12 lg:mt-0"
                    )}
                    variants={getCardVariants(index)}
                    initial="initial"
                    whileInView="whileInView"
                    viewport={{ once: false, margin: "-100px" }}
                    style={parallaxIntensity > 0 ? { y: yOffset } : undefined}
                  >
                    <Card className={cn(
                      "bg-transparent border-0",
                      darkMode ? "text-white" : "text-gray-900"
                    )}>
                      <CardContent className="p-4 md:p-6">
                        {dateFormat === "badge" ? (
                          <div className="flex items-center mb-4">
                            <div className={cn(
                              "transform transition-all duration-300",
                              darkMode ? "text-cyan-400" : "text-cyan-600"
                            )}>
                              {event.icon || (
                                <Calendar style={{ width: 'clamp(1.5rem, 2.5vw, 2.5rem)', height: 'clamp(1.5rem, 2.5vw, 2.5rem)' }} className="mr-2" />
                              )}
                            </div>
                            <span
                              style={{ fontSize: 'clamp(1rem, 1.8vw, 1.5rem)' }}
                              className={cn(
                                "font-bold ml-2",
                                darkMode ? "text-cyan-300" : "text-cyan-600"
                              )}
                            >
                              {event.year}
                            </span>
                          </div>
                        ) : (
                          <p style={{ fontSize: 'clamp(1rem, 1.8vw, 1.5rem)' }} className={cn(
                            "font-bold mb-2",
                            darkMode ? "text-cyan-300" : "text-cyan-600"
                          )}>
                            {event.year}
                          </p>
                        )}
                        <h3 style={{ fontSize: 'clamp(1.1rem, 2vw, 1.75rem)' }} className={cn(
                          "font-bold mb-2",
                          darkMode ? "text-white" : "text-gray-900"
                        )}>
                          {event.title}
                        </h3>
                        {event.subtitle && (
                          <p style={{ fontSize: 'clamp(0.85rem, 1.3vw, 1.1rem)' }} className={cn(
                            "font-medium mb-2",
                            darkMode ? "text-gray-400" : "text-gray-600"
                          )}>
                            {event.subtitle}
                          </p>
                        )}
                        <p style={{ fontSize: 'clamp(0.8rem, 1.2vw, 1rem)' }} className={cn(
                          "leading-relaxed",
                          darkMode ? "text-gray-400" : "text-gray-600"
                        )}>
                          {event.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
