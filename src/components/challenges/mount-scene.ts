import type { Body, Engine, Mouse, MouseConstraint, Vector, World } from "matter-js";
import { CHALLENGES, COLORS, INSET, STEP, STEP_SQUARED, WORLD, type ChallengeId } from "@/components/challenges/constants";

type MatterApi = typeof import("matter-js");

export type SceneController = {
  sync: () => void;
  addBody?: () => void;
  removeBody?: () => void;
  destroy: () => void;
};

type MountOptions = {
  isCancelled: () => boolean;
  getRunning: () => boolean;
  onCount?: (count: number) => void;
};

type Spark = { x: number; y: number; angle: number; life: number };
type Flash = { body: Body; life: number };

type SceneRuntime = {
  engine: Engine;
  world: World;
  mouse?: Mouse;
  mouseConstraint?: MouseConstraint;
  flashes?: Map<number, Flash>;
  afterUpdate?: () => void;
  drawOverlay?: (ctx: CanvasRenderingContext2D, fontFamily: string) => void;
  addBody?: () => void;
  removeBody?: () => void;
};

const WALL = {
  isStatic: true,
  friction: 0.45,
  restitution: 0.2,
  label: "wall",
  collisionFilter: { category: 0x0002, mask: 0xffffffff },
  render: { visible: false },
};

function rng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function addContainer(Matter: MatterApi, world: World, ceiling = false) {
  const thickness = 80;
  const bodies = [
    Matter.Bodies.rectangle(WORLD.w / 2, WORLD.h - INSET + thickness / 2, WORLD.w, thickness, WALL),
    Matter.Bodies.rectangle(INSET - thickness / 2, WORLD.h / 2, thickness, WORLD.h * 2, WALL),
    Matter.Bodies.rectangle(WORLD.w - INSET + thickness / 2, WORLD.h / 2, thickness, WORLD.h * 2, WALL),
  ];
  if (ceiling) {
    bodies.push(Matter.Bodies.rectangle(WORLD.w / 2, INSET - thickness / 2, WORLD.w, thickness, WALL));
  }
  Matter.Composite.add(world, bodies);
}

function paint(fill: string) {
  return { fillStyle: fill };
}

function drawFrame(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = COLORS.frame;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(INSET + 0.5, INSET + 0.5, WORLD.w - INSET * 2 - 1, WORLD.h - INSET * 2 - 1);
}

function drawBodies(ctx: CanvasRenderingContext2D, bodies: Body[], flashes: Map<number, Flash>) {
  for (const body of bodies) {
    if (body.render.visible === false || body.label === "wall") continue;
    ctx.beginPath();
    if (body.circleRadius) {
      ctx.arc(body.position.x, body.position.y, body.circleRadius, 0, Math.PI * 2);
    } else {
      const vertices = body.vertices;
      ctx.moveTo(vertices[0].x, vertices[0].y);
      for (let index = 1; index < vertices.length; index += 1) {
        ctx.lineTo(vertices[index].x, vertices[index].y);
      }
      ctx.closePath();
    }
    ctx.fillStyle = body.render.fillStyle || COLORS.slate;
    ctx.fill();
    const flash = flashes.get(body.id);
    if (flash) {
      ctx.fillStyle = `rgba(255,255,255,${flash.life * 0.65})`;
      ctx.fill();
    }
  }
}

function drawSparks(ctx: CanvasRenderingContext2D, sparks: Spark[]) {
  for (const spark of sparks) {
    ctx.save();
    ctx.translate(spark.x, spark.y);
    ctx.rotate(spark.angle);
    ctx.strokeStyle = `rgba(50, 68, 80, ${0.2 + spark.life * 0.8})`;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, 0, 11 + (1 - spark.life) * 12, -1.05, 1.05);
    ctx.stroke();
    ctx.strokeStyle = `rgba(247, 251, 252, ${spark.life})`;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(0, 0, 8 + (1 - spark.life) * 8, -0.7, 0.7);
    ctx.stroke();
    ctx.restore();
  }
}

