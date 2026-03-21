import { dirname, basename } from 'path';

export type Metadata = {
    title: string
    date: string
}

export type Post = {
    slug: string;
    path: string;
    meta: Metadata;
};

export function getAllPostMetadata() {
    const modules = import.meta.glob('/src/routes/blog/**/+page.svx', { eager: true });

    const posts = Object.entries(modules).map(([path, module]) => {
        const meta = (module as any).metadata;

        const slug = basename(dirname(path));

        return {
            slug,
            path: `/blog/${slug}`,
            meta
        };
    });

    return posts
        .sort((a, b) => new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime());
}