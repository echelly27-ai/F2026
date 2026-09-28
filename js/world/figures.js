// Original low-poly people. The warden and the blighted share a builder so
// silhouettes stay consistent and cheap to spawn.
import * as THREE from "three";

function mat(color, extra = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: extra.roughness ?? 0.78,
    metalness: extra.metalness ?? 0.04,
    emissive: extra.emissive ?? 0x000000,
    emissiveIntensity: extra.emissiveIntensity ?? 0,
    flatShading: true,
  });
}

function box(parent, w, h, d, x, y, z, material) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

export function buildWarden() {
  const g = new THREE.Group();
  const cloth = mat(0x6e3b2e);
  const clothDark = mat(0x4a261c);
  const skin = mat(0xd7b294);
  const scarf = mat(0xe07030);
  const metal = mat(0xc9c3b2, { metalness: 0.4, roughness: 0.45 });
  const boot = mat(0x2a211c);

  box(g, 0.34, 0.42, 0.34, -0.12, 0.22, 0, boot);
  box(g, 0.34, 0.42, 0.34, 0.12, 0.22, 0, boot);
  box(g, 0.28, 0.46, 0.28, -0.12, 0.62, 0, clothDark);
  box(g, 0.28, 0.46, 0.28, 0.12, 0.62, 0, clothDark);
  const torso = box(g, 0.62, 0.7, 0.38, 0, 1.12, 0, cloth);
  torso.name = "torso";
  box(g, 0.66, 0.18, 0.42, 0, 1.38, 0, scarf);
  box(g, 0.16, 0.42, 0.16, 0.18, 1.15, 0.16, scarf);
  const head = box(g, 0.36, 0.36, 0.36, 0, 1.72, 0, skin);
  head.name = "head";
  box(g, 0.4, 0.12, 0.42, 0, 1.94, 0, clothDark);
  box(g, 0.12, 0.08, 0.08, 0, 1.7, -0.2, mat(0x2a211c));
  const armL = box(g, 0.16, 0.55, 0.16, -0.4, 1.12, 0, cloth);
  const armR = new THREE.Group();
  armR.position.set(0.4, 1.28, 0);
  armR.name = "armR";
  const armMesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.52, 0.16), cloth);
  armMesh.position.set(0, -0.2, 0);
  armMesh.castShadow = true;
  armR.add(armMesh);
  g.add(armR);
  g.add(armL);
  const weapon = new THREE.Group();
  weapon.name = "weapon";
  weapon.position.set(0.08, -0.42, -0.1);
  armR.add(weapon);
  g.userData.weaponMount = weapon;
  g.userData.armR = armR;
  g.traverse((o) => {
    o.castShadow = true;
  });
  return g;
}

export function setWeaponVisual(mount, weaponId) {
  while (mount.children.length) mount.remove(mount.children[0]);
  const wood = mat(0x8a5a32);
  const iron = mat(0xd0d4d8, { metalness: 0.65, roughness: 0.35 });
  const dark = mat(0x2c3034, { metalness: 0.3, roughness: 0.5 });
  const glow = mat(0xff7a32, { emissive: 0xff5a1a, emissiveIntensity: 0.8 });
  const add = (w, h, d, x, y, z, m) => box(mount, w, h, d, x, y, z, m);
  switch (weaponId) {
    case "pistol":
      add(0.08, 0.14, 0.28, 0, 0, -0.1, dark);
      add(0.07, 0.16, 0.08, 0, -0.1, 0.02, dark);
      break;
    case "shotgun":
      add(0.08, 0.08, 0.7, 0, 0, -0.25, dark);
      add(0.09, 0.1, 0.22, 0, -0.02, 0.08, wood);
      break;
    case "sniper":
      add(0.06, 0.06, 0.95, 0, 0.04, -0.35, dark);
      add(0.08, 0.1, 0.2, 0, -0.04, 0.02, wood);
      add(0.08, 0.08, 0.16, 0, 0.1, -0.05, dark);
      break;
    case "lmg":
      add(0.1, 0.12, 0.72, 0, 0, -0.22, dark);
      add(0.16, 0.18, 0.16, 0, -0.12, 0.02, dark);
      break;
    case "rocket":
      add(0.16, 0.16, 0.7, 0, 0, -0.2, mat(0x6a7048));
      add(0.1, 0.1, 0.2, 0, 0, -0.55, iron);
      break;
    case "energy":
    case "plasma":
      add(0.1, 0.1, 0.62, 0, 0, -0.2, dark);
      add(0.06, 0.06, 0.12, 0, 0, -0.52, glow);
      break;
    case "rifle":
    case "advrifle":
    case "smg":
      add(0.07, 0.08, weaponId === "smg" ? 0.42 : 0.62, 0, 0, -0.2, dark);
      add(0.08, 0.14, 0.1, 0, -0.1, 0.02, dark);
      break;
    default:
      add(0.1, 0.1, 0.72, 0, 0, -0.2, wood);
      add(0.14, 0.14, 0.16, 0, 0, -0.52, wood);
      break;
  }
}

