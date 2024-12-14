const express = require('express');
const { igApi, getCookie } = require("insta-fetcher");

const app = express();
const PORT = 3000;

app.use(express.json());

// API Route
app.post('/scrape-instagram', async (req, res) => {
    const { username, password, testUser } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            error: 'Username and password are required',
        });
    }

    try {
        // Obtain session cookie using username/email and password
        const sessionId = await getCookie(username, password);

        // Initialize insta-fetcher with session cookie
        const ig = new igApi(sessionId);

        let userData;

        // Check if input is an email (contains '@') or a username
        if (username.includes('@')) {
            // If email, fetch logged-in user details
            const loggedInUser = await ig.accountInfo();
            if (!loggedInUser || !loggedInUser.username) {
                throw new Error('Failed to retrieve logged-in user details.');
            }
            userData = loggedInUser;
        } else {
            // If username, fetch specific user's data
            userData = await ig.fetchUser(username);
        }

        // Respond with user data
        res.json({
            success: true,
            data: userData,
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
