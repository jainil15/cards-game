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

// src/game.ts
class Game {
  canvas;
  ctx;
  cards;
  lastTimestamp = 0;
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
    const card = new Card(new Vector(100, 100), "A", "hearts");
    this.cards = [];
    this.cards.push(card);
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
  cardWidth = 100;
  cardHeight = 140;
  animationTime = 0;
  startAnimation = true;
  constructor(pos, rank, suit) {
    this.suit = suit;
    this.rank = rank;
    this.pos = pos;
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
    ctx.translate(this.pos.x + this.cardWidth / 2, this.pos.y + this.cardHeight / 2);
    ctx.rotate(this.rotation);
    ctx.drawImage(this.faceTextue, -this.cardWidth / 2, -this.cardHeight / 2, this.cardWidth, this.cardHeight);
    ctx.restore();
  }
  update(ctx, delta) {
    if (this.startAnimation) {
      this.wiggle(ctx);
    }
  }
  wiggle(ctx) {
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
}

// index.ts
window.onload = () => {
  const game = new Game("game");
  game.start();
};
