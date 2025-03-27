document.addEventListener("DOMContentLoaded", function () {
    fetchActiveChargers();
    fetchReportedIssues();
    fetchOpenTicketsCount();
});

// Function to fetch active charger count
async function fetchActiveChargers() {
    try {
        const response = await fetch("/api/chargers/active-count");
        const data = await response.json();
        document.getElementById("activeChargersCount").innerText = data.active_chargers;
    } catch (error) {
        console.error("Error fetching active chargers:", error);
    }
}

// Function to fetch unresolved report count
async function fetchReportedIssues() {
    try {
        const response = await fetch("/api/maintenance/unresolved-count");
        const data = await response.json();
        document.getElementById("reportedIssuesCount").innerText = data.issue_count;
    } catch (error) {
        console.error("Error fetching reported issues:", error);
    }
}

// Function to fetch open ticket count
async function fetchOpenTicketsCount() {
    try {
        const response = await fetch("/api/maintenance/open-tickets-count");
        const data = await response.json();
        document.getElementById("openTicketsCount").innerText = data.ticket_count;
    } catch (error) {
        console.error("Error fetching open tickets:", error);
    }
}