function buildGravity(Matter: MatterApi, world: World) {
  const random = rng(11);
  const radius = 12;
  const stepX = radius * 2 + 1.4;
  const stepY = (stepX * Math.sqrt(3)) / 2;
  const columns = 16;
  const pileWidth = (columns - 1) * stepX;
  const left = (WORLD.w - pileWidth) / 2;
  const bottom = WORLD.h - INSET - radius - 1;
  const bodies: Body[] = [];
  let index = 0;
  for (let row = 0; row < 3; row += 1) {
    const count = columns - row;
    const rowLeft = left + row * (stepX / 2);
    for (let column = 0; column < count; column += 1) {
      const bronze = index % 6 === 1 || index % 6 === 4;
      const body = Matter.Bodies.circle(
        rowLeft + column * stepX + (random() - 0.5) * 0.4,
        bottom - row * stepY,
        radius,
        {
          restitution: 0.28,
          friction: 0.35,
          render: paint(bronze ? COLORS.bronze : index % 5 === 0 ? COLORS.slateDeep : COLORS.slate),
        },
      );
      bodies.push(body);
      index += 1;
    }
  }
  const drip = Matter.Bodies.circle(WORLD.w * 0.74, INSET + 48, radius, {
    restitution: 0.45,
    friction: 0.15,
    label: "drip",
    render: paint(COLORS.slate),
  });
  Matter.Body.setVelocity(drip, { x: 0.4, y: 0.6 });
  Matter.Composite.add(world, [...bodies, drip]);
  let cooldown = 30;
  return () => {
    cooldown -= 1;
    if (cooldown > 0) return;
    if (drip.speed < 0.35 && drip.position.y > WORLD.h - INSET - radius * 5) {
      Matter.Body.setPosition(drip, { x: WORLD.w * 0.62 + random() * 90, y: INSET + radius + 10 });
      Matter.Body.setVelocity(drip, { x: (random() - 0.5) * 1.4, y: 0.2 });
      Matter.Body.setAngularVelocity(drip, 0);
      cooldown = 55;
    }
  };
}

function buildShapes(Matter: MatterApi, world: World) {
  const random = rng(29);
  const specs: Body[] = [
    Matter.Bodies.rectangle(WORLD.w * 0.5, INSET + 58, 48, 48, {
      restitution: 0.35,
      friction: 0.4,
      label: "floater",
      render: paint(COLORS.slate),
    }),
    Matter.Bodies.circle(150, 210, 18, { restitution: 0.4, friction: 0.25, render: paint(COLORS.bronze) }),
    Matter.Bodies.circle(230, 180, 22, { restitution: 0.4, friction: 0.25, render: paint(COLORS.bronze) }),
    Matter.Bodies.circle(390, 200, 11, { restitution: 0.45, friction: 0.2, render: paint(COLORS.bronze) }),
    Matter.Bodies.rectangle(120, 250, 22, 22, { restitution: 0.25, friction: 0.4, render: paint(COLORS.mist) }),
    Matter.Bodies.rectangle(280, 230, 36, 28, {
      restitution: 0.25,
      friction: 0.4,
      angle: 0.2,
      render: paint(COLORS.slateDeep),
    }),
    Matter.Bodies.rectangle(470, 220, 20, 20, { restitution: 0.25, friction: 0.35, render: paint(COLORS.slate) }),
    Matter.Bodies.rectangle(520, 190, 30, 22, { restitution: 0.25, friction: 0.35, render: paint(COLORS.mist) }),
    Matter.Bodies.polygon(340, 160, 3, 18, {
      restitution: 0.4,
      friction: 0.3,
      render: paint(COLORS.slate),
    }),
  ];
  Matter.Composite.add(world, specs);
  const floater = specs[0];
  let cooldown = 80;
  return () => {
    cooldown -= 1;
    if (cooldown > 0) return;
    if (floater.speed < 0.3 && floater.position.y > WORLD.h * 0.55) {
      Matter.Body.setPosition(floater, { x: WORLD.w * 0.42 + random() * 120, y: INSET + 46 });
      Matter.Body.setVelocity(floater, { x: (random() - 0.5) * 1.5, y: 0 });
      Matter.Body.setAngle(floater, (random() - 0.5) * 0.5);
      Matter.Body.setAngularVelocity(floater, 0);
      cooldown = 90;
    }
  };
}

