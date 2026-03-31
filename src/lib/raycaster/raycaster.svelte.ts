import { InputManager } from "$lib/raycaster/input"
import type { Vector2 } from "$lib/raycaster/math"

// see this article: https://aaaa.sh/creatures/dda-algorithm-interactive/
// see also: https://lodev.org/cgtutor/raycasting.html

const fov = 2/3

export class Raycaster {
    input: InputManager
    map: number[][]
    player = $state({
        x: 1.5, 
        y: 1.5,
        dir: 0, // radians
        planeX: 0,
        planeY: fov
    })

    constructor(map: number[][]) {
        this.map = map
        this.input = new InputManager()
    }

    

    castRay(cameraX: number) {
        const ro = { x: this.player.x, y: this.player.y }
        const rd = {
            x: Math.cos(this.player.dir) + this.player.planeX * cameraX,
            y: Math.sin(this.player.dir) + this.player.planeY * cameraX
        };
        // sqrt(1 + (dy/dx)^2)
        const rayUnitStepSize: Vector2 = {
            x: Math.abs(1 / (rd.x || 1e-30)),
            y: Math.abs(1 / (rd.y || 1e-30))
        }

        // the grid cell we are currently in
        let mapCheck: Vector2 = {
            x: Math.floor(ro.x),
            y: Math.floor(ro.y)
        }

        // direction of the step
        const step: Vector2 = {
            x: Math.sign(rd.x),
            y: Math.sign(rd.y)
        }

        // calc initial distance to the first grid boundary
        let rayLength: Vector2 = { x: 0, y: 0 }
        const roFract: Vector2 = {
            x: ro.x - mapCheck.x,
            y: ro.y - mapCheck.y
        }

        if (rd.x < 0) {
            rayLength.x = roFract.x * rayUnitStepSize.x
        } else {
            rayLength.x = (1 - roFract.x) * rayUnitStepSize.x
        }

        if (rd.y < 0) {
            rayLength.y = roFract.y * rayUnitStepSize.y
        } else {
            rayLength.y = (1 - roFract.y) * rayUnitStepSize.y
        }

        // DDA
        let hit = false
        let side = 0; // 0/1 for x/y axis hit
        let distance = 0

        // 50 steps
        for (let i = 0; i < 50 && !hit; i++) {
            if (rayLength.x < rayLength.y) {
                mapCheck.x += step.x
                distance = rayLength.x
                rayLength.x += rayUnitStepSize.x
                side = 0
            } else {
                mapCheck.y += step.y
                distance = rayLength.y
                rayLength.y += rayUnitStepSize.y
                side = 1
            }

            if (
                mapCheck.y >= 0 && mapCheck.y < this.map.length &&
                mapCheck.x >= 0 && mapCheck.x < this.map[0].length
            ) {
                if (this.map[mapCheck.y][mapCheck.x] > 0) {
                    hit = true
                }
            } else {
                break
            }
        }

        let wallX: number;
        if (side === 0) {
            wallX = ro.y + distance * rd.y;
        } else {
            wallX = ro.x + distance * rd.x;
        }
        wallX -= Math.floor(wallX)

        return { distance, side, wallX };
    }

    update(dt: number) {
        let input = this.input
        const moveSpeed = 0.004
        const rotateSpeed = 0.004


        this.player.dir += (+input.isPressed("d") - +input.isPressed("a")) * dt * rotateSpeed

        this.player.planeX = -Math.sin(this.player.dir) * fov
        this.player.planeY = Math.cos(this.player.dir) * fov

        // w + s
        const velX = Math.cos(this.player.dir) * moveSpeed * dt * (+input.isPressed("w") - +input.isPressed("s"))
        const velY = Math.sin(this.player.dir) * moveSpeed * dt * (+input.isPressed("w") - +input.isPressed("s"))
        this.move(velX, velY)
    }

    private move(dx: number, dy: number) {
        const newX = this.player.x + dx
        const newY = this.player.y + dy

        const bufferLength = 0.1

        const bufferX = dx > 0 ? bufferLength : -bufferLength
        const bufferY = dy > 0 ? bufferLength : -bufferLength

        if (this.map[Math.floor(this.player.y)][Math.floor(newX + bufferX)] === 0) {
            this.player.x = newX
        }

        if (this.map[Math.floor(newY + bufferY)][Math.floor(this.player.x)] === 0) {
            this.player.y = newY
        }
    }
}