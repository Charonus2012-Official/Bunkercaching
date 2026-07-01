window.addEventListener("load", function () {
    fetch("/api/admin/stats", {
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
        })
        .then(data => {
            document.getElementById("total-users").textContent = data.total_users;
            document.getElementById("admin-users").textContent = data.admin_users;
            document.getElementById("total-bunkry").textContent = data.total_bunkry;
            document.getElementById("total-ropiky").textContent = data.total_ropiky;
            document.getElementById("total-tvrze").textContent = data.total_tvrze;
            document.getElementById("total-logs").textContent = data.total_logs;

            const ctx = document.getElementById("logsChart").getContext("2d");
            const labels = data.logs_by_date.map(item => item.date);
            const values = data.logs_by_date.map(item => item.count);

            new Chart(ctx, {
                type: "line",
                data: {
                    labels: labels,
                    datasets: [{
                        label: "Počet logů",
                        data: values,
                        borderColor: "#4CAF50",
                        backgroundColor: "rgba(76, 175, 80, 0.1)",
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true,
                            labels: {
                                color: "#333",
                                font: {
                                    family: '"IBM Plex Sans", sans-serif'
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: "#e0e0e0"
                            },
                            ticks: {
                                color: "#666",
                                stepSize: 1
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                color: "#666",
                                maxTicksLimit: 10
                            }
                        }
                    }
                }
            });
        })
        .catch(err => {
            console.error(err);
            document.querySelector(".admin-container").innerHTML =
                "<p class='error'>Nepodařilo se načíst statistiky. Zkontrolujte, zda jste přihlášený jako admin.</p>";
        });
});
