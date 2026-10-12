// Static world: ground, zone dressing, and the initial resource nodes.
// Node ids are seeded so saves can restore how much is left in each pile.
import * as THREE from "three";
import { ZONES, WORLD } from "../config/balance.js?v=11";
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
  g.fillStyle = "#3e4a38";
  g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 8000; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const shade = 40 + Math.random() * 40;
    g.fillStyle = `rgba(${shade},${shade + 10},${shade - 6},0.28)`;
    g.fillRect(x, y, 3, 3);
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
  blot(-46, -112, 92, 62, "rgba(28, 48, 32, 0.55)");
  blot(42, -36, 70, 78, "rgba(70, 66, 60, 0.45)");
  blot(-116, -40, 62, 86, "rgba(48, 44, 40, 0.45)");
  blot(-34, 48, 74, 64, "rgba(46, 58, 42, 0.35)");
  blot(48, -112, 64, 52, "rgba(24, 40, 38, 0.5)");
  blot(-16, -16, 32, 32, "rgba(62, 52, 36, 0.4)");
  g.strokeStyle = "rgba(42, 36, 28, 0.7)";
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

const SCENERY = {
  bark: mat(0x1a1410),
  bare: mat(0x3d3228),
  pine: mat(0x1a3426),
  pineHi: mat(0x243e2e),
  stone: mat(0x3a3632),
  stoneDark: mat(0x221e1b),
  stoneChip: mat(0x514c46),
};
const TRUNK_GEO = new THREE.CylinderGeometry(0.18, 0.42, 1, 5);
const BRANCH_GEO = new THREE.BoxGeometry(1, 0.09, 0.09);
const TIP_GEO = new THREE.ConeGeometry(0.16, 1.1, 4);
const SPIKE_GEO = new THREE.ConeGeometry(0.2, 1, 4);

function treeMesh() {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.36, 2.4, 5), SCENERY.bark);
  trunk.position.y = 1.2;
  trunk.rotation.z = (Math.random() - 0.5) * 0.2;
  trunk.castShadow = true;
  g.add(trunk);
  const low = new THREE.Mesh(new THREE.ConeGeometry(1.35, 1.85, 6), SCENERY.pine);
  low.position.y = 2.25;
  low.castShadow = true;
  g.add(low);
  const top = new THREE.Mesh(new THREE.ConeGeometry(0.95, 1.45, 6), SCENERY.pineHi);
  top.position.y = 3.2;
  top.castShadow = true;
  g.add(top);
  const snag = new THREE.Mesh(BRANCH_GEO, SCENERY.bare);
  snag.scale.set(1.7, 1, 1);
  snag.position.set(0.35, 2.55, 0);
  snag.rotation.z = 0.55;
  g.add(snag);
  return g;
}

function deadPine(group, blockers, x, z, scale, lean) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(TRUNK_GEO, SCENERY.bark);
  const height = 4.8 * scale;
  trunk.scale.set(scale, height, scale);
  trunk.position.y = height * 0.5;
  trunk.castShadow = true;
  g.add(trunk);
  const arms = 6;
  for (let i = 0; i < arms; i++) {
    const branch = new THREE.Mesh(BRANCH_GEO, SCENERY.bare);
    branch.scale.x = (1.15 + (i % 3) * 0.55) * scale;
    branch.position.set(0, (1.15 + i * 0.62) * scale, 0);
    branch.rotation.y = i * 1.05 + x * 0.17;
    branch.rotation.z = (i % 2 ? 1.05 : -0.85) + lean;
    g.add(branch);
  }
  const tip = new THREE.Mesh(TIP_GEO, SCENERY.bark);
  tip.scale.set(scale, scale * 1.35, scale);
  tip.position.y = height + 0.15 * scale;
  tip.rotation.z = lean * 1.6;
  g.add(tip);
  g.position.set(x, 0, z);
  g.rotation.z = lean;
  g.rotation.y = z * 0.17;
  group.add(g);
  blockers.push({ minX: x - 0.35, maxX: x + 0.35, minZ: z - 0.35, maxZ: z + 0.35, prop: true });
}

function jaggedRock(group, blockers, x, z, scale) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.DodecahedronGeometry(0.58 * scale, 0), SCENERY.stone);
  body.scale.set(1.55, 0.9, 1.2);
  body.position.y = 0.4 * scale;
  body.castShadow = true;
  g.add(body);
  for (let i = 0; i < 3; i++) {
    const spike = new THREE.Mesh(SPIKE_GEO, SCENERY.stoneDark);
    spike.scale.set(scale, 1.15 * scale, scale);
    spike.position.set((i - 1) * 0.32 * scale, 0.85 * scale, (i % 2) * 0.18 * scale);
    spike.rotation.z = (i - 1) * 0.4;
    spike.rotation.x = (i - 1) * 0.2;
    g.add(spike);
  }
  const chip = new THREE.Mesh(new THREE.DodecahedronGeometry(0.26 * scale, 0), SCENERY.stoneChip);
  chip.position.set(-0.4 * scale, 0.22 * scale, 0.22 * scale);
  g.add(chip);
  g.position.set(x, 0, z);
  g.rotation.y = x + z;
  group.add(g);
  if (scale > 1.15) {
    blockers.push({
      minX: x - 0.5 * scale,
      maxX: x + 0.5 * scale,
      minZ: z - 0.45 * scale,
      maxZ: z + 0.45 * scale,
      prop: true,
    });
  }
}

