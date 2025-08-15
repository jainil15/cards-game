import { AssetLoader } from "./asset-loader";

export class Game {
	private canvas: HTMLCanvasElement;
	public ctx: CanvasRenderingContext2D | null;
	private cards: Card[];
	private lastTimestamp: number = 0;

	constructor(canvasId: string) {
		this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
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
	public start(): void {
		this.gameLoop(0);
	}
	public gameLoop(timestamp: number): void {
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

interface GameObject {
	draw(ctx: CanvasRenderingContext2D): void;
	update(ctx: CanvasRenderingContext2D, delta: number): void;
}
export type Suit = "spades" | "clubs" | "diamonds" | "hearts";
export type Rank =
	| "A"
	| "K"
	| "Q"
	| "J"
	| "10"
	| "9"
	| "8"
	| "7"
	| "6"
	| "5"
	| "4"
	| "3"
	| "2";

export class Card implements GameObject {
	rank: Rank;
	suit: Suit;
	faceUp: boolean = true;
	pos: Vector;
	faceTextue: HTMLImageElement | null = null;
	rotation: number = 0;
	cardWidth: number = 100;
	cardHeight: number = 140;
	animationTime: number = 0;
	startAnimation: boolean = true;
	public constructor(pos: Vector, rank: Rank, suit: Suit) {
		this.suit = suit;
		this.rank = rank;
		this.pos = pos;
		Promise.all([
			AssetLoader.getInstance().loadImage(
				`../assets/${this.rank}_of_${this.suit}.svg`,
			),
		])
			.then(([face]) => {
				this.faceTextue = face;
			})
			.catch((error) => {
				console.log(error);
			});
	}
	public draw(ctx: CanvasRenderingContext2D): void {
		if (!this.faceTextue) {
			console.log("Texture not loaded yet.");
			return;
		}
		ctx.save();
		ctx.translate(
			this.pos.x + this.cardWidth / 2,
			this.pos.y + this.cardHeight / 2,
		);
		ctx.rotate(this.rotation);
		ctx.drawImage(
			this.faceTextue,
			-this.cardWidth / 2,
			-this.cardHeight / 2,
			this.cardWidth,
			this.cardHeight,
		);
		ctx.restore();
	}
	public update(ctx: CanvasRenderingContext2D, delta: number): void {
		if (this.startAnimation) {
			this.wiggle(ctx);
		}
	}
	public wiggle(ctx: CanvasRenderingContext2D): void {
		if (this.animationTime >= 30) {
			this.rotation = 0; // Reset rotation after animation
			this.startAnimation = false;
			return;
		}

		this.animationTime += 1;
		const wiggleSpeed = 0.2; // smaller = slower oscillation
		const wiggleAmplitude = 0.3; // in radians (~6°)

		// Smooth oscillation using sine
		this.rotation =
			Math.sin(this.animationTime * wiggleSpeed) * wiggleAmplitude;
	}
}

export class Vector {
	public x: number;
	public y: number;
	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
}
