export class Vector2D {
  public x: number;
  public y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  add(v: Vector2D): Vector2D {
    return new Vector2D(this.x + v.x, this.y + v.y);
  }

  sub(v: Vector2D): Vector2D {
    return new Vector2D(this.x - v.x, this.y - v.y);
  }

  mult(n: number): Vector2D {
    return new Vector2D(this.x * n, this.y * n);
  }

  div(n: number): Vector2D {
    if (n === 0) return new Vector2D(0, 0);
    return new Vector2D(this.x / n, this.y / n);
  }

  mag(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  magSq(): number {
    return this.x * this.x + this.y * this.y;
  }

  normalize(): Vector2D {
    const m = this.mag();
    if (m === 0) return new Vector2D(0, 0);
    return this.div(m);
  }

  dot(v: Vector2D): number {
    return this.x * v.x + this.y * v.y;
  }

  dist(v: Vector2D): number {
    return Math.hypot(this.x - v.x, this.y - v.y);
  }

  distSq(v: Vector2D): number {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return dx * dx + dy * dy;
  }

  clone(): Vector2D {
    return new Vector2D(this.x, this.y);
  }

  set(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }
}
