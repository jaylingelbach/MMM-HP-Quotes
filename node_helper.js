const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({
    start: function () {
        console.log("Starting node_helper for MMM-HP-Quotes");
        // this.apiKey = null; // Initialize apiKey
    },

    socketNotificationReceived: async function (notification, payload) {
        if (notification === "SET_UPDATE_INTERVAL") {
            console.log("Update interval set HP-Quotes: ", payload);
            this.updateInterval = payload;
            return;
        }

        // if (notification === "SET_API_KEY") {
        //     this.apiKey = payload; // Store API key correctly
        //     return;
        // }

        if (notification === "GET_NEW_QUOTE") {
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
            
            // if (!this.apiKey) {
            //     console.error("API key is missing!");
            //     this.sendSocketNotification("NEW_QUOTE", {
            //         quote: "No API key provided.",
            //         speaker: "Unknown",
            //         story: "Unknown",
            //         source: "Unknown",
            //     });
            //     return;
            // }

            // try {
            //     const fetch = (await import("node-fetch")).default;

            //     const response = await fetch("https://api.portkey.uk/quote")

            //     console.log("RESPONSE FROM HP QUOTES:  ", response);

            //     if (!response.ok) throw new Error(`Error fetching quotes: ${response.statusText}`);

            //     const res = await response.json();
            //     console.log(`!@!@!@!@!@!@!@!@!@!@!@!@! RES ${res}`);
            //     if (!res) throw new Error("No quotes found");
            //     // TODO error handling

            //     // Send notification back to frontend
            //     this.sendSocketNotification("NEW_QUOTE", {
            //         quote: res.quote || "No quote available",
            //         speaker: res.speaker || "Unknown",
            //         story: res.story || "No data given...",
            //         source: res.source || "No data given...",
            //     });
            // } catch (error) {
            //     console.error("Error fetching quote:", error);
            //     this.sendSocketNotification("NEW_QUOTE", {
            //         quote: "Failed to fetch a new quote.",
            //         speaker: "Unknown",
            //         story: "Unknown",
            //         source: "Unknown",
            //     });
            // }
        }
    },
});