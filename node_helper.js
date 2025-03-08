const NodeHelper = require("node_helper");

async function fetchWithRetry(url, retries = 3, delay = 2000) {
    const fetch = (await import("node-fetch")).default;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, { timeout: 5000 }); // Set timeout to prevent hanging requests
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const res = await response.json();
            return res;
        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error.message);
            if (attempt < retries) {
                console.log(`Retrying in ${delay / 1000} seconds...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
            } else {
                throw new Error("Max retries reached, request failed.");
            }
        }
    }
}

module.exports = NodeHelper.create({
    start: function () {
        console.log("Starting node_helper for MMM-HP-Quotes");
    },

    socketNotificationReceived: async function (notification, payload) {
        if (notification === "SET_UPDATE_INTERVAL") {
            console.log("Update interval set HP-Quotes: ", payload);
            this.updateInterval = payload;
            return;
        }

        if (notification === "GET_NEW_QUOTE") {
            try {
                const res = await fetchWithRetry("https://api.portkey.uk/quote");

                this.sendSocketNotification("NEW_QUOTE", {
                    quote: res.quote || "No quote available",
                    speaker: res.speaker || "Unknown",
                    story: res.story || "No data given...",
                    source: res.source || "No data given...",
                });
            } catch (error) {
                console.error("Error fetching quote after retries:", error);
                this.sendSocketNotification("NEW_QUOTE", {
                    quote: "Failed to fetch a new quote.",
                    speaker: "Unknown",
                    story: "Unknown",
                    source: "Unknown",
                });
            }
        }
    },
});
