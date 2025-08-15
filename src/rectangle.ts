import type { Vector } from "./game";

export class Rectangle {
	public pos: Vector;
	public height: number;
	public width: number;
	public color: string = "white";
	public borderColor: string = "white";
	public borderWidth: number = 0;
	constructor(pos: Vector, height: number, width: number) {
		this.pos = pos;
		this.width = width;
		this.height = height;
	}
	public addColor(color: string) {
		this.color = color;
		return this;
	}
	public addBorderColor(borderColor: string) {
		this.borderColor = borderColor;
		return this;
	}
	public addBorderWidth(borderWidth: number) {
		this.borderWidth = borderWidth;
		return this;
	}
	public draw(ctx: CanvasRenderingContext2D) {
		ctx.save();
		ctx.fillStyle = this.color;
		ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
		if (this.borderWidth > 0) {
			ctx.strokeStyle = this.borderColor;
			ctx.lineWidth = this.borderWidth;
			ctx.strokeRect(this.pos.x, this.pos.y, this.width, this.height);
		}
		ctx.restore();
		return this;
	}
}
