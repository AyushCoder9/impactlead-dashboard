"use client";

import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

/**
 * Stacked cards that auto-cycle with GSAP, front card dropping away and the
 * stack promoting behind it. Adapted from superdesign.dev's "Card Swap"
 * (real production source pulled during research). Used here to cycle
 * through real product screenshots rather than the original's stock
 * photography.
 */
export interface CardSwapCardProps extends React.HTMLAttributes<HTMLDivElement> {
  customClass?: string;
}

export const SwapCard = forwardRef<HTMLDivElement, CardSwapCardProps>(
  ({ customClass, className, ...rest }, ref) => (
    <div
      ref={ref}
      {...rest}
      className={cn(
        "absolute top-1/2 left-1/2 overflow-hidden rounded-3xl border border-border bg-card shadow-xl [transform-style:preserve-3d] [backface-visibility:hidden] [will-change:transform]",
        customClass,
        className,
      )}
    />
  ),
);
SwapCard.displayName = "SwapCard";

interface Slot {
  x: number;
  y: number;
  z: number;
  zIndex: number;
}

const makeSlot = (i: number, distX: number, distY: number, total: number): Slot => ({
  x: i * distX,
  y: -i * distY,
  z: -i * distX * 1.5,
  zIndex: total - i,
});

const placeNow = (el: HTMLElement, slot: Slot, skew: number) =>
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: "center center",
    zIndex: slot.zIndex,
    force3D: true,
  });

export function CardSwap({
  width = 480,
  height = 320,
  cardDistance = 44,
  verticalDistance = 44,
  delay = 1600,
  pauseOnHover = false,
  skewAmount = 3,
  swapOnClick = true,
  children,
}: {
  width?: number | string;
  height?: number | string;
  cardDistance?: number;
  verticalDistance?: number;
  delay?: number;
  pauseOnHover?: boolean;
  skewAmount?: number;
  /** Clicking the stack swaps immediately, on top of the auto-cycle. */
  swapOnClick?: boolean;
  children: ReactNode;
}) {
  const config = {
    ease: "elastic.out(0.6,0.9)",
    durDrop: 1,
    durMove: 1,
    durReturn: 1,
    promoteOverlap: 0.9,
    returnDelay: 0.05,
  };

  const childArr = useMemo(
    () => Children.toArray(children) as ReactElement<CardSwapCardProps>[],
    [children],
  );
  const refs = useMemo<RefObject<HTMLDivElement | null>[]>(
    () => childArr.map(() => ({ current: null }) as RefObject<HTMLDivElement | null>),
    [childArr.length],
  );
  const order = useRef<number[]>(Array.from({ length: childArr.length }, (_, i) => i));
  const intervalRef = useRef<number>(0);
  const container = useRef<HTMLDivElement>(null);
  const swapRef = useRef<() => void>(() => {});

  useEffect(() => {
    const total = refs.length;
    refs.forEach((r, i) => {
      if (r.current) placeNow(r.current, makeSlot(i, cardDistance, verticalDistance, total), skewAmount);
    });

    const swap = () => {
      if (order.current.length < 2) return;
      const [front, ...rest] = order.current;
      const elFront = refs[front]?.current;
      if (!elFront) return;

      const tl = gsap.timeline();
      tl.to(elFront, { y: "+=420", duration: config.durDrop, ease: config.ease });
      tl.addLabel("promote", `-=${config.durDrop * config.promoteOverlap}`);
      rest.forEach((idx, i) => {
        const el = refs[idx]?.current;
        if (!el) return;
        const slot = makeSlot(i, cardDistance, verticalDistance, refs.length);
        tl.set(el, { zIndex: slot.zIndex }, "promote");
        tl.to(el, { x: slot.x, y: slot.y, z: slot.z, duration: config.durMove, ease: config.ease }, `promote+=${i * 0.12}`);
      });
      const backSlot = makeSlot(refs.length - 1, cardDistance, verticalDistance, refs.length);
      tl.addLabel("return", `promote+=${config.durMove * config.returnDelay}`);
      tl.call(() => gsap.set(elFront, { zIndex: backSlot.zIndex }), undefined, "return");
      tl.to(elFront, { x: backSlot.x, y: backSlot.y, z: backSlot.z, duration: config.durReturn, ease: config.ease }, "return");
      tl.call(() => {
        order.current = [...rest, front];
      });
    };
    swapRef.current = swap;

    function startInterval() {
      intervalRef.current = window.setInterval(swap, delay);
    }
    function stopInterval() {
      clearInterval(intervalRef.current);
    }

    startInterval();

    const node = container.current;

    if (pauseOnHover && node) {
      node.addEventListener("mouseenter", stopInterval);
      node.addEventListener("mouseleave", startInterval);
    }

    function handleClick() {
      if (!swapOnClick) return;
      // Manual swap resets the timer so auto-cycle doesn't immediately
      // double-fire right after a click-triggered one.
      stopInterval();
      swapRef.current();
      startInterval();
    }
    if (swapOnClick && node) {
      node.addEventListener("click", handleClick);
    }

    return () => {
      stopInterval();
      if (node) {
        node.removeEventListener("mouseenter", stopInterval);
        node.removeEventListener("mouseleave", startInterval);
        node.removeEventListener("click", handleClick);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardDistance, verticalDistance, delay, pauseOnHover, skewAmount, swapOnClick, refs.length]);

  const rendered = childArr.map((child, i) =>
    isValidElement<CardSwapCardProps>(child)
      ? cloneElement(child, {
          key: i,
          ref: refs[i],
          style: { width, height, ...(child.props.style ?? {}) },
        } as CardSwapCardProps & React.RefAttributes<HTMLDivElement>)
      : child,
  );

  return (
    <div
      ref={container}
      className={cn(
        "relative [perspective:1200px] [transform-style:preserve-3d]",
        swapOnClick && "cursor-pointer",
      )}
      style={{ width, height }}
    >
      <div className="absolute inset-0 [transform-style:preserve-3d]">{rendered}</div>
    </div>
  );
}
