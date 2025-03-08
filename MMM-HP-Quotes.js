
Module.register("MMM-HP-Quotes", {
    defaults: {
        fadeSpeed: 4000,
    },

    start: function () {
        Log.info("Starting module: " + this.name);
        this.apiKey = this.config.apiKey || ""
        this.updateInterval = this.config.updateInterval
        // Initialize quote data as an object
        this.quoteData = {
            quote: "Loading...",
            speaker: "Loading...",
            story: "Loading...",
            source: "Loading..."
        };

        if(!this.updateInterval || this.updateInterval === "") {
            console.log("Default updateInterval is 10 minutes");
            this.updateInterval = 600000;
        }

        // if (!this.apiKey || this.apiKey === "") {
        //     Log.error("MMM-HP-Quotes: No API key provided!");
        //     return;
        // }

        this.sendSocketNotification("SET_UPDATE_INTERVAL", this.updateInterval);

        // Send API key to node_helper
        this.sendSocketNotification("SET_API_KEY", this.apiKey);

        // Fetch an initial quote
        this.sendSocketNotification("GET_NEW_QUOTE");

        // Request a new quote every `updateInterval` (3 minutes)
        setInterval(() => {
            this.sendSocketNotification("GET_NEW_QUOTE");
        }, this.config.updateInterval);
    },

    getHeader: function () {
        return "Harry Potter quotes"
      },

    getDom: function () {
        const wrapper = document.createElement("div");
        wrapper.className="quote";
        wrapper.innerHTML = `
            <div >
                <blockquote><strong>${this.quoteData.quote}</strong>
                    <cite> - <strong>${this.quoteData.speaker}</cite> <strong>
                </blockquote>
            </div>
            <div><strong>Story:</strong> ${this.quoteData.story}</div>
            <div><strong>Source:</strong> ${this.quoteData.source}</div>
        `;

        return wrapper;
    },
    // get notification from the backend
    // socketNotificationReceived: function (notification, payload) {
    //     if (notification === "NEW_QUOTE") {
    //         console.log("New quote received:", payload.quote);

    //         // Update the data and the DOM
    //         this.quoteData = {
    //             quote: payload.quote,
    //             speaker: payload.speaker,
    //             story: payload.story,
    //             source: payload.source,
    //         };

    //         // Update the DOM with fade effect
    //         this.updateDom(this.config.fadeSpeed);
    //     }
    // }
    socketNotificationReceived : async function(notification, payload){
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
}
    
});