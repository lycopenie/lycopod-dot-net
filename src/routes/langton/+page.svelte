<canvas bind:this={langtonCanvas} width={width} height={height}></canvas>


<script lang="ts">
	import { onMount } from "svelte";

    let langtonCanvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let width = $state(1000);
    let height = $state(800);

    let cellSize = 5;
    let gridW: number;
    let gridH: number;

    let langtonArr: boolean[] = [];

    const Directions = {
        UP: 0,
        RIGHT: 1,
        DOWN: 2,
        LEFT: 3
    } as const;

    let direction: number;
    let position: number;

    function init() {
        ctx = langtonCanvas.getContext('2d')!;
        gridW = width/cellSize;
        gridH = height/cellSize;

        langtonArr = new Array(gridW * gridH).fill(false);

        direction = Directions.LEFT;
        position = gridW *40 + 50;

        loop(0);
    }

    let t1 = 0;
    function loop(t0: number) {
        const dt = t0-t1;
        t1 = t0;

        step()
        render()
        
        requestAnimationFrame(loop)
    }

    function step(steps: number = 1) {
        for (let _ = 0; _ < steps; _++) {
            // turn
            if (langtonArr[position]) {
                // counter-clockwise
                direction = (direction+3)%4
            } else {
                // clockwise
                direction = (direction+1)%4
            }

            langtonArr[position] = !langtonArr[position]


            // move
            switch (direction) {
                case Directions.LEFT:
                    position -= 1
                    break;
                case Directions.RIGHT:
                    position += 1
                    break;
                case Directions.UP:
                    position -= gridW
                    break;
                case Directions.DOWN:
                    position += gridW
                    break;

                default:
                    break;
            }
        }
    }

    function render() {
        // clear
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, width, height);

        // alive cells
        ctx.fillStyle = "#ffffff";
        for (let i = 0; i < langtonArr.length; i++) {
            if (langtonArr[i]) {
                const x = (i % gridW) * cellSize;
                const y = Math.floor(i / gridW) * cellSize;
                ctx.fillRect(x, y, cellSize-1, cellSize-1); // gap
            }
        }
    }


    onMount(init)
</script>