"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PrepStep {
  letter: string;
  word: string;
}

const prepSteps: PrepStep[] = [
  { letter: "P", word: "Practice" },
  { letter: "R", word: "Review" },
  { letter: "E", word: "Evaluate" },
  { letter: "P", word: "Plan" },
  { letter: "N", word: "Note" },
  { letter: "M", word: "Memorize" },
  { letter: "C", word: "Conquer" },
];

interface PrepDynamicTextProps {
  className?: string;
}

const PrepDynamicText = ({ className = "" }: PrepDynamicTextProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % prepSteps.length);
    }, 800); // Fast rotation every 800ms

    return () => clearInterval(interval);
  }, []);

  // Animation variants for the text
  const textVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
  };

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={currentIndex}
        className={`text-muted-foreground font-semibold ${className}`}
        initial={textVariants.hidden}
        animate={textVariants.visible}
        exit={textVariants.exit}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {prepSteps[currentIndex].word}
      </motion.span>
    </AnimatePresence>
  );
};

export default PrepDynamicText;