function buildDrag(Matter: MatterApi, engine: Engine, world: World, canvas: HTMLCanvasElement) {
  engine.gravity.y = 0.72;
  const blocks = [
    Matter.Bodies.rectangle(168, 148, 156, 58, {
      chamfer: { radius: 6 },
      restitution: 0.08,
      friction: 0.55,
      render: paint(COLORS.bronze),
    }),
    Matter.Bodies.rectangle(330, 112, 118, 72, {
      chamfer: { radius: 6 },
      restitution: 0.08,
      friction: 0.55,
      render: paint(COLORS.slate),
    }),
    Matter.Bodies.rectangle(500, 156, 142, 60, {
      chamfer: { radius: 6 },
      restitution: 0.08,
      friction: 0.55,
      render: paint(COLORS.slateDeep),
    }),
  ];
  const mouse = Matter.Mouse.create(canvas);
  const mouseConstraint = Matter.MouseConstraint.create(engine, {
    mouse,
    collisionFilter: { mask: 0x0001 },
  });
  mouseConstraint.constraint.stiffness = 0.18;
  mouseConstraint.constraint.damping = 0.08;
  Matter.Composite.add(world, [...blocks, mouseConstraint]);
  const pointer = mouse as PointerMouse;
  if (pointer.mousewheel) canvas.removeEventListener("wheel", pointer.mousewheel);
  return { mouse, mouseConstraint };
}

function buildCount(Matter: MatterApi, world: World, onCount?: (count: number) => void) {
  const random = rng(47);
  const radius = 8;
  const bodies: Body[] = [];
  const limit = 56;

  const spawn = (x: number, y: number) => {
    const body = Matter.Bodies.circle(x, y, radius, {
      restitution: 0.35,
      friction: 0.18,
      render: paint(bodies.length % 5 === 0 ? COLORS.mist : bodies.length % 4 === 0 ? COLORS.bronze : COLORS.slate),
    });
    bodies.push(body);
    Matter.Composite.add(world, body);
    onCount?.(bodies.length);
    return body;
  };

  for (let index = 0; index < 22; index += 1) {
    const column = index % 8;
    const row = Math.floor(index / 8);
    spawn(INSET + 48 + column * 28 + (row % 2) * 8, WORLD.h - INSET - 36 - row * 22);
  }
  for (let index = 0; index < 8; index += 1) {
    spawn(WORLD.w - INSET - 46, INSET + 28 + index * 20);
  }

  return {
    addBody() {
      if (bodies.length >= limit) return;
      const body = spawn(INSET + 40 + random() * (WORLD.w - INSET * 2 - 80), INSET + 28);
      Matter.Body.setVelocity(body, { x: (random() - 0.5) * 2, y: 1 });
    },
    removeBody() {
      const body = bodies.pop();
      if (!body) return;
      Matter.Composite.remove(world, body);
      onCount?.(bodies.length);
    },
    drawOverlay(ctx: CanvasRenderingContext2D, fontFamily: string) {
      ctx.font = `600 22px ${fontFamily}`;
      ctx.fillStyle = COLORS.slate;
      ctx.textAlign = "right";
      ctx.textBaseline = "top";
      ctx.fillText(String(bodies.length), WORLD.w - INSET - 12, INSET + 10);
    },
  };
}

