const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

// Function to fetch the top 45 story IDs
async function fetchTopStoryIds() {
    const response = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json');
    return response.data.slice(0, 45);
}

// Function to fetch a story by ID
async function fetchStory(id) {
    const response = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
    return response.data;
}

// Route to get top stories
app.get('/topstories', async (req, res) => {
    try {
        const ids = await fetchTopStoryIds();
        const stories = [];

        for (let i = 0; i < ids.length; i += 15) {
            const batch = ids.slice(i, i + 15);
            const storyPromises = batch.map(id => fetchStory(id));
            stories.push(...(await Promise.all(storyPromises)));
            if (i + 15 < ids.length) await new Promise(resolve => setTimeout(resolve, 1000)); // 1s pause
        }

        res.json(stories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;