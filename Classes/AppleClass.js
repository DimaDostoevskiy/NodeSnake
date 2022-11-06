export class Apple {
    constructor(color = `rgb(42, 256, 42`) {
        this.radius = getRndInt(20, 60) / 10;
        this.X = getRndInt(10, canvas.width);
        this.Y = getRndInt(10, 20);
        this.color = color;
        this.dx = getRndInt(-20, 20) / 10;
        this.dy = getRndInt(-20, 20) / 10;
    }

    draw() {
        ctx.beginPath();
        ctx.lineWidth = this.radius * 2;
        ctx.strokeStyle = this.color;
        ctx.arc(this.X, this.Y, this.radius, 0, Math.PI * 2, true);
        ctx.stroke();

        if (this.X - this.radius <= 0) this.dx = -this.dx;
        if (this.Y - this.radius <= 0) this.dy = -this.dy;
        if (this.X + this.radius > canvas.width) this.dx = -this.dx;
        if (this.Y + this.radius > canvas.height) this.dy = -this.dy;

        this.X += this.dx;
        this.Y += this.dy;
    }
}
