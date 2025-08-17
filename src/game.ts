import { AssetLoader } from "./asset-loader";
import { EventHandler } from "./event-handler";

export class Game {
	private canvas: HTMLCanvasElement;
	public ctx: CanvasRenderingContext2D | null;
	private cards: Card[];
	private lastTimestamp: number = 0;
	private eventHandler: EventHandler;

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
		this.eventHandler = EventHandler.getInstance(this.canvas);
		const card = new Card(new Vector(100, 100), "A", "hearts");
		const card2 = new Card(new Vector(159, 100), "A", "clubs");
		this.cards = [];
		this.eventHandler.addGameObject(card);
		this.cards.push(card);
		this.eventHandler.addGameObject(card2);
		this.cards.push(card2);
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

export interface GameObject {
	pos: Vector;
	dimensions: Vector;
	draw(ctx: CanvasRenderingContext2D): void;
	update(ctx: CanvasRenderingContext2D, delta: number): void;
	onClick?(): void;
	onDrag?(pos: Vector): void;
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

function moveItem<T>(arr: T[], fromIndex: number, toIndex: number): T[] {
	const newArr = [...arr];
	const [movedItem] = newArr.splice(fromIndex, 1);
	newArr.splice(toIndex, 0, movedItem);
	return newArr;
}
export class Card implements GameObject {
	rank: Rank;
	suit: Suit;
	faceUp: boolean = true;
	pos: Vector;
	faceTextue: HTMLImageElement | null = null;
	rotation: number = 0;
	dimensions: Vector;
	animationTime: number = 0;
	startAnimation: boolean = true;

	public constructor(pos: Vector, rank: Rank, suit: Suit) {
		this.suit = suit;
		this.rank = rank;
		this.pos = pos;
		this.dimensions = new Vector(100, 150);

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
			this.pos.x + this.dimensions.x / 2,
			this.pos.y + this.dimensions.y / 2,
		);
		ctx.rotate(this.rotation);
		ctx.drawImage(
			this.faceTextue,
			-this.dimensions.x / 2,
			-this.dimensions.y / 2,
			this.dimensions.x,
			this.dimensions.y,
		);
		ctx.restore();
	}
	public update(ctx: CanvasRenderingContext2D, delta: number): void {
		if (this.startAnimation) {
			this.wiggle();
		}
	}
	public onClick(): void {
		console.log(`Card clicked: ${this.rank} of ${this.suit}`);
		this.startAnimation = true;
		this.animationTime = 0;
		this.wiggle();
	}
	public onDrag(pos: Vector): void {
		this.pos.x = pos.x;
		this.pos.y = pos.y;
	}

	public wiggle(): void {
		if (this.animationTime >= 30) {
			this.rotation = 0;
			this.startAnimation = false;
			return;
		}

		this.animationTime += 1;
		const wiggleSpeed = 0.2;
		const wiggleAmplitude = 0.3;

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
	add(vector: Vector): Vector {
		return new Vector(this.x + vector.x, this.y + vector.y);
	}
	subtract(vector: Vector): Vector {
		return new Vector(this.x - vector.x, this.y - vector.y);
	}
	multiply(scalar: number): Vector {
		return new Vector(this.x * scalar, this.y * scalar);
	}
}
