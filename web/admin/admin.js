(function () {
    let chartInstance = null;

    function fetchStats() {
        return fetch("/api/admin/stats", {
            method: "POST",
            credentials: "include",
        })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 403) {
                        window.location.href = "/";
                    }
                    throw new Error("Chyba načítání statistik");
                }
                return response.json();
            });
    }

    function renderChart(logsByDate, type = "line") {
        const ctx = document.getElementById("logsChart").getContext("2d");
        const labels = logsByDate.map(item => item.date).reverse();
        const values = logsByDate.map(item => item.count).reverse();

        if (chartInstance) {
            chartInstance.destroy();
        }

        chartInstance = new Chart(ctx, {
            type: type,
            data: {
                labels: labels,
                datasets: [{
                    label: "Počet logů",
                    data: values,
                    borderColor: "#4CAF50",
                    backgroundColor: type === 'bar' ? "rgba(76,175,80,0.6)" : "rgba(76, 175, 80, 0.1)",
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true, grid: { color: "#e0e0e0" }, ticks: { color: "#666" } },
                    x: { grid: { display: false }, ticks: { color: "#666" } }
                }
            }
        });
    }

    function populateSummary(data) {
        document.getElementById("total-users").textContent = data.total_users;
        document.getElementById("admin-users").textContent = data.admin_users;
        document.getElementById("total-bunkry").textContent = data.total_bunkry;
        document.getElementById("total-ropiky").textContent = data.total_ropiky;
        document.getElementById("total-tvrze").textContent = data.total_tvrze;
        document.getElementById("total-logs").textContent = data.total_logs;
    }

    function populateTable(logsByDate) {
        const tbody = document.querySelector('#logs-table tbody');
        tbody.innerHTML = '';
        const rows = logsByDate.slice().reverse();
        rows.forEach(r => {
            const tr = document.createElement('tr');
            const tdDate = document.createElement('td');
            tdDate.textContent = r.date;
            const tdCount = document.createElement('td');
            tdCount.textContent = r.count;
            tr.appendChild(tdDate);
            tr.appendChild(tdCount);
            tbody.appendChild(tr);
        });
    }

    function downloadCSV(logsByDate) {
        const rows = [['date', 'count']].concat(logsByDate.slice().reverse().map(r => [r.date, r.count]));
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'logs_30days.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    function showError(msg) {
        const container = document.querySelector('.admin-container');
        container.innerHTML = `<p class='error'>${msg}</p>`;
    }

    function init() {
        const refreshBtn = document.getElementById('refresh-btn');
        const exportBtn = document.getElementById('export-csv');
        const chartType = document.getElementById('chart-type');

        refreshBtn.addEventListener('click', () => {
            refreshBtn.disabled = true;
            fetchStats()
                .then(data => {
                    populateSummary(data);
                    populateTable(data.logs_by_date);
                    renderChart(data.logs_by_date, chartType.value);
                })
                .catch(err => {
                    console.error(err);
                    showError('Nepodařilo se načíst statistiky.');
                })
                .finally(() => refreshBtn.disabled = false);
        });

        exportBtn.addEventListener('click', () => {
            fetchStats().then(data => downloadCSV(data.logs_by_date)).catch(err => console.error(err));
        });

        chartType.addEventListener('change', () => {
            // re-render with new type
            if (!chartInstance) return;
            fetchStats().then(data => renderChart(data.logs_by_date, chartType.value)).catch(err => console.error(err));
        });

        // initial load
        fetchStats()
            .then(data => {
                populateSummary(data);
                populateTable(data.logs_by_date);
                renderChart(data.logs_by_date, document.getElementById('chart-type').value);
            })
            .catch(err => {
                console.error(err);
                showError('Nepodařilo se načíst statistiky. Zkontrolujte, zda jste přihlášený jako admin.');
            });
    }

    window.addEventListener('load', init);
})();
