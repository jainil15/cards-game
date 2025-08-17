import { AssetLoader } from "./asset-loader";
import { Card } from "./card";
import { EventHandler } from "./event-handler";
import { Vector } from "./vector";

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
function moveItem<T>(arr: T[], fromIndex: number, toIndex: number): T[] {
	const newArr = [...arr];
	const [movedItem] = newArr.splice(fromIndex, 1);
	newArr.splice(toIndex, 0, movedItem);
	return newArr;
}
