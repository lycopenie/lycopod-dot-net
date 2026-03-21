<script>
	let { data } = $props();
</script>

<h1>about time i start working on this website...</h1>
<p>
    <a href="https://old.lycopod.net">see old site?</a>
    (check out <a href="https://old.lycopod.net/springs">/springs</a>, it's draggable!)
</p>
<p>
    <a href="https://old2.lycopod.net">see older site?</a>
    (check out <a href="https://old2.lycopod.net/softbody">/softbody</a> and <a href="https://old2.lycopod.net/fishes">/fishes</a>)
</p>

<h1>blog</h1>
{#each data.posts as post}
    <a href="/blog/{post.slug}">{post.meta.title}</a>
{/each}