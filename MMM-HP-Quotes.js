Module.register("MMM-HP-Quotes", {
    defaults: {
        fadeSpeed: 4000,
    },

    start: function () {
        Log.info("Starting module: " + this.name);
        this.updateInterval = this.config.updateInterval || 600000; // Default to 10 minutes

        this.quoteData = {
            quote: "Loading...",
            speaker: "Loading...",
            story: "Loading...",
            source: "Loading...",
        };
        // init quote
        this.sendSocketNotification("GET_NEW_QUOTE");

        setInterval(() => {
            // request new quote with default or user set interval.
            this.sendSocketNotification("GET_NEW_QUOTE");
        }, this.updateInterval);
    },

    getHeader: function() {
        return "Harry Potter Quotes"
    },

    getDom: function () {
        const wrapper = document.createElement("div");
        wrapper.className = "quote";
        wrapper.innerHTML = `
            <div>
                <blockquote><strong>${this.quoteData.quote}</strong>
                    <cite> - <strong>${this.quoteData.speaker}</strong></cite>
                </blockquote>
            </div>
            <div><strong>Story:</strong> ${this.quoteData.story}</div>
            <div><strong>Source:</strong> ${this.quoteData.source}</div>
        `;
        return wrapper;
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "NEW_QUOTE") {
            this.quoteData = payload;
            this.updateDom(this.config.fadeSpeed);
        }
    }
});
