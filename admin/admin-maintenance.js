document.addEventListener("DOMContentLoaded", function () {
    // Fetch data for reports and open tickets on page load
    fetchMaintenanceReports();
    fetchOpenTickets();

    // Add event listener for the 'Report Issue' button
    document.getElementById("reportIssueBtn").addEventListener("click", function () {
        document.getElementById("reportForm").reset();
        document.getElementById("reportModal").style.display = "flex";
    });

    // Add event listener for the 'Pending Reports' tab
    document.querySelector(".tab-btn.active").addEventListener("click", function (event) {
        showTab(event, 'pending');
    });

    // Add event listener for the 'Open Tickets' tab
    document.querySelectorAll(".tab-btn")[1].addEventListener("click", function (event) {
        showTab(event, 'tickets');
    });
});

// Function to show the correct tab
function showTab(event, tab) {
    // Hide all tabs and remove 'active' class from all buttons
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    // Show the selected tab
    document.getElementById(tab + 'Tab').style.display = 'block';
    event.target.classList.add('active');

    // If it's the 'tickets' tab, fetch open tickets
    if (tab === 'tickets') fetchOpenTickets();
}

// Function to fetch maintenance reports
async function fetchMaintenanceReports() {
    const maintenanceTable = document.getElementById("maintenanceTable");

    try {
        const response = await fetch("/api/maintenance");
        const reports = await response.json();

        maintenanceTable.innerHTML = reports.map(report => `
            <tr>
                <td>${report.report_id}</td>
                <td>${report.chargerid}</td>
                <td>${report.reported_by}</td>
                <td>${report.issue_description}</td>
                <td>${report.status}</td>
                <td>
                    <button class="view-btn" onclick="openReport(${report.report_id}, ${report.chargerid}, '${report.reported_by}', '${report.issue_description}', '${report.status}')">View</button>
                </td>
            </tr>
        `).join("");
    } catch (error) {
        console.error("Error fetching maintenance reports:", error);
    }
}

// Function to fetch open tickets
async function fetchOpenTickets() {
    const ticketsTable = document.getElementById("ticketsTable");

    try {
        const response = await fetch("/api/maintenance");
        const reports = await response.json();
        const openTickets = reports.filter(r => r.status === 'in_progress');

        ticketsTable.innerHTML = openTickets.map(report => `
            <tr>
                <td>${report.report_id}</td>
                <td>${report.chargerid}</td>
                <td>${report.assigned_to || "Unassigned"}</td>
                <td>${report.issue_description}</td>
                <td><textarea id="resolution_${report.report_id}" placeholder="Add resolution note"></textarea></td>
                <td><button onclick="submitResolution(${report.report_id})">Resolve</button></td>
            </tr>
        `).join("");
    } catch (err) {
        console.error("Failed to fetch open tickets:", err);
    }
}

// Function to submit the resolution for a ticket
async function submitResolution(reportId) {
    const note = document.getElementById(`resolution_${reportId}`).value;
    if (!note) return alert("Please enter a resolution note.");

    const res = await fetch(`/api/maintenance/${reportId}/resolve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolution_note: note })
    });

    if (res.ok) {
        alert("Ticket resolved!");
        fetchOpenTickets(); // Refresh the open tickets list
        fetchMaintenanceReports(); // Refresh the reports list
    } else {
        console.error("Failed to resolve ticket.");
    }
}

// Function to open report details in a modal
function openReport(id, chargerId, reportedBy, description, status) {
    document.getElementById("reportId").innerText = id;
    document.getElementById("chargerId").innerText = chargerId;
    document.getElementById("reportedBy").innerText = reportedBy;
    document.getElementById("issueDescription").innerText = description;
    document.getElementById("reportStatus").innerText = status;

    const resolveBtn = document.getElementById("resolveBtn");
    resolveBtn.style.display = status === "resolved" ? "none" : "block";

    document.getElementById("reportModal").style.display = "flex";
}

// Function to resolve the issue (mark as solved)
async function resolveIssue() {
    const reportId = document.getElementById("reportId").innerText;

    const response = await fetch(`/api/maintenance/${reportId}/resolve`, {
        method: "PUT"
    });

    if (response.ok) {
        closeModal();
        fetchMaintenanceReports();
    } else {
        console.error("Failed to resolve issue");
    }
}

// Function to delete the report
async function deleteReport() {
    const reportId = document.getElementById("reportId").innerText;

    if (confirm("Are you sure you want to close this report?")) {
        const response = await fetch(`/api/maintenance/${reportId}`, { method: "DELETE" });

        if (response.ok) {
            closeModal();
            fetchMaintenanceReports();
        } else {
            console.error("Failed to delete report");
        }
    }
}

// Function to open the modal
function openModal() {
    document.getElementById("reportModal").style.display = "flex";
}

// Function to close the modal
function closeModal() {
    document.getElementById("reportModal").style.display = "none";
}
