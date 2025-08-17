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
