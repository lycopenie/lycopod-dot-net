<script lang="ts">
    import { onMount } from "svelte"
    import { Raycaster } from "$lib/raycaster/raycaster.svelte"
	import { remap } from "$lib/raycaster/math"
	import { Minimap } from "$lib/raycaster/minimap.svelte";

    let width = $state(640)
    let height = $state(480)
    let renderingMode = $state('pixelated')

    let skyPath = $state('/raycaster/sky2.gif')
    const skyOptions = [
        { name: '1', path: '/raycaster/sky1.gif' },
        { name: '2', path: '/raycaster/sky2.gif' },
        { name: '3', path: '/raycaster/sky3.gif' }
    ];

    let minimapCanvas: HTMLCanvasElement
    let minimap: Minimap

    let mWidth = $state(0);
    let mHeight = $state(0);

    let canvas: HTMLCanvasElement
    let ctx: CanvasRenderingContext2D
    let engine: Raycaster

    let wallTexture: HTMLImageElement

    const map = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,0,1,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,1,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,0,1,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,0,1,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,0,1,0,1,1,1,1,0,1,1,0,1,0,0,0,0,0,0,1],
        [1,0,1,0,1,0,0,1,0,0,0,0,1,0,1,0,0,0,0,0,0,1],
        [1,0,0,0,1,1,0,1,0,1,1,0,1,0,1,1,1,0,0,0,0,1],
        [1,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,0,0,1],
        [1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,0,1,0,0,0,0,1],
        [1,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ]

    async function loadImage(src: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve(img);
            img.onerror = reject;
        });
    }

    async function init() {
        [wallTexture] = await Promise.all([
            loadImage("/raycaster/wall.jpg"),
        ])

        ctx = canvas.getContext('2d')!

        engine = new Raycaster(map)
        minimap = new Minimap(minimapCanvas)
        minimap.init()

        loop(0)
    }

    let t1 = 0;
    function loop(t0: number) {
        const dt = t0-t1
        t1 = t0
        
        engine.update(dt)
        minimap.position.x = engine.player.x
        minimap.position.y = engine.player.y

        render()
        requestAnimationFrame(loop)
    }

    function render() {
        // clear the screen!
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        // ctx.fillStyle = 'black'
        // ctx.fillRect(0, 0, canvas.width, canvas.height)

        const midX = canvas.width / 2
        const midY = canvas.height / 2

        // actual rendering
        for (let x = 0; x < canvas.width; x++) {
            const cameraX = remap(x, 0, canvas.width, -1, 1)

            const result = engine.castRay(cameraX)
            const lineHeight = canvas.height / result.distance;

            // ctx.strokeStyle = '#0f0'
            // ctx.beginPath()
            // ctx.moveTo(x, midY - (lineHeight / 2))
            // ctx.lineTo(x, midY + (lineHeight / 2))
            // ctx.stroke()

            drawTexturedColumn(x, cameraX, lineHeight, result, wallTexture)
        }
    }

    function drawTexturedColumn(x: number, cameraX: number, lineHeight: number, result: any, textureImg: HTMLImageElement) {
        const rd = {
            x: Math.cos(engine.player.dir) + engine.player.planeX * cameraX,
            y: Math.sin(engine.player.dir) + engine.player.planeY * cameraX
        }

        const texWidth = textureImg.width
        const texHeight = textureImg.height

        let texX = Math.floor(result.wallX * texWidth);
        
        if ((result.side === 0 && rd.x > 0) || (result.side === 1 && rd.y < 0)) {
            texX = texWidth - texX - 1;
        }

        // 1px slice
        ctx.drawImage(
            textureImg,
            texX, 0, 1, texHeight,
            x, (canvas.height / 2) - (lineHeight / 2), 1, lineHeight
        );

        // shadow for other side
        if (result.side === 1) {
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(x, (canvas.height / 2) - (lineHeight / 2), 1, lineHeight);
        }
    }

    onMount(init)
</script>


<div>
    <div class="sky-layer" style:background-image="url({skyPath})"></div>
    <canvas 
    bind:this={canvas} 
    width={width} 
    height={height} 
    style:image-rendering={renderingMode}
    ></canvas>

    <div class="debug">
        <label for="h">heightres</label>
        <input id="h" type="number" bind:value={height} step="10" />

        <label for="w">widthres</label>
        <input id="w" type="number" bind:value={width} step="10" />

        <label for="renderingmode">rendering mode</label>
        <select bind:value={renderingMode}>
            <option value="pixelated">pixelated</option>
            <option value="auto">auto</option>
            <option value="mercrisp-edgescedes">crisp edges</option>
            <option value="smooth">smooth</option>
            <option value="high-quality">highqual</option>
        </select>

        <label for="sky-select">Sky Texture</label>
        <select id="sky-select" bind:value={skyPath}>
            {#each skyOptions as option}
                <option value={option.path}>{option.name}</option>
            {/each}
        </select>
    </div>

    <canvas 
    bind:this={minimapCanvas} 
    bind:clientWidth={mWidth} 
    bind:clientHeight={mHeight}
    width={mWidth} 
    height={mHeight}
    class="minimap"
    ></canvas>
</div>



<style>
    .sky-layer {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 50%;
        background-repeat: repeat;
        background-size: auto;
        z-index: -2;
        image-rendering: pixelated;
    }

    canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: -1;
    }

    .minimap {
        position: absolute;
        width: 30vmin;
        height: 30vmin;
        bottom: 0;
        left: 0;
        z-index: 1;
        background-color: black;
    }
</style>