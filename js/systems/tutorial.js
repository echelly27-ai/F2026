// Guided opening. Markers are world positions; the HUD draws the words.
import * as THREE from "three";

const STEPS = [
  {
    id: "move",
    text: "Click the view, then look with the mouse. WASD walks. The opening is straight ahead.",
  },
  {
    id: "wood",
    text: "Walk up to a pine and hold E to chop wood.",
  },
  {
    id: "stone",
    text: "Hold E on a grey rock to gather stone. The quarry east has much more.",
  },
  {
    id: "metal",
    text: "Scrap piles give metal. Salvage the pile near camp.",
  },
  {
    id: "gold",
    text: "Open the glowing cache, or drop the shambler, to earn gold.",
  },
  {
    id: "wall",
    text: "Press B for build mode. Look at open ground until the ghost is green, then left-click.",
  },
  {
    id: "defense",
    text: "Build a Barricade or a Watchtower. Crawlers slip under barricades — walls stop them.",
  },
  {
    id: "weapon",
    text: "Press G and buy the Pistol. The first sidearm is discounted.",
  },
  {
    id: "wave",
    text: "Nights bring waves. Survive wave 1. Press T if you want them early. Repair with F.",
  },
  {
    id: "upgrade",
    text: "Press U to open base upgrades. Stronger forts unlock weapons, turrets, and the map.",
  },
];

export class Tutorial {
  constructor(game) {
    this.game = game;
    this.index = 0;
    this.done = false;
    this.sawUpgrade = false;
    this.arrow = new THREE.Mesh(
      new THREE.ConeGeometry(0.35, 0.9, 5),
      new THREE.MeshStandardMaterial({ color: 0xff7a32, emissive: 0xff5a18, emissiveIntensity: 0.8 })
    );
    this.arrow.rotation.x = Math.PI;
    game.scene.add(this.arrow);
  }

  allowsWaves() {
    // Lessons keep talking, but the first night is not locked behind them.
    return true;
  }

  current() {
    if (this.done) return null;
    return STEPS[this.index] || null;
  }

  skip() {
    this.done = true;
    this.arrow.visible = false;
    this.game.notify("Lessons skipped. The nights will not skip you.", "bad");
  }

  check() {
    if (this.done) return;
    const step = STEPS[this.index];
    if (!step) {
      this.done = true;
      return;
    }
    const s = this.game.stats;
    let pass = false;
    if (step.id === "move") pass = this.game.player.traveled > 7;
    if (step.id === "wood") pass = (s.wood || 0) >= 8;
    if (step.id === "stone") pass = (s.stone || 0) >= 5;
    if (step.id === "metal") pass = (s.metal || 0) >= 3;
    if (step.id === "gold") pass = (s.goldEarned || 0) >= 40;
    if (step.id === "wall") pass = (s.built.wood_wall || 0) + (s.built.stone_wall || 0) + (s.built.wood_gate || 0) >= 1;
    if (step.id === "defense") {
      pass = ["barricade", "watchtower", "stone_tower", "mg_turret", "electric_fence"].some((id) => (s.built[id] || 0) > 0);
    }
    if (step.id === "weapon") pass = this.game.armory.owned.includes("pistol");
    if (step.id === "wave") pass = (s.wavesCleared || 0) >= 1;
    if (step.id === "upgrade") pass = this.sawUpgrade || this.game.progression.tier >= 1;
    if (!pass) return;
    this.index += 1;
    this.game.audio.play("ui");
    if (this.index >= STEPS.length) {
      this.done = true;
      this.arrow.visible = false;
      this.game.inventory.add("gold", 50);
      this.game.notify("You know the work. Hold the pyre.", "good");
    }
  }

  marker() {
    const step = this.current();
    if (!step) return null;
    const nodes = this.game.resources.nodes;
    const find = (kind) => nodes.find((n) => n.kind === kind && n.amount > 0 && n.mesh.visible);
    if (step.id === "wood") {
      const n = find("wood");
      return n ? { x: n.x, z: n.z } : null;
    }
    if (step.id === "stone") {
      const n = find("stone");
      return n ? { x: n.x, z: n.z } : null;
    }
    if (step.id === "metal") {
      const n = find("metal");
      return n ? { x: n.x, z: n.z } : null;
    }
    if (step.id === "gold") {
      const n = nodes.find((node) => node.kind === "gold" && node.amount > 0);
      return n ? { x: n.x, z: n.z } : { x: 12, z: 16 };
    }
    if (step.id === "wall" || step.id === "defense") return { x: -1, z: 9 };
    if (step.id === "upgrade") return { x: 0, z: 0 };
    return null;
  }

  update(dt) {
    if (this.game.state !== "play") {
      this.arrow.visible = false;
      return;
    }
    this.check();
    const m = this.marker();
    if (!m || this.done) {
      this.arrow.visible = false;
      return;
    }
    this.arrow.visible = true;
    this.arrow.position.set(m.x, 2.4 + Math.sin(this.game.time * 3) * 0.2, m.z);
    void dt;
  }

  serialize() {
    return { index: this.index, done: this.done, sawUpgrade: this.sawUpgrade };
  }

  hydrate(data) {
    if (!data) return;
    this.index = data.index || 0;
    this.done = !!data.done;
    this.sawUpgrade = !!data.sawUpgrade;
  }
}

export { STEPS };