function buildCollision(Matter: MatterApi, engine: Engine, world: World) {
  const random = rng(71);
  const specs = [
    { x: 130, y: 86, r: 14, vx: 3.4, vy: 2.2, fill: COLORS.slate },
    { x: 250, y: 210, r: 16, vx: 2.1, vy: 0.6, fill: COLORS.slate },
    { x: 320, y: 246, r: 15, vx: -1.6, vy: -0.8, fill: COLORS.bronze },
    { x: 390, y: 220, r: 13, vx: -2.8, vy: 1.1, fill: COLORS.slateDeep },
    { x: 450, y: 180, r: 14, vx: -2.2, vy: 1.8, fill: COLORS.bronze },
    { x: 200, y: 160, r: 11, vx: 2.4, vy: 1.6, fill: COLORS.slate },
    { x: 500, y: 130, r: 12, vx: -1.5, vy: 2.1, fill: COLORS.mist },
  ];
  const balls = specs.map((spec) => {
    const body = Matter.Bodies.circle(spec.x, spec.y, spec.r, {
      restitution: 0.96,
      friction: 0,
      frictionAir: 0.001,
      frictionStatic: 0,
      render: paint(spec.fill),
    });
    Matter.Body.setVelocity(body, { x: spec.vx, y: spec.vy });
    return body;
  });
  Matter.Composite.add(world, balls);
  const sparks: Spark[] = [];
  const flashes = new Map<number, Flash>();
  Matter.Events.on(engine, "collisionStart", (event) => {
    for (const pair of event.pairs) {
      if (pair.bodyA.label === "wall" || pair.bodyB.label === "wall") continue;
      if (pair.bodyA.speed + pair.bodyB.speed < 0.7) continue;
      const contact = pair.collision.supports[0];
      if (!contact) continue;
      sparks.push({
        x: contact.x,
        y: contact.y,
        angle: Math.atan2(pair.collision.normal.y, pair.collision.normal.x),
        life: 1,
      });
      if (sparks.length > 28) sparks.shift();
      flashes.set(pair.bodyA.id, { body: pair.bodyA, life: 1 });
      flashes.set(pair.bodyB.id, { body: pair.bodyB, life: 1 });
    }
  });
  let calm = 0;
  return {
    sparks,
    flashes,
    afterUpdate() {
      const energy = balls.reduce((sum, body) => sum + body.speed, 0);
      calm = energy < 2.4 ? calm + 1 : 0;
      if (calm > 45) {
        for (const body of balls) {
          Matter.Body.setVelocity(body, { x: (random() - 0.5) * 6, y: (random() - 0.5) * 6 });
        }
        calm = 0;
      }
      for (let index = sparks.length - 1; index >= 0; index -= 1) {
        sparks[index].life -= 0.04;
        if (sparks[index].life <= 0) sparks.splice(index, 1);
      }
      for (const [id, flash] of flashes) {
        flash.life -= 0.07;
        if (flash.life <= 0) flashes.delete(id);
      }
    },
  };
}

function buildForces(Matter: MatterApi, engine: Engine, world: World) {
  engine.gravity.scale = 0;
  const center = Matter.Bodies.circle(WORLD.w / 2, WORLD.h / 2, 24, {
    isStatic: true,
    render: paint(COLORS.bronze),
  });
  const distances = [52, 74, 98, 124, 148, 66, 112, 138, 84, 156, 58, 104];
  const orbs = distances.map((distance, index) => {
    const angle = (index / distances.length) * Math.PI * 2 + 0.35;
    const x = center.position.x + Math.cos(angle) * distance;
    const y = center.position.y + Math.sin(angle) * distance;
    const orb = Matter.Bodies.circle(x, y, 3.5 + (index % 4) * 1.3, {
      frictionAir: 0,
      friction: 0,
      restitution: 0.1,
      render: paint(index % 5 === 0 ? COLORS.slateDeep : COLORS.slate),
    });
    const speed = Math.sqrt((1.2 * STEP_SQUARED) / distance);
    Matter.Body.setVelocity(orb, { x: -Math.sin(angle) * speed, y: Math.cos(angle) * speed });
    return orb;
  });
  Matter.Composite.add(world, [center, ...orbs]);
  const gravity = 1.2;
  Matter.Events.on(engine, "beforeUpdate", () => {
    for (const orb of orbs) {
      const dx = center.position.x - orb.position.x;
      const dy = center.position.y - orb.position.y;
      const distance = Math.hypot(dx, dy) || 1;
      const toward = (gravity * orb.mass) / (distance * distance);
      const core = distance < 40 ? (40 - distance) * 0.0008 * orb.mass : 0;
      const magnitude = toward - core;
      Matter.Body.applyForce(orb, orb.position, {
        x: (dx / distance) * magnitude,
        y: (dy / distance) * magnitude,
      });
    }
  });
}

