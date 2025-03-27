document.addEventListener("DOMContentLoaded", function () {
    fetchChargers();
    
    // Open modal when clicking "Add Charger"
    document.getElementById("addChargerBtn").addEventListener("click", function () {
        document.getElementById("modalTitle").innerText = "Add Charger";
        document.getElementById("chargerId").value = "";
        document.getElementById("location").value = "";
        document.getElementById("status").value = "available";
        document.getElementById("lastServiced").value = "";
        openModal();
    });

    // Close modal when clicking "X"
    document.querySelector(".close").addEventListener("click", closeModal);
});

// Function to Fetch and Display Chargers (READ)
async function fetchChargers() {
    const chargersTable = document.getElementById("chargersTable");

    try {
        const response = await fetch("/api/chargers");
        const chargers = await response.json();

        chargersTable.innerHTML = chargers.map(charger => `
            <tr>
                <td>${charger.charger_id}</td>
                <td>${charger.location}</td>
                <td>${charger.status}</td>
                <td>${charger.last_serviced_date}</td>
                <td>
                    <button class="edit-btn" onclick="editCharger(${charger.charger_id}, '${charger.location}', '${charger.status}', '${charger.last_serviced_date}')">Edit</button>
                    <button class="delete-btn" onclick="deleteCharger(${charger.charger_id})">Delete</button>
                </td>
            </tr>
        `).join("");

    } catch (error) {
        console.error("Error fetching chargers:", error);
    }
}

// Function to Add or Update a Charger (CREATE/UPDATE)
document.getElementById("chargerForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const chargerId = document.getElementById("chargerId").value;
    const location = document.getElementById("location").value;
    const status = document.getElementById("status").value;
    const lastServiced = document.getElementById("lastServiced").value;

    const chargerData = { location, status, last_serviced_date: lastServiced };
    
    let response;
    if (chargerId) {
        // Update existing charger
        response = await fetch(`/api/chargers/${chargerId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(chargerData)
        });
    } else {
        // Add new charger
        response = await fetch("/api/chargers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(chargerData)
        });
    }

    if (response.ok) {
        fetchChargers(); // Refresh list
        closeModal();
    } else {
        console.error("Failed to save charger");
    }
});

// Function to Edit a Charger (OPEN MODAL FOR EDIT)
function editCharger(id, location, status, lastServiced) {
    document.getElementById("modalTitle").innerText = "Edit Charger";
    document.getElementById("chargerId").value = id;
    document.getElementById("location").value = location;
    document.getElementById("status").value = status;
    document.getElementById("lastServiced").value = lastServiced;
    
    openModal();
}

// Function to Delete a Charger
async function deleteCharger(id) {
    if (confirm("Are you sure you want to delete this charger?")) {
        const response = await fetch(`/api/chargers/${id}`, { method: "DELETE" });

        if (response.ok) {
            fetchChargers(); // Refresh list
        } else {
            console.error("Failed to delete charger");
        }
    }
}

// Function to Open Modal
function openModal() {
    document.getElementById("chargerModal").style.display = "flex";
}

// Function to Close Modal
function closeModal() {
    document.getElementById("chargerModal").style.display = "none";
}

// Close modal if clicking outside of it
window.onclick = function (event) {
    const modal = document.getElementById("chargerModal");
    if (event.target === modal) {
        closeModal();
    }
};