export function buildZombie(def) {
  const g = new THREE.Group();
  const skin = mat(def.skin);
  const cloth = mat(def.cloth);
  const eyeMat = mat(def.eye, { emissive: def.eye, emissiveIntensity: 0.9, roughness: 0.4 });
  const armorMat = mat(0x8a9298, { metalness: 0.55, roughness: 0.4 });
  const h = def.height || 1.7;
  const bulk = def.bulk || 1;
  const thin = def.thin ? 0.75 : 1;
  const crawler = !!def.crawler;
  const bodyW = 0.42 * bulk * thin;
  const bodyH = crawler ? 0.28 : h * 0.38;
  const bodyY = crawler ? 0.28 : h * 0.48;
  const headY = crawler ? 0.42 : h * 0.78;

  if (!crawler) {
    box(g, 0.16 * bulk, h * 0.28, 0.16, -0.12 * bulk, h * 0.16, 0, cloth);
    box(g, 0.16 * bulk, h * 0.28, 0.16, 0.12 * bulk, h * 0.16, 0, cloth);
  }
  const body = box(g, bodyW, bodyH, 0.28 * bulk, 0, bodyY, 0, def.armored ? armorMat : cloth);
  body.name = "body";
  const head = box(g, 0.3 * (def.mouth ? 1.2 : 1), 0.3, 0.3, 0, headY, crawler ? 0.2 : 0, skin);
  head.name = "head";
  box(g, 0.06, 0.06, 0.06, -0.08, headY + 0.04, -0.16, eyeMat);
  box(g, 0.06, 0.06, 0.06, 0.08, headY + 0.04, -0.16, eyeMat);

  const reach = crawler ? 0.55 : 0.62 * (def.thin ? 1.25 : 1);
  const armY = crawler ? 0.3 : h * 0.52;
  box(g, 0.1, 0.12, reach, -bodyW * 0.7, armY, -reach * 0.35, skin);
  box(g, 0.1, 0.12, reach, bodyW * 0.7, armY, -reach * 0.35, skin);
  if (def.extraArm) box(g, 0.1, 0.12, reach * 0.8, bodyW * 0.3, armY + 0.18, -0.2, skin);

  if (def.sac || def.core) {
    const sac = new THREE.Mesh(
      new THREE.SphereGeometry(def.core ? 0.28 : 0.34, 8, 6),
      mat(def.core ? 0xff5a2a : 0xc6e06a, {
        emissive: def.core ? 0xff3a10 : 0x668820,
        emissiveIntensity: 0.7,
      })
    );
    sac.position.set(0, bodyY + 0.05, 0.22);
    sac.castShadow = true;
    sac.name = "sac";
    g.add(sac);
  }
  if (def.armored) {
    box(g, bodyW * 1.05, 0.12, 0.32 * bulk, 0, bodyY + bodyH * 0.35, 0, armorMat);
    box(g, 0.34, 0.08, 0.34, 0, headY + 0.16, 0, armorMat);
  }
  if (def.staff) {
    box(g, 0.06, h * 0.9, 0.06, 0.34, h * 0.45, -0.1, mat(0x22262c));
    const gem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.12),
      mat(0x9ad7ff, { emissive: 0x66bbff, emissiveIntensity: 1 })
    );
    gem.position.set(0.34, h * 0.92, -0.1);
    g.add(gem);
  }
  if (def.mouth) {
    box(g, 0.22, 0.08, 0.06, 0, headY - 0.08, -0.16, mat(0x4a2030));
  }

  g.userData.eyeMat = eyeMat;
  const s = def.scale || 1;
  if (crawler) g.scale.set(s, s, s);
  return g;
}

export { mat };
