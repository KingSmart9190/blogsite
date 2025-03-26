const blogList = document.getElementById('blog-list');
const blogDetails = document.getElementById('blog-details');
const backButton = document.getElementById('back-button');
const PEXELS_API_KEY = "n6OQHgYxZL2nBPmrRdHsi7j1aIOm5i5QC1CxrUiO53mWLbfolkaHlVjK"; // Replace with your API key
const searchInput = document.querySelector("input[type='text']");

let allBlogs = []; // Store all blogs for searching
let allTopics = []; // Store all topic cards for searching

// Fetch blogs from two English sources
async function fetchBlogs() {
    try {
        const [api1, api2] = await Promise.all([
            fetch('https://jsonplaceholder.typicode.com/posts').then(res => res.json()),
            fetch('https://dev.to/api/articles?per_page=5').then(res => res.json())
        ]);

        let blogs = [];

        // Format API 1 (JSONPlaceholder) Blogs
        api1.slice(0, 5).forEach(blog => {
            blogs.push({
                id: blog.id,
                title: blog.title,
                description: blog.body,
                imageQuery: "technology",
                date: new Date().toDateString(),
                views: Math.floor(Math.random() * 5000) + 1000,
                comments: Math.floor(Math.random() * 200),
                fullContentUrl: `https://jsonplaceholder.typicode.com/posts/${blog.id}`
            });
        });

        // Format API 2 (Dev.to) Blogs
        api2.forEach(blog => {
            blogs.push({
                id: blog.id,
                title: blog.title,
                description: blog.description || "No description available.",
                imageQuery: "coding",
                date: blog.published_at.split('T')[0],
                views: blog.public_reactions_count + 2000,
                comments: blog.comments_count,
                fullContentUrl: `https://dev.to/api/articles/${blog.id}`
            });
        });

        // Fetch images dynamically from Pexels
        blogs = await fetchBlogImages(blogs);

        // Store blogs globally for search functionality
        allBlogs = blogs;

        // Render blog posts
        renderBlogList(blogs);

    } catch (error) {
        console.error("Error fetching blogs:", error);
    }
}

// Fetch images from Pexels based on keywords
async function fetchBlogImages(blogs) {
    return Promise.all(
        blogs.map(async (blog) => {
            try {
                const response = await fetch(
                    `https://api.pexels.com/v1/search?query=${blog.imageQuery}&per_page=1`,
                    { headers: { Authorization: PEXELS_API_KEY } }
                );
                const data = await response.json();
                blog.image = data.photos[0]?.src?.medium || 'https://via.placeholder.com/600x400';
            } catch (error) {
                console.error("Error fetching images:", error);
                blog.image = 'https://via.placeholder.com/600x400'; // Fallback image
            }
            return blog;
        })
    );
}

// Render blog list
function renderBlogList(blogs) {
    blogList.innerHTML = '';
    blogs.forEach(blog => {
        const blogCard = document.createElement('div');
        blogCard.classList.add('blog-card');

        blogCard.innerHTML = `
            <img src="${blog.image}" alt="Blog Image">
            <div class="blog-details">
                <h3>${blog.title || "Untitled Blog"}</h3>
                <p class="meta">📅 ${blog.date} • 👁 ${blog.views} views • 💬 ${blog.comments} comments</p>
                <p>${blog.description.substring(0, 100)}...</p>
                <button class="read-more" onclick="fetchDetailedBlog('${blog.fullContentUrl}', '${blog.image}')">Read More</button>
            </div>
        `;

        blogList.appendChild(blogCard);
    });

    blogList.style.display = "block";
    blogDetails.style.display = "none";
}

// Fetch and display detailed blog content
async function fetchDetailedBlog(url, image) {
    try {
        const response = await fetch(url);
        const blog = await response.json();

        const fullContent = blog.body || blog.description || "No additional content available.";

        blogDetails.innerHTML = `
            <h2>${blog.title || "Blog Title"}</h2>
            <img src="${image}" alt="Blog Image">
            <p class="meta">📅 ${new Date().toDateString()} • 👁 ${Math.floor(Math.random() * 5000) + 1000} views • 💬 ${Math.floor(Math.random() * 200)} comments</p>
            <p>${fullContent}</p>
        `;

        blogList.style.display = "none";
        blogDetails.style.display = "block";
        backButton.style.display = "block";
    } catch (error) {
        console.error("Error fetching detailed blog:", error);
        alert("Failed to load blog details.");
    }
}

