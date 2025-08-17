import { AssetLoader } from "./asset-loader";
import type { GameObject } from "./game";
import { Vector } from "./vector";

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
