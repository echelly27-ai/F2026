"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { CHALLENGES, COLORS, WORLD, type ChallengeId } from "@/components/challenges/constants";
import { mountChallenge, type SceneController } from "@/components/challenges/mount-scene";

function subscribeToMotion(onChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function motionAllowed() {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const COUNT_MIN = 0;
const COUNT_MAX = 56;

function ChallengeStage({ id, caption, running }: { id: ChallengeId; caption: string; running: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const apiRef = useRef<SceneController | null>(null);
  const runningRef = useRef(running);
  const visibleRef = useRef(true);
  const [count, setCount] = useState(30);

  useEffect(() => {
    runningRef.current = running;
    apiRef.current?.sync();
  }, [running]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let dead = false;
    let controller: SceneController | null = null;
    void mountChallenge(canvas, id, {
      isCancelled: () => dead,
      getRunning: () => runningRef.current && visibleRef.current,
      onCount: id === "count" ? setCount : undefined,
    }).then((next) => {
      if (dead) {
        next.destroy();
        return;
      }
      controller = next;
      apiRef.current = next;
      next.sync();
    });
    return () => {
      dead = true;
      controller?.destroy();
      apiRef.current = null;
    };
  }, [id]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry?.isIntersecting ?? false;
        apiRef.current?.sync();
      },
      { rootMargin: "160px" },
    );
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  const interactive = id === "drag";

  return (
    <figure className="min-w-0">
      <div className="relative w-full" style={{ aspectRatio: `${WORLD.w} / ${WORLD.h}` }}>
        <canvas
          ref={canvasRef}
          aria-label={interactive ? "Draggable blocks in a physics world" : undefined}
          aria-hidden={interactive ? undefined : true}
          className={interactive ? "absolute inset-0 h-full w-full cursor-grab touch-none select-none active:cursor-grabbing" : "absolute inset-0 h-full w-full"}
          style={{ background: COLORS.background }}
        />
      </div>
      <figcaption className="mx-auto mt-3 max-w-[15rem] text-center text-[0.98rem] leading-snug text-[#243038]">
        {caption}
      </figcaption>
      {id === "count" ? (
        <div className="mt-3 flex items-center justify-center gap-2">
          <button
            type="button"
            aria-label="Remove a body"
            disabled={count <= COUNT_MIN}
            onClick={() => apiRef.current?.removeBody?.()}
            className="inline-flex size-9 items-center justify-center rounded-full border border-[#324450]/30 text-lg leading-none text-[#243844] transition hover:border-[#324450] disabled:cursor-not-allowed disabled:opacity-40"
          >
            −
          </button>
          <p className="sr-only" aria-live="polite">
            {count} bodies in the world
          </p>
          <button
            type="button"
            aria-label="Add a body"
            disabled={count >= COUNT_MAX}
            onClick={() => apiRef.current?.addBody?.()}
            className="inline-flex size-9 items-center justify-center rounded-full border border-[#324450]/30 text-lg leading-none text-[#243844] transition hover:border-[#324450] disabled:cursor-not-allowed disabled:opacity-40"
          >
            +
          </button>
        </div>
      ) : null}
      {interactive ? <p className="sr-only">Drag the blocks with a pointer.</p> : null}
    </figure>
  );
}

function TitleCard() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-10 text-center">
      <p className="text-[clamp(1.8rem,2.5vw,2.45rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-[#1a242c]">
        Fall Hack-a-Thon
        <span className="mt-1 block">2026</span>
      </p>
      <p className="mt-4 text-[1.05rem] text-[#6a2e11]">Matter.js Simulations</p>
    </div>
  );
}

export function ChallengesBoard() {
  const systemRunning = useSyncExternalStore(subscribeToMotion, motionAllowed, () => true);
  const [override, setOverride] = useState<boolean | null>(null);
  const running = override ?? systemRunning;

  const leading = CHALLENGES.slice(0, 4);
  const trailing = CHALLENGES.slice(4);

  return (
    <section className="relative bg-[#e6eef1] text-[#1a242c]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-full h-20 bg-[#e6eef1]" />
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <header className="text-center">
          <h1 className="text-[clamp(2.7rem,6vw,4.4rem)] font-semibold tracking-[-0.03em] text-[#1a242c]">
            Eight Challenges
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-[#4c5c66]">
            Eight live Matter.js worlds. Drag the blocks, add or remove bodies, and let the others keep moving.
          </p>
          <button
            type="button"
            aria-pressed={running}
            onClick={() => setOverride(!running)}
            className="mt-6 rounded-full border border-[#324450]/30 px-4 py-1.5 text-sm text-[#243844] transition hover:border-[#324450]"
          >
            {running ? "Pause simulations" : "Play simulations"}
          </button>
        </header>
        <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-3">
          {leading.map((challenge) => (
            <ChallengeStage key={challenge.id} id={challenge.id} caption={challenge.caption} running={running} />
          ))}
          <TitleCard />
          {trailing.map((challenge) => (
            <ChallengeStage key={challenge.id} id={challenge.id} caption={challenge.caption} running={running} />
          ))}
        </div>
      </div>
    </section>
  );
}
