document.addEventListener("DOMContentLoaded", function () {
    fetchMaintenanceReports();

    document.getElementById("reportIssueBtn").addEventListener("click", function () {
        document.getElementById("reportForm").reset();
        document.getElementById("reportModal").style.display = "flex";
    });

    document.getElementById("reportForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        const chargerId = document.getElementById("chargerIdInput").value;
        const reportedBy = document.getElementById("reportedByInput").value;
        const issueDescription = document.getElementById("issueDescriptionInput").value;

        const response = await fetch("/api/maintenance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ charger_id: chargerId, reported_by: reportedBy, issue_description: issueDescription })
        });

        if (response.ok) {
            closeModal();
            fetchMaintenanceReports();
        } else {
            console.error("Failed to submit report");
        }
    });
});

function showTab(event, tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById(tab + 'Tab').style.display = 'block';
    event.target.classList.add('active');

    if (tab === 'tickets') fetchOpenTickets();
}

async function fetchMaintenanceReports() {
    const maintenanceTable = document.getElementById("maintenanceTable");
    try {
        const response = await fetch("/api/maintenance");
        const reports = await response.json();

        maintenanceTable.innerHTML = reports.map(report => `
            <tr>
                <td>${report.report_id}</td>
                <td>${report.charger_id}</td>
                <td>${report.reported_by}</td>
                <td>${report.issue_description}</td>
                <td>${report.status}</td>
                <td>
                    <button class="view-btn" onclick="openReport(${report.report_id}, ${report.charger_id}, '${report.reported_by}', '${report.issue_description}', '${report.status}')">View</button>
                </td>
            </tr>
        `).join("");

    } catch (error) {
        console.error("Error fetching maintenance reports:", error);
    }
}

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

async function createTicket() {
    const reportId = document.getElementById("reportId").innerText;
    const assignedTo = document.getElementById("assignedTo").value;

    const response = await fetch(`/api/maintenance/${reportId}/assign`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assigned_to: assignedTo })
    });

    if (response.ok) {
        alert("Ticket created and assigned.");
        closeModal();
        fetchMaintenanceReports();
    } else {
        console.error("Failed to assign ticket.");
    }
}

async function fetchOpenTickets() {
    const table = document.getElementById("ticketsTable");
    try {
        const res = await fetch("/api/maintenance");
        const reports = await res.json();
        const openTickets = reports.filter(r => r.status === 'in_progress');

        table.innerHTML = openTickets.map(report => `
            <tr>
                <td>${report.report_id}</td>
                <td>${report.charger_id}</td>
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
        fetchOpenTickets();
        fetchMaintenanceReports();
    } else {
        console.error("Failed to resolve ticket.");
    }
}

function closeModal() {
    document.getElementById("reportModal").style.display = "none";
}
