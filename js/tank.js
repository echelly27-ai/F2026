const SpecimenTank = (() => {
  const MAX_BODIES = 180;
  const COLORS = {
    protein: "#4ea8ff",
    carbs: "#ff9a3c",
    fats: "#c084fc",
    produce: "#4ade80"
  };

  let engine;
  let world;
  let render;
  let mouseConstraint;
  let stage;
  let walls = [];
  let samples = [];
  let queue = [];
  let wait = 0;
  let running = false;
  let onCount = null;

  function boot(element, countHandler) {
    if (!window.Matter) {
      element.insertAdjacentHTML(
        "beforeend",
        "<p class='tank-empty'>Matter.js did not load. Serve this folder so vendor/matter.min.js can be read.</p>"
      );
      return;
    }

    stage = element;
    onCount = countHandler;

    const { Engine, Render, Composite, Events, Mouse, MouseConstraint } = Matter;
    engine = Engine.create();
    engine.gravity.y = 1;
    engine.gravity.scale = 0.001;
    engine.enableSleeping = true;
    engine.positionIterations = 8;
    engine.velocityIterations = 6;
    world = engine.world;

    const size = measure();
    render = Render.create({
      element: stage,
      engine,
      options: {
        width: size.w,
        height: size.h,
        wireframes: false,
        background: "transparent",
        wireframeBackground: "transparent",
        pixelRatio: Math.min(window.devicePixelRatio || 1, 2)
      }
    });
    Render.setPixelRatio(render, render.options.pixelRatio);
    render.canvas.style.background = "transparent";

    addWalls(size.w, size.h);
    addMouse();

    Events.on(render, "afterRender", paintSamples);
    Events.on(engine, "afterUpdate", () => {
      flushQueue();
      settleBodies();
    });

    window.addEventListener("resize", onResize);
    if (window.ResizeObserver) {
      const observer = new ResizeObserver(() => onResize());
      observer.observe(stage);
    }
    running = true;
    frame();
  }

  function measure() {
    const rect = stage.getBoundingClientRect();
    return {
      w: Math.max(280, Math.floor(rect.width)),
      h: Math.max(360, Math.floor(rect.height))
    };
  }

  function addWalls(w, h) {
    const { Bodies, Composite } = Matter;
    if (walls.length) Composite.remove(world, walls);
    const t = 70;
    const opts = {
      isStatic: true,
      friction: 0.95,
      frictionStatic: 1,
      restitution: 0,
      render: { visible: false }
    };
    walls = [
      Bodies.rectangle(w / 2, h + t / 2 - 12, w + 40, t, opts),
      Bodies.rectangle(w / 2, -t / 2, w + 40, t, opts),
      Bodies.rectangle(-t / 2 + 12, h / 2, t, h * 2, opts),
      Bodies.rectangle(w + t / 2 - 12, h / 2, t, h * 2, opts)
    ];
    Composite.add(world, walls);
  }

  function addMouse() {
    const { Mouse, MouseConstraint, Composite } = Matter;
    const mouse = Mouse.create(render.canvas);
    mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.18,
        damping: 0.12,
        render: { visible: false }
      }
    });
    Composite.add(world, mouseConstraint);
    render.mouse = mouse;
    mouse.pixelRatio = render.options.pixelRatio || 1;
    render.canvas.removeEventListener("wheel", mouse.mousewheel);
  }

  function paintSamples() {
    const ctx = render.context;
    ctx.save();
    for (const body of samples) {
      if (!body) continue;
      const { x, y } = body.position;
      const r = body.circleRadius || 8;
      const c = body.plugin.color;
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(x, y, r * 2.15, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 0.92;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 0.38;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(x - r * 0.32, y - r * 0.34, r * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function flushQueue() {
    wait += engine.timing.lastDelta || 16.6;
    const gap = queue.length > 40 ? 8 : 22;
    if (!queue.length || wait < gap) return;
    wait = 0;
    dropOne(queue.shift());
  }

  function particleCount(calories) {
    return Math.min(36, Math.max(3, Math.round(calories / 28)));
  }

  function enqueueMeal(meal) {
    const n = particleCount(meal.calories);
    const room = Math.max(0, MAX_BODIES - samples.length - queue.length);
    const count = Math.max(meal.calories >= 1 ? 2 : 0, Math.min(n, room));
    for (let i = 0; i < count; i++) {
      queue.push(meal);
    }
    report();
  }

  function dropOne(meal) {
    const { Bodies, Body, Composite } = Matter;
    const w = render.options.width;
    const color = COLORS[meal.category] || COLORS.protein;
    const r = 6.2 + Math.random() * 4.4;
    const x = w * 0.5 + (Math.random() - 0.5) * w * 0.52;
    const body = Bodies.circle(x, 22 + Math.random() * 16, r, {
      restitution: 0.04,
      friction: 0.85,
      frictionStatic: 1,
      frictionAir: 0.05,
      density: 0.002,
      slop: 0.02,
      sleepThreshold: 20,
      render: { visible: false }
    });
    body.plugin.sample = true;
    body.plugin.color = color;
    body.plugin.mealId = meal.id;
    Body.setVelocity(body, { x: 0, y: 0.4 });
    Body.setAngularVelocity(body, 0);
    samples.push(body);
    Composite.add(world, body);
    if (samples.length > MAX_BODIES) {
      const oldest = samples.shift();
      Composite.remove(world, oldest);
    }
    report();
  }

  function removeMeal(id) {
    const { Composite } = Matter;
    const keep = [];
    for (const body of samples) {
      if (body.plugin.mealId === id) Composite.remove(world, body);
      else keep.push(body);
    }
    samples = keep;
    queue = queue.filter((m) => m.id !== id);
    report();
  }

  function clearAll() {
    const { Composite } = Matter;
    for (const body of samples) Composite.remove(world, body);
    samples = [];
    queue = [];
    report();
  }

  function loadMeals(meals) {
    clearAll();
    for (const meal of meals) enqueueMeal(meal);
  }

  function report() {
    if (onCount) onCount(samples.length + queue.length);
  }

  function settleBodies() {
    const { Body, Sleeping } = Matter;
    for (const body of samples) {
      if (!body || body.isSleeping) continue;
      if (body.speed < 0.12 && Math.abs(body.angularVelocity) < 0.04) {
        Body.setVelocity(body, { x: 0, y: 0 });
        Body.setAngularVelocity(body, 0);
        if (Sleeping) Sleeping.set(body, true);
      }
    }
  }

  function onResize() {
    if (!render) return;
    const { w, h } = measure();
    if (Math.abs(w - render.options.width) < 2 && Math.abs(h - render.options.height) < 2) return;
    render.options.width = w;
    render.options.height = h;
    Matter.Render.setPixelRatio(render, Math.min(window.devicePixelRatio || 1, 2));
    addWalls(w, h);
  }

  function frame() {
    requestAnimationFrame(frame);
    if (!running || document.hidden || !engine) return;
    Matter.Engine.update(engine, 1000 / 60);
    Matter.Render.world(render);
  }

  return { boot, enqueueMeal, removeMeal, loadMeals, clearAll, particleCount };
})();
