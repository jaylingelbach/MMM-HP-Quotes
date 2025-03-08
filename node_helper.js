const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({
    start: function () {
        console.log("Starting node_helper for MMM-HP-Quotes");
        this.apiKey = null; // Initialize apiKey
    },

    socketNotificationReceived: async function (notification, payload) {
        if (notification === "SET_UPDATE_INTERVAL") {
            console.log("Update interval set: ", payload);
            this.updateInterval = payload;
            return;
        }

        if (notification === "SET_API_KEY") {
            this.apiKey = payload; // Store API key correctly
            return;
        }

        if (notification === "GET_NEW_QUOTE") {
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

            try {
                const fetch = (await import("node-fetch")).default;

                const response = await fetch("https://api.portkey.uk/quote/UUID", {
                    headers: {
                        Accept: "application/json",
                        //Authorization: `Bearer ${this.apiKey}`,
                    },
                });

                if (!response.ok) throw new Error(`Error fetching quotes: ${response.statusText}`);

                const res = await response.json();
                console.log(`!@!@!@!@!@!@!@!@!@!@!@!@! ${res}`);
                if (!res) throw new Error("No quotes found");
                // TODO error handling

                // Send notification back to frontend
                this.sendSocketNotification("NEW_QUOTE", {
                    quote: res.quote || "No quote available",
                    speaker: res.speaker || "Unknown",
                    story: res.story || "No data given...",
                    source: res.source || "No data given...",
                });
            } catch (error) {
                console.error("Error fetching quote:", error);
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