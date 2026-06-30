let currentPage = 1;
const logsPerPage = 10;

function loadLogs(page) {
    const offset = (page - 1) * logsPerPage;
    
    fetch(`/api/logsinfo?limit=${logsPerPage}&offset=${offset}`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
    })
    .then(response => {
        if (response.status === 401) {
            window.location.href = "/auth/";
            return;
        }
        return response.json();
    })
    .then(data => {
        if (!data) return;
        if (data.message) {
            console.error(data.message);
            return;
        }

        updateStats(data.stats);
        updateConcepts(data.concepts);
        updateLogsList(data.logs);
        updatePagination(data.stats.total_visited, page);
    })
    .catch(error => console.error("Error loading logs:", error));
}

function updateStats(stats) {
    document.getElementById("stat-total").textContent = stats.total_visited;
    document.getElementById("stat-to").textContent = stats.to_count;
    document.getElementById("stat-lo").textContent = stats.lo_count;
    document.getElementById("concept-count").textContent = stats.concept_count;
    document.getElementById("recent-X").textContent = stats.total_visited;
}

function updateConcepts(concepts) {
    const conceptsList = document.getElementById("concepts");
    conceptsList.innerHTML = "";
    
    if (concepts.length === 0) {
        conceptsList.innerHTML = "<li>Žádné koncepty</li>";
        return;
    }

    concepts.forEach(concept => {
        const li = document.createElement("li");
        li.innerHTML = `
            <h3>${concept[6] || 'Neznámý objekt'}</h3>
            <p>${concept[3]}</p>
            <small>Naposledy upraveno: ${formatDate(concept[5])}</small>
            <button class="edit-log-btn" data-log-id="${concept[0]}">Upravit</button>
        `;
        conceptsList.appendChild(li);
    });
}

function updateLogsList(logs) {
    const logsList = document.getElementById("recent");
    logsList.innerHTML = "";
    
    if (logs.length === 0) {
        logsList.innerHTML = "<li>Žádné logy</li>";
        return;
    }

    logs.forEach(log => {
        const li = document.createElement("li");
        li.innerHTML = `
            <h3>${log[6] || 'Neznámý objekt'}</h3>
            <p>${log[3]}</p>
            <small>Přidáno: ${formatDate(log[5])}</small>
            <button class="edit-log-btn" data-log-id="${log[0]}">Upravit</button>
        `;
        logsList.appendChild(li);
    });
}

function formatDate(dateStr) {
    try {
        const d = new Date(dateStr);
        return d.toLocaleString('cs-CZ', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return dateStr;
    }
}

function updatePagination(totalLogs, page) {
    const totalPages = Math.ceil(totalLogs / logsPerPage);
    const pageInfo = document.getElementById("page-info");
    if (pageInfo) {
        pageInfo.textContent = `Strana ${page} z ${totalPages || 1}`;
    }
    const prevBtn = document.getElementById("prev-page");
    if (prevBtn) {
        prevBtn.disabled = page <= 1;
    }
    const nextBtn = document.getElementById("next-page");
    if (nextBtn) {
        nextBtn.disabled = page >= totalPages || totalPages === 0;
    }
}

document.getElementById("prev-page")?.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        loadLogs(currentPage);
    }
});

document.getElementById("next-page")?.addEventListener("click", () => {
    currentPage++;
    loadLogs(currentPage);
});

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-log-btn")) {
        const logId = e.target.dataset.logId;
        editLog(logId);
    }
});

function editLog(logId) {
    fetch(`/api/log/detail`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ log_id: logId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.log_text !== undefined) {
            openLogEditor(logId, data.log_text, data.bunker_id, data.type);
        } else {
            console.error("Error:", data.message);
        }
    })
    .catch(error => console.error("Error fetching log:", error));
}

function openLogEditor(logId, text, bunkerId, type) {
    const url = new URL(window.location.origin + '/logs/log/');
    url.searchParams.append('bunker_id', bunkerId);
    url.searchParams.append('type', type);
    url.searchParams.append('edit', logId);
    window.location.href = url.toString();
}

// Initial load
document.addEventListener("DOMContentLoaded", () => {
    loadLogs(currentPage);
});
