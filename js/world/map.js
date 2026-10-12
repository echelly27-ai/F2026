// Static world: ground, zone dressing, and the initial resource nodes.
// Node ids are seeded so saves can restore how much is left in each pile.
import * as THREE from "three";
import { ZONES, WORLD } from "../config/balance.js?v=10";
import { mulberry32 } from "../core/util.js";

function mat(color, extra = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: extra.roughness ?? 0.92,
    metalness: extra.metalness ?? 0.02,
    emissive: extra.emissive ?? 0x000000,
    emissiveIntensity: extra.emissiveIntensity ?? 0,
    flatShading: true,
  });
}

function paintGround() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 1024;
  const g = c.getContext("2d");
  g.fillStyle = "#b7ab9b";
  g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 9000; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const shade = 120 + Math.random() * 50;
    g.fillStyle = `rgba(${shade},${shade - 8},${shade - 18},0.22)`;
    g.fillRect(x, y, 2, 2);
  }
  const toUV = (x, z) => ({
    u: ((x + WORLD.half) / (WORLD.half * 2)) * 1024,
    v: ((z + WORLD.half) / (WORLD.half * 2)) * 1024,
  });
  const blot = (x, z, w, h, color) => {
    const a = toUV(x, z);
    const b = toUV(x + w, z + h);
    g.fillStyle = color;
    g.fillRect(a.u, a.v, b.u - a.u, b.v - a.v);
  };
  blot(-46, -112, 92, 62, "rgba(62, 92, 58, 0.42)");
  blot(42, -36, 70, 78, "rgba(168, 156, 138, 0.45)");
  blot(-116, -40, 62, 86, "rgba(92, 84, 74, 0.28)");
  blot(-34, 48, 74, 64, "rgba(90, 96, 78, 0.28)");
  blot(48, -112, 64, 52, "rgba(48, 70, 74, 0.4)");
  blot(-18, -18, 36, 36, "rgba(196, 184, 164, 0.45)");
  blot(-118, 32, 236, 16, "rgba(42, 74, 82, 0.72)");
  g.strokeStyle = "rgba(74, 70, 64, 0.72)";
  g.lineWidth = 14;
  g.beginPath();
  g.moveTo(512, 512);
  const north = toUV(0, -90);
  g.lineTo(north.u, north.v);
  const east = toUV(80, 0);
  g.moveTo(512, 512);
  g.lineTo(east.u, east.v);
  const west = toUV(-90, 0);
  g.moveTo(512, 512);
  g.lineTo(west.u, west.v);
  const south = toUV(0, 80);
  g.moveTo(512, 512);
  g.lineTo(south.u, south.v);
  g.stroke();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function label(text) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 128;
  const g = c.getContext("2d");
  g.fillStyle = "rgba(22, 16, 12, 0.78)";
  g.fillRect(0, 0, 512, 128);
  g.strokeStyle = "#e39a4a";
  g.lineWidth = 6;
  g.strokeRect(8, 8, 496, 112);
  g.fillStyle = "#f4efe4";
  g.font = "700 46px Trebuchet MS, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, 256, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
  sprite.scale.set(10, 2.5, 1);
  return sprite;
}

function treeMesh() {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 2.5, 6), mat(0x6e5340));
  trunk.position.y = 1.25;
  trunk.castShadow = true;
  g.add(trunk);
  const canopy = new THREE.Mesh(new THREE.SphereGeometry(1.15, 8, 6), mat(0x5d7a48));
  canopy.position.y = 2.75;
  canopy.scale.y = 0.7;
  canopy.castShadow = true;
  g.add(canopy);
  return g;
}

