"use client";
import { cn } from "@/lib/utils";
import React, {
  useRef,
  useState,
  useEffect,
  createContext,
  useContext,
} from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  animate,
  useVelocity,
  useAnimationControls,
} from "motion/react";

// ─── Share the container ref with every card ──────────────────────────────────
const DragContainerContext = createContext<React.RefObject<HTMLDivElement | null>>({
  current: null,
});

// ─── DraggableCardBody ────────────────────────────────────────────────────────
export const DraggableCardBody = ({
  className,
  children,
  index = 0,
}: {
  className?: string;
  children?: React.ReactNode;
  index?: number;
}) => {
  const containerRef = useContext(DragContainerContext);
  const cardRef      = useRef<HTMLDivElement>(null);
  const controls     = useAnimationControls();

  const [constraints, setConstraints] = useState<{
    top: number; left: number; right: number; bottom: number;
  } | null>(null);

  const mouseX    = useMotionValue(0);
  const mouseY    = useMotionValue(0);
  const velocityX = useVelocity(mouseX);
  const velocityY = useVelocity(mouseY);

  const springConfig = { stiffness: 100, damping: 20, mass: 0.5 };

  const rotateX      = useSpring(useTransform(mouseY, [-300, 300], [25, -25]), springConfig);
  const rotateY      = useSpring(useTransform(mouseX, [-300, 300], [-25, 25]), springConfig);
  const opacity      = useSpring(useTransform(mouseX, [-300, 0, 300], [0.8, 1, 0.8]), springConfig);
  const glareOpacity = useSpring(useTransform(mouseX, [-300, 0, 300], [0.2, 0, 0.2]), springConfig);

  useEffect(() => {
    const compute = () => {
      const card = cardRef.current;
      if (!card) return;

      const r    = card.getBoundingClientRect();
      const halfW = r.width  / 2;
      const halfH = r.height / 2;

      // ── How these numbers work ─────────────────────────────────────────────
      //
      // Framer Motion numeric constraints = max px the element can move in
      // each direction from its CURRENT rendered position.
      // Negative = leftward / upward.  Positive = rightward / downward.
      //
      // We want each edge to be draggable until HALF the card is off-screen:
      //
      //  LEFT:   card can travel until its left edge = -halfW (viewport coords)
      //          distance = r.left − (−halfW) = r.left + halfW  →  negate it
      //  RIGHT:  card can travel until its right edge = vw + halfW
      //          distance = (vw + halfW) − r.right = vw − r.right + halfW
      //  TOP:    card can travel until its top edge = -halfH
      //          distance = r.top − (−halfH) = r.top + halfH  →  negate it
      //  BOTTOM: card can travel until its bottom edge = vh + halfH
      //          distance = (vh + halfH) − r.bottom = vh − r.bottom + halfH
      //
      setConstraints({
        left:   -(r.left   + halfW),
        right:   window.innerWidth  - r.right  + halfW,
        top:    -(r.top    + halfH),
        bottom:  window.innerHeight - r.bottom + halfH,
      });
    };

    const raf = requestAnimationFrame(compute);
    window.addEventListener("resize", compute);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", compute);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - (rect.left + rect.width  / 2));
    mouseY.set(e.clientY - (rect.top  + rect.height / 2));
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      drag
      dragConstraints={constraints ?? { top: 0, left: 0, right: 0, bottom: 0 }}
      dragElastic={0.08}
      dragMomentum={true}
      dragTransition={{
        bounceStiffness: 260,
        bounceDamping: 30,
        power: 0.4,
        timeConstant: 220,
      }}
      onDragStart={() => {
        document.body.style.cursor = "grabbing";
      }}
      onDragEnd={(_, info) => {
        document.body.style.cursor = "default";
        controls.start({
          rotateX: 0,
          rotateY: 0,
          transition: { type: "spring", ...springConfig },
        });

        const vx  = velocityX.get();
        const vy  = velocityY.get();
        const mag = Math.sqrt(vx * vx + vy * vy);
        if (mag > 400) {
          const bounce = Math.min(0.6, mag / 1200);
          animate(info.point.x, info.point.x + vx * 0.15, {
            type: "spring", stiffness: 60, damping: 18, mass: 0.8, bounce,
          });
          animate(info.point.y, info.point.y + vy * 0.15, {
            type: "spring", stiffness: 60, damping: 18, mass: 0.8, bounce,
          });
        }
      }}

      // Staggered entrance
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.1,
        duration: 0.6,
        type: "spring",
        stiffness: 80,
        damping: 16,
      }}

      style={{ rotateX, rotateY, opacity, willChange: "transform" }}
      whileHover={{ scale: 1.02 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative min-h-96 w-80 overflow-hidden rounded-md bg-neutral-100 p-6 shadow-2xl transform-3d dark:bg-neutral-900",
        className,
      )}
    >
      {children}
      <motion.div
        style={{ opacity: glareOpacity }}
        className="pointer-events-none absolute inset-0 bg-white select-none"
      />
    </motion.div>
  );
};

// ─── DraggableCardContainer ───────────────────────────────────────────────────
export const DraggableCardContainer = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <DragContainerContext.Provider value={containerRef}>
      <div ref={containerRef} className={cn("perspective-[3000px]", className)}>
        {children}
      </div>
    </DragContainerContext.Provider>
  );
};