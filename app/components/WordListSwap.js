"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

export default function WordListSwap({
  texts = [],
  items = [], // New prop for items with text and icon
  mainClassName = "",
  staggerFrom = "last",
  initial = { y: "100%" },
  animate = { y: 0 },
  exit = { y: "-120%" },
  staggerDuration = 0.025,
  splitLevelClassName = "",
  transition = { type: "spring", damping: 30, stiffness: 400 },
  rotationInterval = 2000,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Use items if provided, otherwise fall back to texts
  const dataToUse = items.length > 0 ? items : texts.map(text => ({ text, icon: null }));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % dataToUse.length);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [dataToUse.length, rotationInterval]);

  const currentItem = dataToUse[currentIndex];
  const currentText = currentItem.text || currentItem;
  const CurrentIcon = currentItem.icon;

  // Split text into words, each word contains array of characters
  const words = useMemo(() => {
    if (!currentText) return [];
    const textWords = currentText.split(" ");
    return textWords.map((word, index) => ({
      characters: word.split(""),
      needsSpace: index !== textWords.length - 1,
    }));
  }, [currentText]);

  // Calculate total characters for stagger delay
  const totalCharacters = useMemo(() => {
    return words.reduce((sum, word) => sum + word.characters.length, 0);
  }, [words]);

  return (
    <span className={mainClassName}>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          className="inline-flex flex-wrap items-center gap-3"
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {words.map((word, wordIndex) => {
            // Calculate how many characters came before this word
            const previousCharsCount = words
              .slice(0, wordIndex)
              .reduce((sum, w) => sum + w.characters.length, 0);

            return (
              <span
                key={`${wordIndex}-${word.characters.join("")}`}
                className={`inline-flex ${splitLevelClassName}`}
              >
                {word.characters.map((char, charIndex) => {
                  const globalCharIndex = previousCharsCount + charIndex;
                  const delay =
                    staggerFrom === "last"
                      ? (totalCharacters - 1 - globalCharIndex) * staggerDuration
                      : globalCharIndex * staggerDuration;

                  return (
                    <motion.span
                      key={`${charIndex}-${char}`}
                      className="inline-block"
                      initial={initial}
                      animate={animate}
                      exit={exit}
                      transition={{
                        ...transition,
                        delay,
                      }}
                    >
                      {char}
                    </motion.span>
                  );
                })}
                {word.needsSpace && <span className="whitespace-pre"> </span>}
              </span>
            );
          })}
          {CurrentIcon && (
            <motion.span
              className="inline-block"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{
                type: "spring",
                damping: 20,
                stiffness: 300,
              }}
            >
              <CurrentIcon className="w-14 h-14" />
            </motion.span>
          )}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