function haussmann(group, blockers, cover, x, z, floors, ruined) {
  const stone = mat(ruined ? 0xcbb89f : 0xe7d7c4);
  const trim = mat(0x8d7358);
  const zinc = mat(0x3c444c, { metalness: 0.42, roughness: 0.5 });
  const glass = mat(0x243038, { emissive: 0x1a242c, emissiveIntensity: ruined ? 0.02 : 0.18, roughness: 0.25 });
  const iron = mat(0x2a2e32, { metalness: 0.55, roughness: 0.4 });
  const w = 6.4;
  const d = 5.2;
  const floorH = 1.05;
  const stories = ruined ? Math.max(2, floors - 1) : floors;
  const h = stories * floorH;
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), stone);
  body.position.set(x, h / 2, z);
  body.castShadow = true;
  body.receiveShadow = true;
  body.userData.cover = true;
  group.add(body);
  cover.push(body);
  blockers.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2, prop: true });
  const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.3, 0.45, d + 0.3), zinc);
  roof.position.set(x, h + 0.15, z);
  roof.castShadow = true;
  group.add(roof);
  const cap = new THREE.Mesh(new THREE.BoxGeometry(w * 0.62, 0.7, d * 0.62), zinc);
  cap.position.set(x, h + 0.7, z);
  group.add(cap);
  const chim = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.8, 0.35), trim);
  chim.position.set(x + 1.6, h + 1.15, z + 0.8);
  group.add(chim);
  const front = z > 0 ? -1 : 1;
  for (let row = 0; row < stories; row++) {
    for (let col = -1; col <= 1; col++) {
      if (ruined && row === stories - 1 && col === 1) continue;
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.85, 0.08), glass);
      win.position.set(x + col * 1.6, 0.7 + row * floorH, z + front * (d / 2 + 0.02));
      group.add(win);
    }
    const rail = new THREE.Mesh(new THREE.BoxGeometry(w * 0.86, 0.08, 0.12), iron);
    rail.position.set(x, 0.35 + row * floorH, z + front * (d / 2 + 0.16));
    group.add(rail);
  }
  if (ruined) {
    const rubble = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.45, 1.6), trim);
    rubble.position.set(x + 2.2, 0.22, z + front * 2.4);
    rubble.rotation.y = 0.4;
    group.add(rubble);
  }
}

function eiffel(group, x, z) {
  const iron = mat(0x6b5844, { metalness: 0.6, roughness: 0.42 });
  const leg = (lx, lz) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.45, 16, 0.45), iron);
    mesh.position.set(x + lx, 8, z + lz);
    mesh.rotation.z = -Math.sign(lx) * 0.22;
    mesh.rotation.x = Math.sign(lz) * 0.22;
    mesh.castShadow = true;
    group.add(mesh);
  };
  leg(-3.2, -3.2);
  leg(3.2, -3.2);
  leg(-3.2, 3.2);
  leg(3.2, 3.2);
  const deck = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.35, 7.2), iron);
  deck.position.set(x, 11.2, z);
  group.add(deck);
  const spire = new THREE.Mesh(new THREE.BoxGeometry(0.35, 6, 0.35), iron);
  spire.position.set(x, 16.5, z);
  group.add(spire);
  const broken = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.25, 0.25), iron);
  broken.position.set(x + 0.8, 18.6, z);
  broken.rotation.z = 0.8;
  group.add(broken);
}

function rockMesh() {
  const g = new THREE.Group();
  const m = new THREE.Mesh(new THREE.DodecahedronGeometry(0.7, 0), mat(0x8a8680));
  m.scale.set(1.1, 0.7, 0.9);
  m.position.y = 0.4;
  m.castShadow = true;
  m.rotation.y = Math.random();
  g.add(m);
  const m2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.4, 0), mat(0x6e6a64));
  m2.position.set(0.55, 0.3, 0.2);
  m2.castShadow = true;
  g.add(m2);
  return g;
}

function scrapMesh() {
  const g = new THREE.Group();
  const metal = mat(0x7d8c86, { metalness: 0.55, roughness: 0.45 });
  const a = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.25, 0.55), metal);
  a.position.y = 0.2;
  a.rotation.y = 0.4;
  a.castShadow = true;
  g.add(a);
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.55, 0.4), mat(0x5a4632));
  b.position.set(-0.35, 0.3, 0.2);
  b.castShadow = true;
  g.add(b);
  return g;
}

function cacheMesh() {
  const g = new THREE.Group();
  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.45, 0.5), mat(0x8a6232));
  chest.position.y = 0.28;
  chest.castShadow = true;
  g.add(chest);
  const lid = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.16, 0.54), mat(0xc47a3a, { emissive: 0x5a320c, emissiveIntensity: 0.35 }));
  lid.position.y = 0.55;
  g.add(lid);
  return g;
}

function crateMesh() {
  const g = new THREE.Group();
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 0.9), mat(0x6d7348));
  m.position.y = 0.35;
  m.castShadow = true;
  g.add(m);
  return g;
}

function scatter(rng, count, area, ok) {
  const out = [];
  let guard = 0;
  while (out.length < count && guard++ < count * 40) {
    const x = area.x + rng() * area.w;
    const z = area.z + rng() * area.h;
    if (ok && !ok(x, z)) continue;
    out.push({ x, z });
  }
  return out;
}

