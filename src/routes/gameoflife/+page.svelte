<canvas bind:this={golCanvas} width={width} height={height}></canvas>


<script lang="ts">
	import { onMount } from "svelte";

    let golCanvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let width = $state(1000);
    let height = $state(800);

    let cellSize = 5;
    let gridW: number;
    let gridH: number;

    let golArr: boolean[] = [];
    let golBuffer: boolean[] = [];

    function init() {
        ctx = golCanvas.getContext('2d')!;
        gridW = width/cellSize;
        gridH = height/cellSize;

        golArr = new Array(gridW * gridH).fill(false);
        golBuffer = new Array(gridW * gridH).fill(false);

        for (let i = 0; i < golArr.length; i++) {
            golArr[i] = Math.random() > 0.7;
        }

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
            for (let i = 0; i < golArr.length; i++) {
                if (i <= gridW || i >= gridW*gridH-gridW) {
                    golArr[i] = false;
                    continue;
                }
                if (i % gridW === 0 || i % gridW === gridW-1) {
                    golArr[i] = false;
                    continue;
                }
                let neighbors = 0;
                if (golArr[i - gridW - 1]) neighbors++; // TL
                if (golArr[i - gridW])     neighbors++; // T
                if (golArr[i - gridW + 1]) neighbors++; // TR
                if (golArr[i - 1])         neighbors++; // L
                if (golArr[i + 1])         neighbors++; // R
                if (golArr[i + gridW - 1]) neighbors++; // BL
                if (golArr[i + gridW])     neighbors++; // B
                if (golArr[i + gridW + 1]) neighbors++; // BR

                const isAlive = golArr[i];
                if (isAlive) {
                    golBuffer[i] = neighbors === 2 || neighbors === 3;
                } else {
                    golBuffer[i] = neighbors === 3;
                }
            } 

            golArr = [...golBuffer];
        }
    }

    function render() {
        // Clear canvas
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, width, height);

        // Draw alive cells
        ctx.fillStyle = "#ffffff";
        for (let i = 0; i < golArr.length; i++) {
            if (golArr[i]) {
                const x = (i % gridW) * cellSize;
                const y = Math.floor(i / gridW) * cellSize;
                ctx.fillRect(x, y, cellSize-1, cellSize-1); // gap
            }
        }
    }


    onMount(init)
</script>