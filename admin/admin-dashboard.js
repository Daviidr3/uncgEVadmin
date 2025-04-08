document.addEventListener("DOMContentLoaded", function () {
    fetchActiveChargers();
    fetchReportedIssues();
    fetchOpenTicketsCount();
    fetchMaintenanceStatus();  // New function for the chart
});

// Function to fetch active charger count
async function fetchActiveChargers() {
    try {
        const response = await fetch("/api/chargers/active-count");
        const data = await response.json();
        document.getElementById("activeChargersCount").innerText = data.active_chargers || 0;
    } catch (error) {
        console.error("Error fetching active chargers:", error);
        document.getElementById("activeChargersCount").innerText = 'Error';
    }
}

// Function to fetch unresolved report count
async function fetchReportedIssues() {
    try {
        const response = await fetch("/api/maintenance/unresolved-count");
        const data = await response.json();
        document.getElementById("reportedIssuesCount").innerText = data.issue_count || 0;
    } catch (error) {
        console.error("Error fetching reported issues:", error);
        document.getElementById("reportedIssuesCount").innerText = 'Error';
    }
}

// Function to fetch open ticket count
async function fetchOpenTicketsCount() {
    try {
        const response = await fetch("/api/maintenance/open-tickets-count");
        const data = await response.json();
        document.getElementById("openTicketsCount").innerText = data.ticket_count || 0;
    } catch (error) {
        console.error("Error fetching open tickets:", error);
        document.getElementById("openTicketsCount").innerText = 'Error';
    }
}

// Function to fetch maintenance report status for the chart (e.g., pending, in-progress, resolved)
async function fetchMaintenanceStatus() {
    try {
        const response = await fetch("/api/maintenance/status-counts");
        const data = await response.json();

        // Prepare data for the chart with fallback in case data is missing
        const chartData = {
            labels: ['Pending', 'In Progress', 'Resolved'],
            datasets: [{
                label: 'Maintenance Report Status',
                data: [
                    data.pending || 0,  // Default to 0 if the data is missing
                    data.in_progress || 0,
                    data.resolved || 0
                ],
                backgroundColor: ['#ffcc00', '#3498db', '#2ecc71'],
                hoverOffset: 4
            }]
        };

        // Create the chart
        const ctx = document.getElementById('maintenanceStatusChart').getContext('2d');
        const maintenanceStatusChart = new Chart(ctx, {
            type: 'pie',
            data: chartData,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function (tooltipItem) {
                                return tooltipItem.label + ': ' + tooltipItem.raw + ' reports';
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error fetching maintenance report status:", error);
    }
}
