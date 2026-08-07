"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

const DEFAULT_DATA = [
  "https://madagascar.co.uk/application/files/3815/6051/9485/Education_banner-min.jpg",
  "https://tse1.mm.bing.net/th/id/OIP.OBHl41Afmf2MPiN86K-FKAHaE8?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
  "https://th.bing.com/th/id/R.680542febe46876a0547407020c05204?rik=zmD7VhLqT7aQMg&riu=http%3a%2f%2fwomendeliver.org%2fwp-content%2fuploads%2f2016%2f09%2fGrad-time.jpg&ehk=IrOgIvYaNGvvv9n29YD0gQxWePylOnTsZCynCSjoPPc%3d&risl=&pid=ImgRaw&r=0",
  "https://images.unsplash.com/photo-1590013330451-3946e83e0392?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1590421959604-741d0eec0a2e?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1572613000712-eadc57acbecd?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1570097192570-4b49a6736f9f?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1620789550663-2b10e0080354?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1617775623669-20bff4ffaa5c?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1548600916-dc8492f8e845?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1573824969595-a76d4365a2e6?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1633936929709-59991b5fdd72?w=800&auto=format&fit=crop&q=60",
];

interface Slider3DProps {
  /** Array of image URLs to display */
  images?: string[];
  /** Duration of one full 360-degree rotation (in seconds) */
  duration?: number;
  /** Width of each card. Can be px, rem, em, etc. */
  cardWidth?: string;
  /** CSS aspect ratio of the cards */
  cardAspectRatio?: string;
  /** CSS perspective value for the 3D container */
  perspective?: string;
  /** Additional classes for the outermost container */
  containerClassName?: string;
  /** Additional classes for the individual image elements */
  imageClassName?: string;
  /** Direction of the rotation */
  rotationDirection?: "left" | "right";
  /** Whether to apply a gradient fade mask on the edges */
  withMask?: boolean;
}

export default function ImageSlider3D({
  images = DEFAULT_DATA,
  duration = 32,
  cardWidth = "17.5em",
  cardAspectRatio = "7/10",
  perspective = "35em",
  containerClassName = "",
  imageClassName = "",
  rotationDirection = "left",
  withMask = true,
}: Slider3DProps) {
  const n = images.length;
  const prefersReducedMotion = useReducedMotion();
  const animationDuration = prefersReducedMotion ? duration * 4 : duration;

  // rotation angles based on direction
  const rotationValues = rotationDirection === "left" ? [0, 360] : [360, 0];

  const maskStyles = withMask
    ? {
      WebkitMask:
        "linear-gradient(90deg, transparent, #000 20% 80%, transparent)",
      mask: "linear-gradient(90deg, transparent, #000 20% 80%, transparent)",
    }
    : {};

  return (
    <div
      className={`grid w-full h-full min-h-[500px] overflow-hidden place-items-center ${containerClassName}`}
      style={{
        perspective: perspective,
        ...maskStyles,
      }}
    >
      <motion.div
        className="grid place-self-center pointer-events-auto"
        style={{
          transformStyle: "preserve-3d",
        }}
        animate={{
          rotateY: rotationValues,
        }}
        transition={{
          duration: animationDuration,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Slide ${i}`}
            className={`col-start-1 row-start-1 object-cover rounded-[1.5em] ${imageClassName}`}
            style={{
              width: cardWidth,
              aspectRatio: cardAspectRatio,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: `rotateY(calc(${i} * (1turn / ${n}))) translateZ(calc(-1 * (0.5 * ${cardWidth} + 0.5em) / tan(0.5 * (1turn / ${n}))))`,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