function buildConnect(Matter: MatterApi, engine: Engine, world: World) {
  engine.positionIterations = 20;
  engine.velocityIterations = 16;
  engine.constraintIterations = 6;
  const radius = 18;
  const spacing = radius * 2 + 0.75;
  const length = 170;
  const count = 5;
  const originX = WORLD.w / 2 - spacing * 2;
  const pinY = 86;
  const balls: Body[] = [];
  const pins: Vector[] = [];

  const place = (index: number, hang: number) => {
    const pin = { x: originX + index * spacing, y: pinY };
    pins.push(pin);
    return {
      x: pin.x + Math.sin(hang) * length,
      y: pin.y + Math.cos(hang) * length,
    };
  };

  for (let index = 0; index < count; index += 1) {
    const at = place(index, index === 0 ? -0.72 : 0);
    const ball = Matter.Bodies.circle(at.x, at.y, radius, {
      inertia: Infinity,
      restitution: 1,
      friction: 0,
      frictionAir: 0,
      frictionStatic: 0,
      slop: 0.05,
      render: paint(index === 0 ? COLORS.bronze : COLORS.slate),
    });
    const pin = pins[index];
    const constraint = Matter.Constraint.create({
      pointA: { x: pin.x, y: pin.y },
      bodyB: ball,
      length,
      stiffness: 1,
      damping: 0,
      label: "string",
    });
    balls.push(ball);
    Matter.Composite.add(world, [ball, constraint]);
  }

  const pull = () => {
    const pin = pins[0];
    const hang = -0.72;
    Matter.Body.setPosition(balls[0], {
      x: pin.x + Math.sin(hang) * length,
      y: pin.y + Math.cos(hang) * length,
    });
    Matter.Body.setVelocity(balls[0], { x: 0, y: 0 });
    Matter.Body.setAngularVelocity(balls[0], 0);
  };

  let calm = 0;
  return {
    afterUpdate() {
      const moving = balls.some((ball) => ball.speed > 0.35);
      calm = moving ? 0 : calm + 1;
      if (calm > 70) {
        pull();
        calm = 0;
      }
    },
    drawOverlay(ctx: CanvasRenderingContext2D) {
      ctx.strokeStyle = COLORS.ramp;
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(pins[0].x - 24, pins[0].y);
      ctx.lineTo(pins[pins.length - 1].x + 24, pins[0].y);
      ctx.stroke();
      ctx.strokeStyle = COLORS.string;
      ctx.lineWidth = 1.25;
      for (let index = 0; index < balls.length; index += 1) {
        ctx.beginPath();
        ctx.moveTo(pins[index].x, pins[index].y);
        ctx.lineTo(balls[index].position.x, balls[index].position.y);
        ctx.stroke();
      }
    },
  };
}

