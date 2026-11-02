// Eight Matter.js worlds, one per challenge. A single frame loop steps them all.
(function () {
  if (!window.Matter) {
    document.body.insertAdjacentHTML(
      "beforeend",
      "<p class='error'>Matter.js did not load. Serve this folder so vendor/matter.min.js can be read.</p>"
    );
    return;
  }

  const {
    Engine,
    Render,
    Bodies,
    Body,
    Composite,
    Events,
    Mouse,
    MouseConstraint,
    Constraint
  } = Matter;

  const W = 360;
  const H = 300;
  const STAGE = "#e7eef3";
  const SLATE = "#3e4c59";
  const SLATE_MID = "#667684";
  const SLATE_LIGHT = "#95a4ae";
  const BRONZE = "#8d5e34";
  const BRONZE_SOFT = "#c4a36c";
  const LINE = "#8d9aa4";

  const scenes = [];

  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function disc(x, y, r, options) {
    return Bodies.polygon(x, y, 26, r, options);
  }

  function boot(stage, gravityY) {
    const engine = Engine.create();
    engine.gravity.y = gravityY;
    engine.gravity.scale = 0.001;

    const render = Render.create({
      element: stage,
      engine,
      options: {
        width: W,
        height: H,
        wireframes: false,
        background: STAGE,
        pixelRatio: Math.min(window.devicePixelRatio || 1, 2)
      }
    });
    Render.setPixelRatio(render, render.options.pixelRatio);

    scenes.push({ engine, render });
    return { engine, world: engine.world, render, w: W, h: H };
  }

  function addWalls(world, w, h, extras) {
    const t = 80;
    const options = Object.assign(
      {
        isStatic: true,
        friction: 0.35,
        restitution: 0.05,
        render: { visible: false }
      },
      extras || {}
    );
    Composite.add(world, [
      Bodies.rectangle(w / 2, h + t / 2, w * 2, t, options),
      Bodies.rectangle(w / 2, -t / 2, w * 2, t, options),
      Bodies.rectangle(-t / 2, h / 2, t, h * 3, options),
      Bodies.rectangle(w + t / 2, h / 2, t, h * 3, options)
    ]);
  }

  function addMouse(engine, render, stiffness) {
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness,
        damping: 0.12,
        render: { visible: false }
      }
    });
    Composite.add(engine.world, mouseConstraint);
    render.mouse = mouse;
    // Wheel handling calls preventDefault and would trap page scrolling.
    render.canvas.removeEventListener("wheel", mouse.mousewheel);
    return mouseConstraint;
  }

  function paint(color) {
    return { fillStyle: color };
  }

  // 1. A world, a floor, and bodies that fall into a pile.
  function setupGravity(stage) {
    const { engine, world, w, h } = boot(stage, 1);
    addWalls(world, w, h, { friction: 0.45, restitution: 0.02 });
    const rand = rng(2026);

    for (let i = 0; i < 46; i++) {
      const r = 6 + rand() * 3.2;
      const x = 16 + rand() * (w - 32);
      const y = h * 0.55 - i * 7.2 - rand() * 10;
      const bronze = x > w * 0.48 && rand() < 0.62;
      const color = bronze ? BRONZE : rand() < 0.2 ? SLATE_MID : SLATE;
      Composite.add(
        world,
        disc(x, y, r, {
          restitution: 0.08,
          friction: 0.35,
          density: 0.002,
          render: paint(color)
        })
      );
    }

    const drips = [];
    let wait = 0;
    Events.on(engine, "afterUpdate", () => {
      wait += engine.timing.lastDelta;
      if (wait < 1600) return;
      wait = 0;
      if (drips.length > 5) Composite.remove(world, drips.shift());
      const drop = disc(w * 0.38 + rand() * 70, -10, 5.5, {
        restitution: 0.12,
        friction: 0.3,
        density: 0.002,
        render: paint(rand() < 0.45 ? BRONZE : SLATE)
      });
      drips.push(drop);
      Composite.add(world, drop);
    });
  }

  // 2. Circles, rectangles, and polygons in the same world.
  function setupTypes(stage) {
    const { world, w, h } = boot(stage, 0.85);
    addWalls(world, w, h, { friction: 0.4, restitution: 0.15 });

    const pieces = [
      disc(78, 54, 12, { render: paint(SLATE) }),
      disc(168, 42, 7, { render: paint(BRONZE) }),
      Bodies.rectangle(268, 58, 30, 30, { render: paint(SLATE) }),
      Bodies.rectangle(318, 118, 16, 16, { render: paint(SLATE_MID) }),
      disc(196, 108, 10, { render: paint(BRONZE_SOFT) }),
      disc(112, 132, 15, { render: paint(SLATE_MID) }),
      Bodies.rectangle(250, 168, 24, 24, { render: paint(BRONZE) }),
      Bodies.polygon(74, 196, 3, 16, { render: paint(SLATE) }),
      disc(168, 214, 6, { render: paint(SLATE) }),
      Bodies.rectangle(292, 214, 34, 14, { render: paint(SLATE_LIGHT) }),
      disc(40, 168, 8, { render: paint(BRONZE) })
    ];

    for (const body of pieces) {
      body.restitution = 0.2;
      body.friction = 0.35;
      body.density = 0.002;
    }
    Composite.add(world, pieces);
  }

  // 3. MouseConstraint lets you pick up the squares.
  function setupDrag(stage) {
    const { engine, world, render, w } = boot(stage, 1);
    addWalls(world, w, H, { friction: 0.8, restitution: 0 });

    const railY = 196;
    const size = 48;
    Composite.add(world, [
      Bodies.rectangle(w / 2, railY, 268, 3, {
        isStatic: true,
        friction: 0.85,
        render: paint(LINE)
      }),
      Bodies.rectangle(112, railY - size / 2 - 4, size, size, {
        friction: 0.5,
        restitution: 0.02,
        chamfer: { radius: 2 },
        render: paint(BRONZE)
      }),
      Bodies.rectangle(246, railY - size / 2 - 2, 44, 44, {
        friction: 0.5,
        restitution: 0.02,
        chamfer: { radius: 2 },
        render: paint("#3a4652")
      })
    ]);

    addMouse(engine, render, 0.22);
  }

  // 4. Buttons add and remove bodies while the world keeps running.
  function setupCount(stage) {
    const { world, w, h } = boot(stage, 1);
    addWalls(world, w, h, { friction: 0.4, restitution: 0.08 });
    const rand = rng(30);
    const bodies = [];
    const badge = stage.querySelector("[data-count]");

    function sync() {
      badge.textContent = String(bodies.length);
    }

    function addBody(x, y, radius) {
      if (bodies.length >= 72) return;
      const body = disc(x, y, radius, {
        restitution: 0.16,
        friction: 0.28,
        density: 0.002,
        render: paint(rand() < 0.18 ? BRONZE : rand() < 0.35 ? SLATE_MID : SLATE)
      });
      bodies.push(body);
      Composite.add(world, body);
      sync();
    }

    for (let i = 0; i < 30; i++) {
      const col = i % 8;
      const row = Math.floor(i / 8);
      const x = 26 + col * ((w - 52) / 7) + (rand() - 0.5) * 8;
      const y = -12 - row * 22;
      addBody(x, y, 6.4 + rand() * 2.4);
    }

    function removeBody() {
      if (!bodies.length) return;
      let index = 0;
      for (let i = 1; i < bodies.length; i++) {
        if (bodies[i].position.y < bodies[index].position.y) index = i;
      }
      const [body] = bodies.splice(index, 1);
      Composite.remove(world, body);
      sync();
    }

    hold(stage.querySelector("[data-add]"), () => {
      addBody(30 + rand() * (w - 60), -18, 6.4 + rand() * 2.6);
    });
    hold(stage.querySelector("[data-remove]"), removeBody);
  }

  function hold(button, action) {
    let timer = null;
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      action();
      stop();
      timer = setInterval(action, 120);
    });
    button.addEventListener("pointerup", stop);
    button.addEventListener("pointerleave", stop);
    button.addEventListener("pointercancel", stop);
  }

  // 5. collisionStart flashes the bodies and draws a mark at the contact.
  function setupCollision(stage) {
    const { engine, world, render, w, h } = boot(stage, 0.8);
    addWalls(world, w, h, { friction: 0, restitution: 0.94 });
    const rand = rng(5);

    const specs = [
      [64, 48, 15, SLATE],
      [140, 36, 9, SLATE_MID],
      [230, 58, 13, BRONZE],
      [310, 44, 8, SLATE],
      [96, 120, 11, SLATE_LIGHT],
      [188, 130, 16, SLATE],
      [286, 118, 7, BRONZE_SOFT],
      [54, 200, 10, SLATE_MID],
      [160, 214, 12, SLATE],
      [268, 206, 9, SLATE]
    ];

    const balls = specs.map(([x, y, r, color]) => {
      const body = disc(x, y, r, {
        restitution: 0.97,
        friction: 0,
        frictionAir: 0.0015,
        density: 0.002,
        render: paint(color)
      });
      body.plugin.base = color;
      Body.setVelocity(body, {
        x: (rand() - 0.5) * 6,
        y: (rand() - 0.5) * 4
      });
      return body;
    });

    Composite.add(world, balls);
    Composite.add(world, [
      Bodies.rectangle(w * 0.7, h * 0.3, 58, 3, {
        isStatic: true,
        angle: -0.55,
        restitution: 1,
        friction: 0,
        render: paint("#f4f1ea")
      }),
      Bodies.rectangle(w * 0.58, h * 0.46, 40, 3, {
        isStatic: true,
        angle: 0.45,
        restitution: 1,
        friction: 0,
        render: paint("#f7f4ee")
      })
    ]);

    const impacts = [];
    Events.on(engine, "collisionStart", (event) => {
      const now = performance.now();
      for (const pair of event.pairs) {
        for (const body of [pair.bodyA, pair.bodyB]) {
          if (!body.isStatic) body.plugin.flashUntil = now + 150;
        }
        const support = pair.collision.supports && pair.collision.supports[0];
        if (!support || impacts.length > 30) continue;
        impacts.push({
          x: support.x,
          y: support.y,
          nx: pair.collision.normal.x,
          ny: pair.collision.normal.y,
          born: now
        });
      }
    });

    let stir = 0;
    Events.on(engine, "afterUpdate", () => {
      const now = performance.now();
      let energy = 0;
      for (const body of balls) {
        energy += body.speed;
        body.render.fillStyle =
          now < (body.plugin.flashUntil || 0) ? "#f1d7ae" : body.plugin.base;
      }
      stir += 1;
      if (stir < 220) return;
      stir = 0;
      if (energy < 6) {
        const body = balls[(rand() * balls.length) | 0];
        Body.setVelocity(body, { x: (rand() < 0.5 ? -1 : 1) * 5, y: -4 });
      }
    });

    Events.on(render, "afterRender", () => {
      const ctx = render.context;
      const now = performance.now();
      ctx.save();
      ctx.lineCap = "round";
      for (let i = impacts.length - 1; i >= 0; i--) {
        const mark = impacts[i];
        const t = (now - mark.born) / 260;
        if (t >= 1) {
          impacts.splice(i, 1);
          continue;
        }
        const angle = Math.atan2(mark.ny, mark.nx);
        ctx.strokeStyle = `rgba(186, 148, 96, ${0.9 - t})`;
        ctx.lineWidth = 1.7;
        ctx.beginPath();
        ctx.arc(
          mark.x,
          mark.y,
          7 + t * 12,
          angle + Math.PI - 1.1,
          angle + Math.PI + 1.1
        );
        ctx.stroke();
      }
      ctx.restore();
    });
  }

  // 6. World gravity is off. Body.applyForce pulls every orb toward the center.
  function setupForces(stage) {
    const { engine, world, w, h } = boot(stage, 0);
    const cx = w / 2;
    const cy = h / 2 + 2;
    const orbs = [];
    const total = 18;

    for (let i = 0; i < total; i++) {
      const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
      const radius = 36 + (i % 5) * 20;
      const r = i % 6 === 0 ? 7 : 4.4;
      const color = i % 6 === 0 ? BRONZE_SOFT : i % 3 === 0 ? SLATE_MID : SLATE;
      const body = disc(
        cx + Math.cos(angle) * radius,
        cy + Math.sin(angle) * radius,
        r,
        {
          frictionAir: 0,
          friction: 0,
          restitution: 0.1,
          collisionFilter: { group: -1 },
          render: paint(color)
        }
      );
      const speed = Math.sqrt(26 / radius);
      Body.setVelocity(body, {
        x: -Math.sin(angle) * speed,
        y: Math.cos(angle) * speed
      });
      orbs.push(body);
    }

    Composite.add(world, orbs);
    Composite.add(
      world,
      disc(cx, cy, 16, {
        isStatic: true,
        render: paint(BRONZE)
      })
    );

    // GM is tuned in pixels/frame so the starting tangential speed is an orbit.
    const GM = 26;
    Events.on(engine, "beforeUpdate", () => {
      const dt2 = (1000 / 60) * (1000 / 60);
      for (const body of orbs) {
        const dx = cx - body.position.x;
        const dy = cy - body.position.y;
        const dist = Math.hypot(dx, dy) || 1;
        const accel = GM / (dist * dist);
        const magnitude = (body.mass * accel) / dt2;
        Body.applyForce(body, body.position, {
          x: (dx / dist) * magnitude,
          y: (dy / dist) * magnitude
        });
      }
    });
  }

  // 7. Constraints are the strings. The raised ball is released into the row.
  function setupConnect(stage) {
    const { engine, world, render, w } = boot(stage, 1);
    engine.positionIterations = 25;
    engine.velocityIterations = 18;

    const count = 5;
    const size = 16;
    const length = 150;
    const gap = size * 1.9;
    const yPin = 42;
    const startX = w / 2 - ((count - 1) * gap) / 2;
    const balls = [];

    Composite.add(
      world,
      Bodies.rectangle(w / 2, yPin, (count - 1) * gap + 28, 3, {
        isStatic: true,
        render: paint("#9aa6af")
      })
    );

    for (let i = 0; i < count; i++) {
      const x = startX + i * gap;
      const ball = disc(x, yPin + length, size, {
        inertia: Infinity,
        restitution: 1,
        friction: 0,
        frictionAir: 0.001,
        slop: 0.4,
        density: 0.05,
        render: paint(i === 0 ? BRONZE : SLATE)
      });
      const string = Constraint.create({
        pointA: { x, y: yPin },
        bodyB: ball,
        stiffness: 0.98,
        damping: 0.02,
        length,
        render: {
          visible: true,
          lineWidth: 1.25,
          strokeStyle: "#7d8b96",
          type: "line",
          anchors: false
        }
      });
      Composite.add(world, [ball, string]);
      balls.push(ball);
    }

    const lifted = {
      x: startX - Math.sin(0.95) * length,
      y: yPin + Math.cos(0.95) * length
    };

    function lift() {
      Body.setPosition(balls[0], lifted);
      Body.setVelocity(balls[0], { x: 0, y: 0 });
      Body.setAngularVelocity(balls[0], 0);
    }

    lift();
    const mouseConstraint = addMouse(engine, render, 0.14);
    let elapsed = 0;
    Events.on(engine, "afterUpdate", () => {
      if (mouseConstraint.body) {
        elapsed = 0;
        return;
      }
      elapsed += engine.timing.lastDelta;
      if (elapsed > 5600) {
        lift();
        elapsed = 0;
      }
    });
  }

  // 8. Read body.speed each update and draw it as a number plus a sparkline.
  function setupStats(stage) {
    const { engine, world, w, h } = boot(stage, 1);
    addWalls(world, w, h, { friction: 0.05, restitution: 0.1 });

    const angle = 0.42;
    const length = 250;
    const cx = 176;
    const cy = 168;
    const ramp = Bodies.rectangle(cx, cy, length, 6, {
      isStatic: true,
      angle,
      friction: 0.04,
      render: paint("#7f8d97")
    });

    const startAlong = -length / 2 + 34;
    const start = {
      x: cx + Math.cos(angle) * startAlong + Math.sin(angle) * 16,
      y: cy + Math.sin(angle) * startAlong - Math.cos(angle) * 16
    };
    const ball = disc(start.x, start.y, 11, {
      friction: 0.02,
      frictionAir: 0.004,
      restitution: 0.05,
      render: paint(SLATE)
    });
    Composite.add(world, [ramp, ball]);

    const readout = stage.querySelector("[data-speed]");
    const spark = stage.querySelector("[data-spark]");
    const samples = [];
    let frames = 0;

    function reset() {
      Body.setPosition(ball, start);
      Body.setVelocity(ball, { x: 0.15, y: 0 });
      Body.setAngularVelocity(ball, 0);
    }

    Events.on(engine, "afterUpdate", () => {
      if (ball.position.x > w - 18 || ball.position.y > h - 16) reset();
      frames += 1;
      if (frames % 2 !== 0) return;
      samples.push(ball.speed);
      if (samples.length > 42) samples.shift();
      const speed = ball.speed;
      readout.textContent = speed.toFixed(1);
      stage.dataset.speed = speed.toFixed(1);
      const peak = Math.max(1, ...samples);
      spark.setAttribute(
        "points",
        samples
          .map((value, index) => {
            const x = samples.length < 2 ? 0 : (index / (samples.length - 1)) * 72;
            const y = 20 - (value / peak) * 16;
            return `${x.toFixed(1)},${y.toFixed(1)}`;
          })
          .join(" ")
      );
    });
  }

  const mounts = [
    ["stage-gravity", setupGravity],
    ["stage-types", setupTypes],
    ["stage-drag", setupDrag],
    ["stage-count", setupCount],
    ["stage-collision", setupCollision],
    ["stage-forces", setupForces],
    ["stage-connect", setupConnect],
    ["stage-stats", setupStats]
  ];

  for (const [id, setup] of mounts) {
    const stage = document.getElementById(id);
    try {
      setup(stage);
    } catch (error) {
      console.error(id, error);
      stage.insertAdjacentHTML(
        "beforeend",
        `<p class="error">${error.message}</p>`
      );
    }
  }

  function frame() {
    requestAnimationFrame(frame);
    if (document.hidden) return;
    for (const scene of scenes) {
      Engine.update(scene.engine, 1000 / 60);
      Render.world(scene.render);
    }
  }

  requestAnimationFrame(frame);
})();
