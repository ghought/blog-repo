// Function to load and display blog posts
async function loadRecentPosts() {
    const postsContainer = document.getElementById('posts-container');
    if (!postsContainer) return;

    try {
        const response = await fetch('/content/blog/posts.json');
        const posts = await response.json();
        
        const postsHTML = posts
            .slice(0, 3) // Show only the 3 most recent posts
            .map(post => `
                <article class="post-card">
                    <h3><a href="/blog/${post.slug}">${post.title}</a></h3>
                    <time>${new Date(post.date).toLocaleDateString()}</time>
                    <p>${post.excerpt}</p>
                </article>
            `)
            .join('');
        
        postsContainer.innerHTML = postsHTML;
    } catch (error) {
        postsContainer.innerHTML = '<p>Blog posts coming soon...</p>';
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    loadRecentPosts();
}); 