function buildStats(Matter: MatterApi, world: World) {
  const angle = 0.38;
  const length = 360;
  const center = { x: 318, y: 248 };
  const ramp = Matter.Bodies.rectangle(center.x, center.y, length, 8, {
    isStatic: true,
    angle,
    friction: 0.02,
    restitution: 0,
    label: "ramp",
    render: paint(COLORS.ramp),
  });
  const along = length / 2 - 30;
  const start = {
    x: center.x - Math.cos(angle) * along + Math.sin(angle) * 22,
    y: center.y - Math.sin(angle) * along - Math.cos(angle) * 22,
  };
  const ball = Matter.Bodies.circle(start.x, start.y, 14, {
    friction: 0.02,
    restitution: 0.05,
    frictionAir: 0.001,
    render: paint(COLORS.bronze),
  });
  Matter.Composite.add(world, [ramp, ball]);
  const samples: number[] = [];
  const reset = () => {
    Matter.Body.setPosition(ball, start);
    Matter.Body.setVelocity(ball, { x: 0, y: 0 });
    Matter.Body.setAngle(ball, 0);
    Matter.Body.setAngularVelocity(ball, 0);
  };
  return {
    afterUpdate() {
      samples.push(ball.speed);
      if (samples.length > 120) samples.shift();
      if (ball.position.x > WORLD.w - INSET - 20 || ball.position.y > WORLD.h - INSET - 18) reset();
    },
    drawOverlay(ctx: CanvasRenderingContext2D, fontFamily: string) {
      if (samples.length > 1) {
        const originX = WORLD.w - INSET - 168;
        const originY = INSET + 18;
        const width = 140;
        const height = 42;
        const max = 5;
        ctx.beginPath();
        samples.forEach((sample, index) => {
          const x = originX + (index / (samples.length - 1)) * width;
          const y = originY + height - (Math.min(max, sample) / max) * height;
          if (index === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = COLORS.mist;
        ctx.lineWidth = 1.7;
        ctx.stroke();
      }
      ctx.font = `600 18px ${fontFamily}`;
      ctx.fillStyle = COLORS.slate;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      const textX = Math.min(WORLD.w - INSET - 40, ball.position.x + (ball.circleRadius ?? 14) + 10);
      const textY = Math.min(WORLD.h - INSET - 18, ball.position.y + 18);
      ctx.fillText(ball.speed.toFixed(1), textX, textY);
    },
  };
}

function createRuntime(Matter: MatterApi, canvas: HTMLCanvasElement, id: ChallengeId, onCount?: (count: number) => void): SceneRuntime {
  const engine = Matter.Engine.create();
  const world = engine.world;
  engine.gravity.y = 1;
  engine.gravity.scale = 0.001;

  if (id !== "forces" && id !== "connect") addContainer(Matter, world, false);

  let afterUpdate: (() => void) | undefined;
  let drawOverlay: SceneRuntime["drawOverlay"];
  let addBody: (() => void) | undefined;
  let removeBody: (() => void) | undefined;
  let mouse: Mouse | undefined;
  let mouseConstraint: MouseConstraint | undefined;

  if (id === "gravity") afterUpdate = buildGravity(Matter, world);
  if (id === "shapes") afterUpdate = buildShapes(Matter, world);
  if (id === "drag") {
    const drag = buildDrag(Matter, engine, world, canvas);
    mouse = drag.mouse;
    mouseConstraint = drag.mouseConstraint;
  }
  if (id === "count") {
    const count = buildCount(Matter, world, onCount);
    addBody = count.addBody;
    removeBody = count.removeBody;
    drawOverlay = count.drawOverlay;
  }
  let flashes: Map<number, Flash> | undefined;
  if (id === "collision") {
    const collision = buildCollision(Matter, engine, world);
    flashes = collision.flashes;
    afterUpdate = collision.afterUpdate;
    drawOverlay = (ctx) => drawSparks(ctx, collision.sparks);
  }
  if (id === "forces") buildForces(Matter, engine, world);
  if (id === "connect") {
    const cradle = buildConnect(Matter, engine, world);
    afterUpdate = cradle.afterUpdate;
    drawOverlay = cradle.drawOverlay;
  }
  if (id === "stats") {
    const stats = buildStats(Matter, world);
    afterUpdate = stats.afterUpdate;
    drawOverlay = stats.drawOverlay;
  }

  return { engine, world, mouse, mouseConstraint, flashes, afterUpdate, drawOverlay, addBody, removeBody };
}

type PointerMouse = Mouse & {
  mousemove: EventListener;
  mousedown: EventListener;
  mouseup: EventListener;
  mousewheel: EventListener;
};

function unbindMouse(mouse: Mouse) {
  const pointer = mouse as Partial<PointerMouse>;
  const element = mouse.element;
  if (pointer.mousemove) {
    element.removeEventListener("mousemove", pointer.mousemove);
    element.removeEventListener("touchmove", pointer.mousemove);
  }
  if (pointer.mousedown) {
    element.removeEventListener("mousedown", pointer.mousedown);
    element.removeEventListener("touchstart", pointer.mousedown);
  }
  if (pointer.mouseup) {
    element.removeEventListener("mouseup", pointer.mouseup);
    element.removeEventListener("touchend", pointer.mouseup);
  }
  if (pointer.mousewheel) element.removeEventListener("wheel", pointer.mousewheel);
}

function isMatter(value: unknown): value is MatterApi {
  return typeof value === "object" && value !== null && typeof (value as MatterApi).Engine?.create === "function";
}

function resolveMatter(imported: { default?: unknown; Engine?: unknown }) {
  if (isMatter(imported)) return imported;
  if (isMatter(imported.default)) return imported.default;
  if (typeof imported.default === "object" && imported.default !== null && isMatter((imported.default as { default?: unknown }).default)) {
    return (imported.default as { default: MatterApi }).default;
  }
  throw new Error("Matter.js did not load");
}

export async function mountChallenge(
  canvas: HTMLCanvasElement,
  id: ChallengeId,
  options: MountOptions,
): Promise<SceneController> {
  const imported = await import("matter-js");
  if (options.isCancelled()) {
    return { sync() {}, destroy() {} };
  }
  const Matter = resolveMatter(imported);
  const known = CHALLENGES.some((challenge) => challenge.id === id);
  if (!known) return { sync() {}, destroy() {} };

  const ctx = canvas.getContext("2d");
  if (!ctx) return { sync() {}, destroy() {} };

  const runtime = createRuntime(Matter, canvas, id, options.onCount);
  let fontFamily = getComputedStyle(canvas).fontFamily || "Georgia, serif";
  const syncFont = () => {
    fontFamily = getComputedStyle(canvas).fontFamily || fontFamily;
  };
  void document.fonts?.ready.then(() => {
    if (!destroyed) syncFont();
  });

  let destroyed = false;
  let raf = 0;
  let last = performance.now();
  let accumulator = 0;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.round(rect.width * pixelRatio);
    const height = Math.round(rect.height * pixelRatio);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    if (runtime.mouse) runtime.mouse.pixelRatio = canvas.width / WORLD.w;
  };

  const emptyFlashes = new Map<number, Flash>();
  const draw = () => {
    if (canvas.width < 2) return;
    const scaleX = canvas.width / WORLD.w;
    const scaleY = canvas.height / WORLD.h;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    drawFrame(ctx);
    if (id === "connect") runtime.drawOverlay?.(ctx, fontFamily);
    const bodies = Matter.Composite.allBodies(runtime.world);
    drawBodies(ctx, bodies, runtime.flashes ?? emptyFlashes);
    if (id !== "connect") runtime.drawOverlay?.(ctx, fontFamily);
    if (id === "gravity") {
      const drip = bodies.find((body) => body.label === "drip");
      if (drip && drip.speed > 1.2) {
        const speed = drip.speed || 1;
        const nx = drip.velocity.x / speed;
        const ny = drip.velocity.y / speed;
        const mark = (drip.circleRadius ?? 12) + 8;
        const startX = drip.position.x - nx * mark;
        const startY = drip.position.y - ny * mark;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX - nx * 16, startY - ny * 16);
        ctx.strokeStyle = COLORS.slate;
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
    }
    if (runtime.mouseConstraint?.body) {
      const body = runtime.mouseConstraint.body;
      ctx.beginPath();
      ctx.moveTo(runtime.mouseConstraint.mouse.position.x, runtime.mouseConstraint.mouse.position.y);
      ctx.lineTo(body.position.x, body.position.y);
      ctx.strokeStyle = COLORS.bronze;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  };

  const loop = (now: number) => {
    if (destroyed) {
      raf = 0;
      return;
    }
    if (!options.getRunning() || document.hidden) {
      raf = 0;
      return;
    }
    const elapsed = Math.min(48, now - last);
    last = now;
    accumulator += elapsed;
    let steps = 0;
    while (accumulator >= STEP && steps < 3) {
      Matter.Engine.update(runtime.engine, STEP);
      runtime.afterUpdate?.();
      accumulator -= STEP;
      steps += 1;
    }
    draw();
    raf = requestAnimationFrame(loop);
  };

  const sync = () => {
    const shouldRun = options.getRunning() && !document.hidden && !destroyed;
    if (shouldRun && raf === 0) {
      last = performance.now();
      accumulator = 0;
      raf = requestAnimationFrame(loop);
    } else if (!shouldRun && raf !== 0) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  const onVisibility = () => sync();
  document.addEventListener("visibilitychange", onVisibility);
  const observer = new ResizeObserver(() => {
    resize();
    draw();
  });
  observer.observe(canvas);
  resize();
  draw();
  sync();

  return {
    sync,
    addBody: runtime.addBody,
    removeBody: runtime.removeBody,
    destroy() {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      document.removeEventListener("visibilitychange", onVisibility);
      observer.disconnect();
      if (runtime.mouse) unbindMouse(runtime.mouse);
      Matter.World.clear(runtime.world, false);
      Matter.Engine.clear(runtime.engine);
    },
  };
}
