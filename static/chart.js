var cpuCtx = document.getElementById('cpuChart').getContext('2d');
var cpuChart = new Chart(cpuCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'CPU Usage (%)',
            data: [],
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            fill: false
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    color: 'white'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.2)'
                }
            },
            x: {
                ticks: {
                    color: 'white'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.2)'
                }
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: 'white'
                }
            }
        }
    }
});

var cpuFreqCtx = document.getElementById('cpuFreqChart').getContext('2d');
var cpuFreqChart = new Chart(cpuFreqCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'CPU Frequency (MHz)',
            data: [],
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
            fill: false
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: false,
                ticks: {
                    color: 'white'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.2)'
                }
            },
            x: {
                ticks: {
                    color: 'white'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.2)'
                }
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: 'white'
                }
            }
        }
    }
});

var memoryCtx = document.getElementById('memoryChart').getContext('2d');
var memoryChart = new Chart(memoryCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Memory Usage (%)',
            data: [],
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
            fill: false
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    color: 'white' // Set label color to white
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.2)'
                }
            },
            x: {
                ticks: {
                    color: 'white' // Set label color to white
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.2)'
                }
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: 'white' // Set legend text color to white
                }
            }
        }
    }
});

var networkCtx = document.getElementById('networkChart').getContext('2d');
var networkChart = new Chart(networkCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Bytes Sent',
                data: [],
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 2,
                fill: false
            },
            {
                label: 'Bytes Received',
                data: [],
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false
            }
        ]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    color: 'white'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.2)'
                }
            },
            x: {
                ticks: {
                    color: 'white'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.2)'
                }
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: 'white'
                }
            }
        }
    }
});

function updateChart() {
    fetch('/data')
        .then(response => response.json())
        .then(data => {
            const timestamps = data.map(item => new Date(item.timestamp * 1000).toLocaleTimeString());
            const cpuUsages = data.map(item => item.cpu);

            cpuChart.data.labels = timestamps;
            cpuChart.data.datasets[0].data = cpuUsages;
            cpuChart.update();

            fetch('/data/cpu_freq')
                .then(response => response.json())
                .then(data => {
                    const cpuFreqs = data.map(item => item.cpu_freq);

                    cpuFreqChart.data.labels = timestamps;
                    cpuFreqChart.data.datasets[0].data = cpuFreqs;
                    cpuFreqChart.update();
                });

            fetch('/data/memory')
                .then(response => response.json())
                .then(data => {
                    const memoryUsages = data.map(item => item.memory);

                    memoryChart.data.labels = timestamps;
                    memoryChart.data.datasets[0].data = memoryUsages;
                    memoryChart.update();
                });

            // Network Chart
            fetch('/data/network')
                .then(response => response.json())
                .then(data => {
                    const bytesSent = data.map(item => item.bytes_sent);
                    const bytesReceived = data.map(item => item.bytes_recv);

                    networkChart.data.labels = timestamps;
                    networkChart.data.datasets[0].data = bytesSent;
                    networkChart.data.datasets[1].data = bytesReceived;
                    networkChart.update();
                })
                .catch(error => console.error('Error fetching network data:', error));  // Tambahkan ini untuk debug
        });
}

setInterval(updateChart, 5000);