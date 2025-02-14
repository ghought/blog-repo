const fs = require('fs').promises;
const path = require('path');
const { marked } = require('marked');

async function copyFile(src, dest) {
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.copyFile(src, dest);
}

async function buildSite() {
    const srcDir = path.join(__dirname, '../src');
    const distDir = path.join(__dirname, '../dist');

    // Create dist directory
    await fs.mkdir(distDir, { recursive: true });

    // Copy static files
    await copyFile(
        path.join(srcDir, 'index.html'),
        path.join(distDir, 'index.html')
    );
    await copyFile(
        path.join(srcDir, 'css/main.css'),
        path.join(distDir, 'css/main.css')
    );
    await copyFile(
        path.join(srcDir, 'js/main.js'),
        path.join(distDir, 'js/main.js')
    );

    // Convert static pages
    const pagesDir = path.join(srcDir, 'content/pages');
    const pageFiles = await fs.readdir(pagesDir);
    
    for (const file of pageFiles) {
        if (file.endsWith('.md')) {
            const content = await fs.readFile(path.join(pagesDir, file), 'utf-8');
            const html = marked(content);
            const pageName = file.replace('.md', '');
            
            const pageHTML = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${pageName.charAt(0).toUpperCase() + pageName.slice(1)} - Your Site</title>
                    <link rel="stylesheet" href="/css/main.css">
                </head>
                <body>
                    <header>
                        <nav>
                            <a href="/" class="logo">Your Site</a>
                            <ul>
                                <li><a href="/">Home</a></li>
                                <li><a href="/blog">Blog</a></li>
                                <li><a href="/about">About</a></li>
                                <li><a href="/faq">FAQ</a></li>
                            </ul>
                        </nav>
                    </header>
                    <main>
                        <article class="content">
                            ${html}
                        </article>
                    </main>
                    <footer>
                        <p>&copy; 2024 Your Site. All rights reserved.</p>
                    </footer>
                </body>
                </html>
            `;
            
            await fs.writeFile(
                path.join(distDir, `${pageName}.html`),
                pageHTML
            );
        }
    }

    // Convert blog posts
    const blogDir = path.join(__dirname, '../src/content/blog');
    const blogFiles = await fs.readdir(blogDir);
    
    const posts = [];
    const template = await fs.readFile(
        path.join(__dirname, '../src/templates/blog-post.html'),
        'utf-8'
    );

    for (const file of blogFiles) {
        if (file.endsWith('.md')) {
            const content = await fs.readFile(path.join(blogDir, file), 'utf-8');
            const html = marked(content);
            
            // Extract front matter (simple version)
            const frontMatter = {};
            const matches = content.match(/^---\n([\s\S]*?)\n---/);
            if (matches) {
                const lines = matches[1].split('\n');
                lines.forEach(line => {
                    const [key, value] = line.split(': ');
                    frontMatter[key] = value;
                });
            }

            const slug = file.replace('.md', '');
            posts.push({
                slug,
                title: frontMatter.title,
                date: frontMatter.date,
                excerpt: frontMatter.excerpt
            });

            // Create HTML file
            const postHTML = template
                .replace('{{title}}', frontMatter.title)
                .replace('{{date}}', frontMatter.date)
                .replace('{{content}}', html);

            await fs.mkdir(path.join(__dirname, '../dist/blog'), { recursive: true });
            await fs.writeFile(
                path.join(__dirname, `../dist/blog/${slug}.html`),
                postHTML
            );
        }
    }

    // Save posts metadata
    await fs.mkdir(path.join(__dirname, '../dist/content/blog'), { recursive: true });
    await fs.writeFile(
        path.join(__dirname, '../dist/content/blog/posts.json'),
        JSON.stringify(posts)
    );
}

buildSite().catch(console.error); 