// Fetch topic cards for recommended topics
function fetchTopics() {
    const topics = [
        "Programming", "Self Improvement", "Data Science",
        "Writing", "Relationships", "Technology", "Politics"
    ];

    allTopics = topics.map(topic => ({
        title: topic,
        description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. ${topic} topic details go here.`,
        image: 'https://via.placeholder.com/600x400',
        fullContent: `Full content for ${topic}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.`
    }));

    renderTopicCards(allTopics);
}

// Render topic cards
function renderTopicCards(topics) {
    blogList.innerHTML = '';
    topics.forEach(topic => {
        const topicCard = document.createElement('div');
        topicCard.classList.add('blog-card');

        topicCard.innerHTML = `
            <img src="${topic.image}" alt="Topic Image">
            <div class="blog-details">
                <h3>${topic.title}</h3>
                <p>${topic.description.substring(0, 100)}...</p>
                <button class="read-more" onclick="fetchTopicDetails('${topic.fullContent}', '${topic.title}', '${topic.image}')">Read More</button>
            </div>
        `;

        blogList.appendChild(topicCard);
    });

    blogList.style.display = "block";
    blogDetails.style.display = "none";
}

// Fetch and display detailed topic content
function fetchTopicDetails(fullContent, title, image) {
    blogDetails.innerHTML = `
        <h2>${title}</h2>
        <img src="${image}" alt="Topic Image">
        <p>${fullContent}</p>
    `;

    blogList.style.display = "none";
    blogDetails.style.display = "block";
    backButton.style.display = "block";
}

// Search functionality for blogs and topics
function searchBlogsAndTopics(query) {
    const filteredBlogs = allBlogs.filter(blog =>
        blog.title.toLowerCase().includes(query.toLowerCase()) ||
        blog.description.toLowerCase().includes(query.toLowerCase())
    );

    const filteredTopics = allTopics.filter(topic =>
        topic.title.toLowerCase().includes(query.toLowerCase()) ||
        topic.description.toLowerCase().includes(query.toLowerCase())
    );

    renderBlogList(filteredBlogs.concat(filteredTopics));
}

// Listen for search input changes
searchInput.addEventListener("input", (event) => {
    searchBlogsAndTopics(event.target.value);
});

// Fetch blogs and topics on page load
fetchBlogs();
fetchTopics();

function goBack() {
    blogDetails.style.display = "none";
    blogList.style.display = "block";
    backButton.style.display = "none";
}

const followingTopics = new Set(); // Store selected topics

// Function to toggle topics in the Following section
function toggleFollowingTopic(topicElement, topicName) {
    if (followingTopics.has(topicName)) {
        followingTopics.delete(topicName);
        topicElement.classList.remove('selected');
        topicElement.innerHTML = topicName;
    } else {
        followingTopics.add(topicName);
        topicElement.classList.add('selected');
        topicElement.innerHTML = `✔️ ${topicName}`;
    }
}

// Function to switch between tabs
function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelector(`.tab[onclick="fetchBlogs('${tabName}')"]`).classList.add('active');
    
    if (tabName === 'following') {
        renderTopicCards(Array.from(followingTopics).map(topic => ({
            title: topic,
            description: `Latest articles on ${topic}.`,
            image: 'https://via.placeholder.com/600x400',
            fullContent: `Full content about ${topic}: Lorem ipsum dolor sit amet...`
        })));
    } else if (tabName === 'featured') {
        fetchFeaturedBlogs();
    } else if (tabName === 'for-you') {
        fetchForYouBlogs();
    }
}

// Modify topic links to allow selection
function fetchBlogsByTopic(topic) {
    const topicElements = document.querySelectorAll('.tags a');
    topicElements.forEach(el => {
        if (el.textContent.includes(topic)) toggleFollowingTopic(el, topic);
    });
}

// Featured section logic
function fetchFeaturedBlogs() {
    const topics = ["AI & Robotics", "Quantum Computing", "Blockchain Innovations", "Future of Work", "Space Exploration"];
    const featuredBlogs = topics.map(topic => ({
        title: topic,
        description: `Discover the latest insights and trends in ${topic}.`,
        image: 'https://via.placeholder.com/600x400',
        fullContent: `Exclusive content on ${topic}: Lorem ipsum dolor sit amet...`
    }));
    renderTopicCards(featuredBlogs);
}

// For You section logic
function fetchForYouBlogs() {
    fetchBlogs(); // Ensure only 'For You' blogs are shown
}

document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function () {
        const tabName = this.getAttribute('onclick').match(/'([^']+)'/)[1];
        switchTab(tabName);
    });
});


