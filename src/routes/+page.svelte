<script>
	let { data } = $props();
</script>

<h1>about time i start working on this website...</h1>
<a href="https://old.lycopod.net">see old site?</a>

<h1>blog</h1>
{#each data.posts as post}
    <a href="/blog/{post.slug}">{post.meta.title}</a>
{/each}