"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// CinematicScroll
// A small choreography layer for marketing pages.
// Usage:
//   <CinematicScroll>
//     <section data-scene>...</section>
//   </CinematicScroll>
// Optional:
//   data-parallax="0.15" on elements to parallax
//   data-reveal on elements for staggered fade/slide
//   data-pin on a scene to pin it briefly

export default function CinematicScroll({ children }) {
  const rootRef = useRef(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    if (typeof window === "undefined") return;
    if (!rootRef.current) return;

    gsap.registerPlugin(ScrollTrigger);
    const root = rootRef.current;

    const ctx = gsap.context(() => {
      const scenes = Array.from(root.querySelectorAll("[data-scene]"));

      scenes.forEach((scene) => {
        // Scene entry reveal
        gsap.fromTo(
          scene,
          { opacity: 0.8, y: 12 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: scene,
              start: "top 80%",
              end: "bottom 30%",
              toggleActions: "play none none reverse",
            },
          }
        );

        // Optional pinning
        if (scene.hasAttribute("data-pin")) {
          ScrollTrigger.create({
            trigger: scene,
            start: "top top",
            end: "+=60%",
            pin: true,
            pinSpacing: true,
            scrub: 0.2,
          });
        }

        // Element reveals
        const reveals = Array.from(scene.querySelectorAll("[data-reveal]"));
        if (reveals.length) {
          gsap.fromTo(
            reveals,
            { opacity: 0, y: 14 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.08,
              ease: "power2.out",
              scrollTrigger: {
                trigger: scene,
                start: "top 75%",
              },
            }
          );
        }

        // Parallax elements
        const parallax = Array.from(scene.querySelectorAll("[data-parallax]"));
        parallax.forEach((el) => {
          const amt = Number(el.getAttribute("data-parallax") || "0.12");
          gsap.fromTo(
            el,
            { y: 0 },
            {
              y: () => Math.round(window.innerHeight * amt),
              ease: "none",
              scrollTrigger: {
                trigger: scene,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.35,
              },
            }
          );
        });
      });

      ScrollTrigger.refresh();
    }, root);

    return () => ctx.revert();
  }, [reduce]);

  return <div ref={rootRef}>{children}</div>;
}