function rockMesh() {
  const g = new THREE.Group();
  const m = new THREE.Mesh(new THREE.DodecahedronGeometry(0.75, 0), mat(0x4a4642));
  m.scale.set(1.25, 0.75, 1);
  m.position.y = 0.4;
  m.castShadow = true;
  m.rotation.y = Math.random();
  g.add(m);
  const spike = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.7, 5), mat(0x2e2b28));
  spike.position.set(0.25, 0.75, 0.1);
  spike.rotation.z = -0.4;
  spike.castShadow = true;
  g.add(spike);
  const m2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.38, 0), mat(0x5a554e));
  m2.position.set(0.6, 0.28, 0.15);
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
    pushNode(nodes, blockers, { kind: "wood", x: p.x, z: p.z, amount: 72, respawn: 16, label: "Chop pine" });
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
    pushNode(nodes, blockers, { kind: "wood", x: p[0], z: p[1], amount: 64, respawn: 14, label: "Chop pine" });
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

  const clearOfCamp = (x, z) => {
    if (Math.hypot(x, z) < 12) return false;
    if (Math.abs(x) < 7 && z > 7 && z < 46) return false;
    return true;
  };
  for (const p of scatter(rng, 86, { x: -64, z: -56, w: 128, h: 112 }, clearOfCamp)) {
    deadPine(group, blockers, p.x, p.z, 1.05 + rng() * 0.9, (rng() - 0.5) * 0.55);
  }
  for (const p of scatter(rng, 30, ZONES[1], clearOfCamp)) {
    deadPine(group, blockers, p.x, p.z, 1.25 + rng() * 0.75, (rng() - 0.5) * 0.4);
  }
  const snags = [
    [-14, -2, 1.8, 0.22],
    [15, -2, 1.95, -0.2],
    [-16, 4, 1.55, 0.28],
    [17, 6, 1.7, -0.22],
    [-10, -16, 1.9, 0.12],
    [18, -14, 1.6, -0.26],
    [22, -8, 1.45, 0.18],
    [-20, 0, 1.75, -0.16],
    [4, -20, 1.85, 0.08],
    [-4, -18, 1.55, -0.18],
    [24, 14, 1.5, 0.2],
    [-22, 16, 1.65, -0.12],
  ];
  for (const [x, z, scale, lean] of snags) deadPine(group, blockers, x, z, scale, lean);
  for (const p of scatter(rng, 40, { x: -42, z: -34, w: 92, h: 76 }, clearOfCamp)) {
    jaggedRock(group, blockers, p.x, p.z, 0.9 + rng() * 1.35);
  }
  const boulders = [
    [-12, 3, 1.55],
    [13, 1, 1.45],
    [16, -11, 1.7],
    [-16, -11, 1.4],
    [7, -17, 1.35],
    [-18, 14, 1.5],
    [12, 18, 1.3],
    [-9, 16, 1.2],
  ];
  for (const [x, z, scale] of boulders) jaggedRock(group, blockers, x, z, scale);
  for (const p of scatter(rng, 18, ZONES[2], () => true)) {
    jaggedRock(group, blockers, p.x, p.z, 1.05 + rng() * 1.4);
  }

  // Quarry cliff
  ruins(group, blockers, cover, 78, 8, 16, 7, 8, 0x6a655e);
  ruins(group, blockers, cover, 96, -8, 10, 5, 18, 0x5a554e);
  ruins(group, blockers, cover, 70, 28, 8, 4, 8, 0x736e66);

  const citySpots = [
    [-70, -10, 8, 6, 8],
    [-86, 6, 10, 9, 7],
    [-78, 22, 7, 4, 9],
    [-100, -8, 9, 7, 6],
    [-96, 18, 6, 5, 6],
    [-64, 8, 5, 3, 5],
  ];
  for (const [x, z, w, h, d] of citySpots) ruins(group, blockers, cover, x, z, w, h, d, 0x6a6058);

  // Fort Halden
  ruins(group, blockers, cover, -10, 70, 14, 3, 6, 0x667062);
  ruins(group, blockers, cover, 12, 78, 8, 2.2, 10, 0x5c6858);
  ruins(group, blockers, cover, 4, 62, 4, 1.2, 7, 0x4a4036);
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