function pushNode(nodes, blockers, spec) {
  const id = spec.kind + "-" + nodes.length;
  let mesh;
  if (spec.kind === "wood") mesh = treeMesh();
  else if (spec.kind === "stone") mesh = rockMesh();
  else if (spec.kind === "metal") mesh = scrapMesh();
  else if (spec.kind === "gold") mesh = cacheMesh();
  else mesh = crateMesh();
  mesh.position.set(spec.x, 0, spec.z);
  const node = {
    id,
    kind: spec.kind,
    x: spec.x,
    z: spec.z,
    amount: spec.amount,
    max: spec.amount,
    respawn: spec.respawn,
    timer: 0,
    oneShot: !!spec.oneShot,
    mesh,
    label: spec.label,
    rarity: spec.rarity || "common",
    bonus: spec.bonus || null,
  };
  nodes.push(node);
  if (spec.kind === "wood") {
    blockers.push({ minX: spec.x - 0.4, maxX: spec.x + 0.4, minZ: spec.z - 0.4, maxZ: spec.z + 0.4, prop: true });
  }
  return node;
}

function ruins(group, blockers, cover, x, z, w, h, d, color) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
  m.position.set(x, h / 2, z);
  m.castShadow = true;
  m.receiveShadow = true;
  m.userData.cover = true;
  group.add(m);
  cover.push(m);
  blockers.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2, prop: true });
}

