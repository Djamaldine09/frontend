"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

const DEFAULT_DATA = [
  "https://madagascar.co.uk/application/files/3815/6051/9485/Education_banner-min.jpg",
  "https://tse1.mm.bing.net/th/id/OIP.OBHl41Afmf2MPiN86K-FKAHaE8?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
  "https://th.bing.com/th/id/R.680542febe46876a0547407020c05204?rik=zmD7VhLqT7aQMg&riu=http%3a%2f%2fwomendeliver.org%2fwp-content%2fuploads%2f2016%2f09%2fGrad-time.jpg&ehk=IrOgIvYaNGvvv9n29YD0gQxWePylOnTsZCynCSjoPPc%3d&risl=&pid=ImgRaw&r=0",
  "https://cms.moov.mg/uploads/MEN_06fb5c9c33.jpg",
  "https://adra.mg/wp-content/uploads/2020/08/1V7A4442-2000x1333.jpg",
  "https://static.wixstatic.com/media/022ba8_1726ff16244749ce9e62e83695411947~mv2.jpg/v1/fill/w_1600,h_1067,al_c,q_85/022ba8_1726ff16244749ce9e62e83695411947~mv2.jpg",
  "https://consolataafrica.org/fr/wp-content/uploads/2024/09/20240925Madagascar5.jpg",
  "https://www.bibliosansfrontieres.org/wp-content/uploads/2023/07/mada.jpg",
  "https://espoirsdenfants.org/voy_content/uploads/2024/02/Ensemble.jpg",
  "https://bank-of-africa.net/wp-content/uploads/2024/01/4_Nov_Madagascar-ma-BelleEcole-3.jpg",
  "https://ensemblepourlesenfantsdemadagascar.org/wp-content/uploads/2018/01/Ecole-Madagascar-02.jpg",
  "https://ict.io/wp-content/uploads/2017/01/ecole-numerique-1.gif",
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
