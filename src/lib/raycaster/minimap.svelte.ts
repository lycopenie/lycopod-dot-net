import type { Vector2 } from "./math"

export class Minimap {
    position: Vector2 = { x: 0, y: 0 }

    direction = 0 
    cellSize = 40

    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D

    constructor(canvas: HTMLCanvasElement, x?: number, y?: number) {
        if (x != undefined && y != undefined) {
            this.position = { x: x, y: y }
        }
        this.canvas = canvas
        this.ctx = this.canvas.getContext('2d')!
    }

    loop = () => {
        this.render()
        requestAnimationFrame(this.loop)
    }

    render() {
        const w = this.canvas.width;
        const h = this.canvas.height;

        this.ctx.fillStyle = "#fff"
        this.ctx.fillRect(0, 0, w, h)

        this.ctx.fillStyle = "#000"

        const cw = Math.floor(w/this.cellSize) + 2
        const ch = Math.floor(h/this.cellSize) + 2
        
        const gridX = Math.floor(this.position.x)
        const gridY = Math.floor(this.position.y)

        const offX = this.position.x - Math.floor(this.position.x)
        const offY = this.position.y - Math.floor(this.position.y)

        for (let w = 0; w < cw; w++) {
            for (let h = 0; h < ch; h++) {
                this.ctx.fillRect(
                    Math.floor(w*this.cellSize - (offX * this.cellSize)), 
                    Math.floor(h*this.cellSize - (offY * this.cellSize)), 
                    this.cellSize - 1, 
                    this.cellSize - 1
                )
            }
        }
        
        this.ctx.fillStyle = "#f00"
        this.ctx.arc(w/2, h/2, 5, 0, Math.PI*2)
        this.ctx.fill()
    }

    init() {
        this.loop()
    }
}