export function buildWorld(scene) {
  const rng = mulberry32(20260928);
  const group = new THREE.Group();
  group.name = "world";
  scene.add(group);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(WORLD.half * 2, WORLD.half * 2),
    new THREE.MeshStandardMaterial({ map: paintGround(), roughness: 1, metalness: 0 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  ground.name = "ground";
  group.add(ground);

  const blockers = [];
  const cover = [];
  const nodes = [];

  // Forest dressing is the harvestable trees themselves.
  const outsideCamp = (x, z) => Math.hypot(x, z) > 18;

  for (const p of scatter(rng, 42, ZONES[1], outsideCamp)) {
    pushNode(nodes, blockers, { kind: "wood", x: p.x, z: p.z, amount: 72, respawn: 16, label: "Chop plane tree" });
  }
  for (const p of scatter(rng, 26, ZONES[2], outsideCamp)) {
    pushNode(nodes, blockers, { kind: "stone", x: p.x, z: p.z, amount: 56, respawn: 22, label: "Mine stone" });
  }
  for (const p of scatter(rng, 20, ZONES[3], (x, z) => x < -52)) {
    pushNode(nodes, blockers, { kind: "metal", x: p.x, z: p.z, amount: 32, respawn: 36, label: "Salvage metal" });
  }
  for (const p of [
    [14, 8],
    [-14, 10],
    [16, -6],
    [12, 16],
    [-16, -8],
  ]) {
    pushNode(nodes, blockers, { kind: "wood", x: p[0], z: p[1], amount: 64, respawn: 14, label: "Chop plane tree" });
  }
  pushNode(nodes, blockers, { kind: "stone", x: -14, z: -6, amount: 48, respawn: 18, label: "Mine stone" });
  pushNode(nodes, blockers, { kind: "stone", x: 18, z: 12, amount: 48, respawn: 18, label: "Mine stone" });
  pushNode(nodes, blockers, { kind: "stone", x: 11, z: -16, amount: 48, respawn: 18, label: "Mine stone" });
  pushNode(nodes, blockers, { kind: "metal", x: 9, z: -12, amount: 24, respawn: 28, label: "Salvage metal" });
  pushNode(nodes, blockers, { kind: "metal", x: -8, z: 14, amount: 20, respawn: 28, label: "Salvage metal" });
  pushNode(nodes, blockers, {
    kind: "gold",
    x: 7,
    z: 12,
    amount: 350,
    respawn: 0,
    oneShot: true,
    label: "Open cache",
    rarity: "rare",
  });

  // A few treasure caches deeper in the map.
  for (const p of scatter(rng, 4, { x: -100, z: -20, w: 40, h: 50 }, () => true)) {
    pushNode(nodes, blockers, {
      kind: "gold",
      x: p.x,
      z: p.z,
      amount: 80 + Math.floor(rng() * 80),
      respawn: 0,
      oneShot: true,
      label: "Open cache",
      rarity: "uncommon",
    });
  }
  for (const p of scatter(rng, 5, ZONES[4], () => true)) {
    pushNode(nodes, blockers, {
      kind: "crate",
      x: p.x,
      z: p.z,
      amount: 1,
      respawn: 0,
      oneShot: true,
      label: "Search crate",
      rarity: "rare",
      bonus: { gold: 120, parts: 2, ammo: "rifle", rounds: 40 },
    });
  }
  for (const p of scatter(rng, 4, ZONES[5], () => true)) {
    pushNode(nodes, blockers, {
      kind: "metal",
      x: p.x,
      z: p.z,
      amount: 24,
      respawn: 90,
      label: "Salvage cells",
      rarity: "epic",
    });
  }

  for (const n of nodes) group.add(n.mesh);

  // Pale limestone cut above the eastern quarry.
  ruins(group, blockers, cover, 78, 8, 16, 7, 8, 0xd2c6b4);
  ruins(group, blockers, cover, 96, -8, 10, 5, 18, 0xc4b8a4);
  ruins(group, blockers, cover, 70, 28, 8, 4, 8, 0xddd2c0);

  // Haussmann blocks around the courtyard, with a south gap so the gate stays a road.
  const street = [
    [-18, -28, 5, false],
    [-6, -28, 6, false],
    [8, -28, 5, true],
    [20, -28, 4, false],
    [-28, -12, 5, false],
    [-28, 2, 4, true],
    [-28, 16, 5, false],
    [28, -14, 6, false],
    [28, 0, 5, true],
    [28, 16, 4, false],
    [-20, 30, 5, true],
    [18, 30, 5, false],
  ];
  for (const [x, z, floors, ruined] of street) haussmann(group, blockers, cover, x, z, floors, ruined);

  const cityBlocks = [
    [-78, -16, 6, true],
    [-92, -2, 7, false],
    [-70, 8, 5, true],
    [-88, 20, 6, false],
    [-104, 6, 5, true],
  ];
  for (const [x, z, floors, ruined] of cityBlocks) haussmann(group, blockers, cover, x, z, floors, ruined);

  eiffel(group, 86, -96);

  // Les Invalides, low and scarred, south of the Seine.
  ruins(group, blockers, cover, -10, 70, 14, 3, 6, 0xc8bfae);
  ruins(group, blockers, cover, 12, 78, 8, 2.2, 10, 0xb7ad9c);
  ruins(group, blockers, cover, 4, 62, 4, 1.2, 7, 0x8a7d6c);
  const fenceMat = mat(0x8a9284, { metalness: 0.3 });
  for (let i = 0; i < 8; i++) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.6, 0.25), fenceMat);
    post.position.set(-20 + i * 3.2, 0.8, 52);
    post.castShadow = true;
    group.add(post);
  }

  // Blackglass lab shell (the player's own lab building is separate)
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(7, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    mat(0x1c3a38, { emissive: 0x12302c, emissiveIntensity: 0.4, roughness: 0.35, metalness: 0.2 })
  );
  dome.position.set(78, 0, -88);
  dome.userData.cover = true;
  group.add(dome);
  cover.push(dome);
  ruins(group, blockers, cover, 78, -88, 8, 2, 8, 0x243836);
  ruins(group, blockers, cover, 92, -78, 5, 4, 5, 0x1a2828);

  for (const zone of ZONES) {
    if (zone.id === "camp") continue;
    const sign = label(zone.name.toUpperCase());
    sign.position.set(zone.x + zone.w / 2, 4.5, zone.z + Math.min(6, zone.h / 2));
    group.add(sign);
  }

  // Plot pad, resized when the base tier changes.
  const plot = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshStandardMaterial({ color: 0xc4a36a, transparent: true, opacity: 0.16, roughness: 1 })
  );
  plot.rotation.x = -Math.PI / 2;
  plot.position.y = 0.03;
  plot.receiveShadow = true;
  group.add(plot);

  const starsGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(180 * 3);
  for (let i = 0; i < 180; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * 0.7;
    const r = 90;
    starPos[i * 3] = Math.cos(theta) * Math.cos(phi) * r;
    starPos[i * 3 + 1] = 30 + Math.sin(phi) * r;
    starPos[i * 3 + 2] = Math.sin(theta) * Math.cos(phi) * r;
  }
  group.traverse((o) => {
    o.castShadow = false;
  });
  ground.receiveShadow = true;

  starsGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  const stars = new THREE.Points(
    starsGeo,
    new THREE.PointsMaterial({ color: 0xf4efe4, size: 0.6, transparent: true, opacity: 0 })
  );
  scene.add(stars);

  return { group, ground, nodes, blockers, cover, plot, stars };
}

export function hideNode(node, hidden) {
  node.mesh.visible = !hidden;
}
