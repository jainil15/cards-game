import { type GameObject } from "./game";
import { Vector } from "./vector";
export class EventHandler {
	public static instance: EventHandler | null = null;
	private canvas: HTMLCanvasElement;
	private gameObjects: GameObject[] = [];
	private dragging: boolean = false;
	private startPos: Vector = new Vector(0, 0);
	private currentPos: Vector = new Vector(0, 0);
	private draggingObject: GameObject | null = null;
	private static readonly DRAG_THRESHOLD: number = 5;
	public static getInstance(canvas: HTMLCanvasElement): EventHandler {
		if (!EventHandler.instance) {
			EventHandler.instance = new EventHandler(canvas);
		}
		return EventHandler.instance;
	}
	private constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.canvas.addEventListener("mousedown", (event) => {
			this.startPos = new Vector(event.offsetX, event.offsetY);
			this.currentPos = this.startPos;
			this.dragging = false;
			this.draggingObject = null;
			const rect = this.canvas.getBoundingClientRect();
			const pos = new Vector(
				event.clientX - rect.left,
				event.clientY - rect.top,
			);

			for (let i = this.gameObjects.length - 1; i >= 0; i--) {
				if (
					pos.x >= this.gameObjects[i].pos.x &&
					pos.x <=
						this.gameObjects[i].pos.x + this.gameObjects[i].dimensions.x &&
					pos.y >= this.gameObjects[i].pos.y &&
					pos.y <= this.gameObjects[i].pos.y + this.gameObjects[i].dimensions.y
				) {
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
			if (
				(!this.dragging &&
					this.draggingObject &&
					Math.abs(this.currentPos.x - this.startPos.x) >
						EventHandler.DRAG_THRESHOLD) ||
				Math.abs(this.currentPos.y - this.startPos.y) >
					EventHandler.DRAG_THRESHOLD
			) {
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

	public addGameObject(gameObject: GameObject): void {
		this.gameObjects.push(gameObject);
	}
	public handleClick(event: MouseEvent): void {
		if (this.dragging) {
			return;
		}
		const rect = this.canvas.getBoundingClientRect();
		const pos = new Vector(event.clientX - rect.left, event.clientY - rect.top);

		for (let i = this.gameObjects.length - 1; i >= 0; i--) {
			if (
				pos.x >= this.gameObjects[i].pos.x &&
				pos.x <= this.gameObjects[i].pos.x + this.gameObjects[i].dimensions.x &&
				pos.y >= this.gameObjects[i].pos.y &&
				pos.y <= this.gameObjects[i].pos.y + this.gameObjects[i].dimensions.y
			) {
				this.gameObjects[i].onClick?.();
				return;
			}
		}
	}

	public handleDrag(event: MouseEvent): void {
		const rect = this.canvas.getBoundingClientRect();
		const pos = new Vector(event.clientX - rect.left, event.clientY - rect.top);
		this.draggingObject?.onDrag?.(pos);
	}
}
