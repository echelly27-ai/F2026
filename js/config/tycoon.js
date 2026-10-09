// Roblox-style yard: a dropper spits gold, and each pad buys one structure.
// Pad cells are where the player stands. Build cells are where the part appears.
import { CELL } from "../core/util.js";

export function cellCenter(gx, gz) {
  return { x: (gx + 0.5) * CELL, z: (gz + 0.5) * CELL };
}

export const DROPPER = {
  gx: 0,
  gz: -2,
  dirX: 1,
  dirZ: 0,
  interval: 0.85,
  amount: 18,
  maxLoose: 24,
  first: 0.4,
};

// Stand still briefly so sprinting across a pad does not spend gold.
export const PAD_DWELL = 0.34;

export const PADS = [
  { id: "wall-n2", name: "Wood Wall", price: 70, building: "wood_wall", gx: -2, gz: -3, padGx: -1, padGz: -3 },
  { id: "wall-n1", name: "Wood Wall", price: 70, building: "wood_wall", gx: 1, gz: -3, padGx: 1, padGz: -2 },
  { id: "wall-w1", name: "Wood Wall", price: 70, building: "wood_wall", gx: -3, gz: -1, padGx: -2, padGz: -1 },
  { id: "wall-w2", name: "Wood Wall", price: 70, building: "wood_wall", gx: -3, gz: 0, padGx: -2, padGz: 0 },
  { id: "wall-e1", name: "Wood Wall", price: 70, building: "wood_wall", gx: 3, gz: 0, padGx: 2, padGz: 0 },
  { id: "wall-nw", name: "Wood Wall", price: 70, building: "wood_wall", gx: -3, gz: -3, padGx: -3, padGz: -2 },
  { id: "wall-ne", name: "Wood Wall", price: 70, building: "wood_wall", gx: 3, gz: -3, padGx: 3, padGz: -2 },
  { id: "wall-sw", name: "Wood Wall", price: 70, building: "wood_wall", gx: -3, gz: 3, padGx: -2, padGz: 3 },
  { id: "wall-se", name: "Wood Wall", price: 70, building: "wood_wall", gx: 3, gz: 3, padGx: 2, padGz: 3 },
  { id: "tower", name: "Watchtower", price: 160, building: "watchtower", gx: 3, gz: -1, padGx: 2, padGz: -1 },
  { id: "barricade", name: "Barricade", price: 55, building: "barricade", gx: 3, gz: 2, padGx: 3, padGz: 1 },
  { id: "fire", name: "Campfire", price: 90, building: "campfire", gx: -2, gz: -2, padGx: -1, padGz: -2 },
];
