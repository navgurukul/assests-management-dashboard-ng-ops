'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import './Shuffle.css';

gsap.registerPlugin(useGSAP);

const Shuffle = ({
  text,
  className = '',
  style = {},
  shuffleDirection = 'right',
  duration = 0.35,
  ease = 'power3.out',
  tag = 'p',
  textAlign = 'center',
  onShuffleComplete,
  shuffleTimes = 1,
  animationMode = 'evenodd',
  loop = false,
  loopDelay = 0,
  stagger = 0.03,
  scrambleCharset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  triggerOnHover = true,
  largeChars = [] // Array of characters to make larger
}) => {
  const ref = useRef(null);
  const charsRef = useRef([]);
  const [ready, setReady] = useState(false);
  const tlRef = useRef(null);
  const playingRef = useRef(false);

  const chars = useMemo(() => text.split(''), [text]);

  // Find indices of first occurrence of each large char in each word
  const largeCharIndices = useMemo(() => {
    const indices = new Set();
    const words = text.split(' ');
    let currentIndex = 0;
    
    words.forEach((word) => {
      if (word.length > 0) {
        const firstChar = word[0].toUpperCase();
        if (largeChars.includes(firstChar)) {
          indices.add(currentIndex);
        }
      }
      currentIndex += word.length + 1; // +1 for space
    });
    
    return indices;
  }, [text, largeChars]);

  useEffect(() => {
    setReady(true);
  }, []);

  useGSAP(
    () => {
      if (!ref.current || !ready) return;

      const playAnimation = () => {
        if (playingRef.current) return;
        playingRef.current = true;

        const charElements = charsRef.current.filter(Boolean);
        if (!charElements.length) return;

        if (tlRef.current) {
          tlRef.current.kill();
        }

        const tl = gsap.timeline({
          onComplete: () => {
            playingRef.current = false;
            onShuffleComplete?.();
            if (loop) {
              gsap.delayedCall(loopDelay, playAnimation);
            }
          }
        });

        charElements.forEach((charEl, i) => {
          const originalChar = chars[i];
          const rolls = Math.max(1, Math.floor(shuffleTimes));
          
          // Create scramble effect
          const scrambleTimeline = gsap.timeline();
          
          for (let r = 0; r < rolls; r++) {
            scrambleTimeline.to(charEl, {
              duration: duration / (rolls + 1),
              ease: 'none',
              onStart: () => {
                if (originalChar !== ' ') {
                  charEl.textContent = scrambleCharset.charAt(
                    Math.floor(Math.random() * scrambleCharset.length)
                  );
                }
              }
            });
          }
          
          // Final reveal
          scrambleTimeline.to(charEl, {
            duration: duration / (rolls + 1),
            ease,
            onStart: () => {
              charEl.textContent = originalChar;
            }
          });

          const delay = animationMode === 'evenodd' 
            ? (i % 2 === 0 ? i * stagger : i * stagger + duration * 0.3)
            : i * stagger;

          tl.add(scrambleTimeline, delay);
        });

        tlRef.current = tl;
      };

      // Initial animation
      playAnimation();

      // Hover handler
      if (triggerOnHover) {
        const handleHover = () => {
          if (!playingRef.current) {
            playAnimation();
          }
        };
        ref.current.addEventListener('mouseenter', handleHover);
        return () => {
          ref.current?.removeEventListener('mouseenter', handleHover);
        };
      }
    },
    {
      dependencies: [ready, chars, duration, ease, shuffleTimes, animationMode, stagger, loop, loopDelay, triggerOnHover],
      scope: ref
    }
  );

  const commonStyle = useMemo(() => ({ textAlign, ...style }), [textAlign, style]);
  const classes = useMemo(() => `shuffle-parent is-ready ${className}`, [className]);

  const Tag = tag || 'p';
  
  return React.createElement(
    Tag,
    { ref, className: classes, style: commonStyle },
    chars.map((char, i) => (
      <span
        key={i}
        ref={(el) => (charsRef.current[i] = el)}
        className={`shuffle-char ${largeCharIndices.has(i) ? 'shuffle-char-large' : ''}`}
        style={{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : 'normal' }}
      >
        {char}
      </span>
    ))
  );
};

export default Shuffle;
