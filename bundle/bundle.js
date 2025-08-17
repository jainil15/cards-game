// src/asset-loader.ts
class AssetLoader {
  static instance;
  cache = new Map;
  constructor() {}
  loadImage(src) {
    return new Promise((resolve, reject) => {
      if (this.cache.has(src)) {
        resolve(this.cache.get(src));
      }
      const image = new Image;
      image.src = src;
      image.onload = () => {
        this.cache.set(src, image);
        resolve(image);
      };
      image.onerror = reject;
    });
  }
  static getInstance() {
    if (!AssetLoader.instance) {
      AssetLoader.instance = new AssetLoader;
    }
    return AssetLoader.instance;
  }
}

// src/event-handler.ts
class EventHandler {
  static instance = null;
  canvas;
  gameObjects = [];
  dragging = false;
  startPos = new Vector(0, 0);
  currentPos = new Vector(0, 0);
  draggingObject = null;
  static DRAG_THRESHOLD = 5;
  static getInstance(canvas) {
    if (!EventHandler.instance) {
      EventHandler.instance = new EventHandler(canvas);
    }
    return EventHandler.instance;
  }
  constructor(canvas) {
    this.canvas = canvas;
    this.canvas.addEventListener("mousedown", (event) => {
      this.startPos = new Vector(event.offsetX, event.offsetY);
      this.currentPos = this.startPos;
      this.dragging = false;
      this.draggingObject = null;
      const rect = this.canvas.getBoundingClientRect();
      const pos = new Vector(event.clientX - rect.left, event.clientY - rect.top);
      for (let i = this.gameObjects.length - 1;i >= 0; i--) {
        if (pos.x >= this.gameObjects[i].pos.x && pos.x <= this.gameObjects[i].pos.x + this.gameObjects[i].dimensions.x && pos.y >= this.gameObjects[i].pos.y && pos.y <= this.gameObjects[i].pos.y + this.gameObjects[i].dimensions.y) {
          this.draggingObject = this.gameObjects[i];
          return;
        }
      }
      return;
    });
    this.canvas.addEventListener("mousemove", (event) => {
      if (this.dragging && this.draggingObject) {
        this.handleDrag(event);
        return;
      }
      this.currentPos = new Vector(event.offsetX, event.offsetY);
      if (!this.dragging && this.draggingObject && Math.abs(this.currentPos.x - this.startPos.x) > EventHandler.DRAG_THRESHOLD || Math.abs(this.currentPos.y - this.startPos.y) > EventHandler.DRAG_THRESHOLD) {
        this.dragging = true;
      }
    });
    this.canvas.addEventListener("mouseup", (event) => {
      this.dragging = false;
      this.draggingObject = null;
      if (this.dragging) {
        return;
      }
      this.handleClick(event);
    });
  }
  addGameObject(gameObject) {
    this.gameObjects.push(gameObject);
  }
  handleClick(event) {
    if (this.dragging) {
      return;
    }
    const rect = this.canvas.getBoundingClientRect();
    const pos = new Vector(event.clientX - rect.left, event.clientY - rect.top);
    for (let i = this.gameObjects.length - 1;i >= 0; i--) {
      if (pos.x >= this.gameObjects[i].pos.x && pos.x <= this.gameObjects[i].pos.x + this.gameObjects[i].dimensions.x && pos.y >= this.gameObjects[i].pos.y && pos.y <= this.gameObjects[i].pos.y + this.gameObjects[i].dimensions.y) {
        this.gameObjects[i].onClick?.();
        return;
      }
    }
  }
  handleDrag(event) {
    const rect = this.canvas.getBoundingClientRect();
    const pos = new Vector(event.clientX - rect.left, event.clientY - rect.top);
    this.draggingObject?.onDrag?.(pos);
  }
}

// src/game.ts
class Game {
  canvas;
  ctx;
  cards;
  lastTimestamp = 0;
  eventHandler;
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = null;
    if (!this.canvas) {
      throw new Error(`Canvas with id ${canvasId} not found.`);
    }
    this.canvas.width = 800;
    this.canvas.height = 800;
    this.ctx = this.canvas.getContext("2d");
    if (!this.ctx) {
      throw new Error("Failed to get canvas context.");
    }
    this.eventHandler = EventHandler.getInstance(this.canvas);
    const card = new Card(new Vector(100, 100), "A", "hearts");
    const card2 = new Card(new Vector(159, 100), "A", "clubs");
    this.cards = [];
    this.eventHandler.addGameObject(card);
    this.cards.push(card);
    this.eventHandler.addGameObject(card2);
    this.cards.push(card2);
  }
  start() {
    this.gameLoop(0);
  }
  gameLoop(timestamp) {
    if (this.ctx) {
      const delta = timestamp - (this.lastTimestamp || timestamp);
      this.lastTimestamp = timestamp;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      for (const card of this.cards) {
        card.update(this.ctx, delta);
        card.draw(this.ctx);
      }
      requestAnimationFrame((t) => this.gameLoop(t));
    } else {
      console.error("Canvas context is not available.");
    }
  }
}
class Card {
  rank;
  suit;
  faceUp = true;
  pos;
  faceTextue = null;
  rotation = 0;
  dimensions;
  animationTime = 0;
  startAnimation = true;
  constructor(pos, rank, suit) {
    this.suit = suit;
    this.rank = rank;
    this.pos = pos;
    this.dimensions = new Vector(100, 150);
    Promise.all([
      AssetLoader.getInstance().loadImage(`../assets/${this.rank}_of_${this.suit}.svg`)
    ]).then(([face]) => {
      this.faceTextue = face;
    }).catch((error) => {
      console.log(error);
    });
  }
  draw(ctx) {
    if (!this.faceTextue) {
      console.log("Texture not loaded yet.");
      return;
    }
    ctx.save();
    ctx.translate(this.pos.x + this.dimensions.x / 2, this.pos.y + this.dimensions.y / 2);
    ctx.rotate(this.rotation);
    ctx.drawImage(this.faceTextue, -this.dimensions.x / 2, -this.dimensions.y / 2, this.dimensions.x, this.dimensions.y);
    ctx.restore();
  }
  update(ctx, delta) {
    if (this.startAnimation) {
      this.wiggle();
    }
  }
  onClick() {
    console.log(`Card clicked: ${this.rank} of ${this.suit}`);
    this.startAnimation = true;
    this.animationTime = 0;
    this.wiggle();
  }
  onDrag(pos) {
    this.pos.x = pos.x;
    this.pos.y = pos.y;
  }
  wiggle() {
    if (this.animationTime >= 30) {
      this.rotation = 0;
      this.startAnimation = false;
      return;
    }
    this.animationTime += 1;
    const wiggleSpeed = 0.2;
    const wiggleAmplitude = 0.3;
    this.rotation = Math.sin(this.animationTime * wiggleSpeed) * wiggleAmplitude;
  }
}

class Vector {
  x;
  y;
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  add(vector) {
    return new Vector(this.x + vector.x, this.y + vector.y);
  }
  subtract(vector) {
    return new Vector(this.x - vector.x, this.y - vector.y);
  }
  multiply(scalar) {
    return new Vector(this.x * scalar, this.y * scalar);
  }
}

// index.ts
window.onload = () => {
  const game = new Game("game");
  game.start();
};
