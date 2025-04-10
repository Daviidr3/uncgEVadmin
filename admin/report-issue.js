document.addEventListener("DOMContentLoaded", function () {
    fetchUserReports(); // Fetch past reports for display

    // Handle report submission
    document.getElementById("reportForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        const chargerId = document.getElementById("chargerId").value;
        const reportedBy = "User"; // Always sets "Reported By" as "User"
        const issueDescription = document.getElementById("issueDescription").value;
        const reportMessage = document.getElementById("reportMessage");

        const response = await fetch("/api/maintenance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chargerid: chargerId, reported_by: reportedBy, issue_description: issueDescription })
        });

        if (response.ok) {
            reportMessage.innerText = "Issue reported successfully!";
            reportMessage.style.color = "green";
            reportMessage.classList.remove("hidden");
            document.getElementById("reportForm").reset();
            fetchUserReports(); // Refresh user reports
        } else {
            reportMessage.innerText = "Failed to report issue. Please try again.";
            reportMessage.style.color = "red";
            reportMessage.classList.remove("hidden");
        }
    });
});

// Fetch and Display User's Past Reports
async function fetchUserReports() {
    const reportList = document.getElementById("userReportTable");

    if (!reportList) return; // Skip if no table exists

    try {
        const response = await fetch("/api/maintenance");
        const reports = await response.json();

        reportList.innerHTML = reports.map(report => `
            <tr>
                <td>${report.report_id}</td>
                <td>${report.chargerid}</td>
                <td>${report.issue_description}</td>
                <td>${report.status}</td>
            </tr>
        `).join("");

    } catch (error) {
        console.error("Error fetching user maintenance reports:", error);
    }
}
