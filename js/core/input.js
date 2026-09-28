// Keyboard and mouse state. The cursor stays visible so build menus and the
// shop can be clicked. Hold the right mouse button to look around.

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = {};
    this.pressed = {};
    this.looking = false;
    this.primary = false;
    this.primaryPressed = false;
    this.primaryReleased = false;
    this.mx = window.innerWidth / 2;
    this.my = window.innerHeight / 2;
    this.wheel = 0;
    this.lookX = 0;
    this.lookY = 0;
    this._onKeyDown = (e) => this.onKey(e, true);
    this._onKeyUp = (e) => this.onKey(e, false);
    this._onMouseDown = (e) => this.onMouseDown(e);
    this._onMouseUp = (e) => this.onMouseUp(e);
    this._onMove = (e) => this.onMove(e);
    this._onWheel = (e) => {
      this.wheel += Math.sign(e.deltaY);
      e.preventDefault();
    };
    this._onContext = (e) => e.preventDefault();
    window.addEventListener("keydown", this._onKeyDown);
    window.addEventListener("keyup", this._onKeyUp);
    window.addEventListener("mouseup", this._onMouseUp);
    window.addEventListener("mousemove", this._onMove);
    canvas.addEventListener("mousedown", this._onMouseDown);
    canvas.addEventListener("wheel", this._onWheel, { passive: false });
    canvas.addEventListener("contextmenu", this._onContext);
    window.addEventListener("blur", () => {
      this.keys = {};
      this.looking = false;
      this.primary = false;
    });
  }

  onKey(e, down) {
    const tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    const k = e.key.toLowerCase();
    if ([" ", "tab", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k) || e.code === "Space") {
      e.preventDefault();
    }
    if (down) {
      if (!this.keys[k]) {
        this.pressed[k] = true;
        if (e.code && e.code.startsWith("Digit")) this.pressed[e.code] = true;
      }
      this.keys[k] = true;
    } else {
      this.keys[k] = false;
    }
  }

  onMouseDown(e) {
    if (e.button === 2) this.looking = true;
    if (e.button === 0) {
      this.primary = true;
      this.primaryPressed = true;
    }
  }

  onMouseUp(e) {
    if (e.button === 2) this.looking = false;
    if (e.button === 0) {
      this.primary = false;
      this.primaryReleased = true;
    }
  }

  onMove(e) {
    this.mx = e.clientX;
    this.my = e.clientY;
    if (this.looking) {
      this.lookX += e.movementX;
      this.lookY += e.movementY;
    }
  }

  // NDC aim. While turning with the right mouse, shots leave from screen center.
  aimNdc() {
    if (this.looking) return { x: 0, y: 0 };
    const r = this.canvas.getBoundingClientRect();
    return {
      x: ((this.mx - r.left) / r.width) * 2 - 1,
      y: -((this.my - r.top) / r.height) * 2 + 1,
    };
  }

  down(k) {
    return !!this.keys[k.toLowerCase()];
  }

  edge(k) {
    return !!this.pressed[k.toLowerCase()];
  }

  digitEdge() {
    for (let i = 1; i <= 9; i++) {
      if (this.pressed["Digit" + i]) return i;
    }
    return 0;
  }

  endFrame() {
    this.pressed = {};
    this.primaryPressed = false;
    this.primaryReleased = false;
    this.wheel = 0;
    this.lookX = 0;
    this.lookY = 0;
  }
}
