# Realtime System Monitoring

**Simple real-time system monitoring** merupakan aplikasi yang berfokus pada pengiriman data **CPU Usage**, **CPU Frequency**, **Virtual Memory Usage**, dan **Network (*bytes_sent* dan *bytes_received*)** dari komputer ke **Firebase**,
kemudian menampilkan data-data tersebut secara real-time di website menggunakan **Flask** yang di-deploy ke **Vercel**. Anda dapat memodifikasinya untuk mengirim dan menampilkan data lainnya secara real-time.

***

## Langkah-Langkah Visualisasi:
### Pre-steps:
<ol>
  <li><strong>Python 3.x</strong> yang sudah terinstall pada komputer. Jika belum menginstall python dan conda environment, baca <a href="https://mctm.web.id/course/env-install">tutorial berikut.</a></li>
  <li>Install <a href="https://docs.npmjs.com/downloading-and-installing-node-js-and-npm">npm</a> dan <a href="https://vercel.com/docs/cli/install">Vercel CLI.</a></li>
  <li><a href="https://firebase.google.com">Firebase Account </a>agar dapat mengakses ke <strong>Private Key</strong> dan <strong>Firebase Realtime Database.</strong></li>
  <li>Library <strong>psutil</strong> yang akan digunakan untuk mengambil data sistem.</li>
  <li><strong>Flask App</strong> yang akan digunakan untuk menampilkan data di web.</li>
</ol>

***

### Langkah 1: Membuat Firebase Project
1. **Buat Firebase Project:**
   - Pergi ke [Firebase Console](https://console.firebase.google.com), kemudian buat project baru.
   - Setelah project dibuat, buka bagian **Product categories > Build > Realtime Database** dan klik **Create Database**.
2. **Setting Firebase Realtime Database:**
   - Setting database dalam mode **Test Mode** agar bisa **read and write** tanpa melakukan autentikasi selama pengembangan.
3. **Download Firebase Admin SDK:**
   - Buka **Project Settings** (logo gear disebelah *Project Overview*) di Firebase Console, kemudian masuk ke tab **Service Account**.
   - Klik **Generate New Private Key** untuk mendapatkan file **JSON** yang akan digunakan di project kita nanti.

***

### Langkah 2: Conda Virtual Environment
1. Buka VSCode melalui **Anaconda/Miniconda** yang sudah diinstall.
2. **Membuat Conda Environment:**
   
   Buat environment baru pada terminal di VSCode dengan perintah berikut:
   
   ```bash
   conda create -n {nama_env} python=3.10
   ```
   
3. **Mengaktifkan Conda Environment:**
   
   Perintah mengaktifkan conda environment yang baru dibuat:
   
   ```bash
   conda activate {nama_env}
   ```
   
4. **Install Dependency Python**
   
   Setelah mengaktifkan environment, buat file `requirements.txt` dengan isi sebagai berikut (jika belum ada):
   
   ```txt
   Flask==2.0.1
   Werkzeug==2.0.1
   firebase-admin==5.0.0
   psutil
   ```

   Install dependencies menggunakan `pip`:
   
   ```bash
   pip install -r requirements.txt
   ```

***

### Langkah 3: Script Python untuk Mengirim Data System Utilities ke Firebase
Buat file Python dengan nama `send_data.py` untuk mengirim data **CPU Usage**, **CPU Frequency**, **Virtual Memory Usage**, dan **Network (*bytes_sent* dan *bytes_received*)** secara real-time.

```python

import firebase_admin
from firebase_admin import credentials, db
import psutil
import time

# Inisialisasi Firebase Admin SDK
cred = credentials.Certificate("path/to/your-serviceAccountKey.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://your-project-url.firebasedatabase.app/'
})

# Referensi send data ke Firebase
# CPU info
ref_cpu = db.reference('cpu_usage')
ref_cpuFreq = db.reference('cpu_frequency')

ref_memoryInfo = db.reference('memory_usage') # Memory info
ref_network = db.reference('network_usage') # Network info

# Fungsi untuk mengirim data ke Firebase
def push_cpu_data():
    while True:
        # Get CPU Usage
        cpu_percent = psutil.cpu_percent(interval=1)
        cpu_freq = psutil.cpu_freq(percpu=False)

        memory_percent = psutil.virtual_memory().percent # Get Memory Usage
        network_info = psutil.net_io_counters() # Get network usage

        data_cpu = {
            'cpu': cpu_percent,
            'timestamp': time.time()  # Menyimpan timestamp
        }

        data_cpuFreq = {
            'cpu_freq': cpu_freq.current,
            'timestamp': time.time()
        }

        data_memory = {
            'memory': memory_percent,
            'timestamp': time.time()
        }

        data_netInfo = {
            'bytes_sent': network_info.bytes_sent,
            'bytes_recv': network_info.bytes_recv,
            'timestamp': time.time()
        }

        # Push data ke Firebase
        ref_cpu.push(data_cpu)
        ref_cpuFreq.push(data_cpuFreq)
        ref_memoryInfo.push(data_memory)
        ref_network.push(data_netInfo)

        print(f"Data sent to Firebase: {data_cpu} & {data_cpuFreq} & {data_memory} & {data_netInfo}")
        time.sleep(5) 

if __name__ == "__main__":
    push_cpu_data()

```

Test jalankan script `send_data.py` dengan perintah berikut:

```bash
python send_data.py
```

Script ini akan mengirim data **CPU Usage**, **CPU Frequency**, **Virtual Memory Usage**, dan **Network (*bytes_sent* dan *bytes_received*)** ke Firebase dengan rentang durasi setiap 5 detik. Pastikan `path/to/your-serviceAccountKey.json` diubah sesuai lokasi
tempat menyimpan file JSON Firebase yang sudah digenerate, serta pastikan `https://your-project-url.firebasedatabase.app/` diganti sesuai url pada database anda.

***

### Langkah 4: Membuat Aplikasi Flask untuk Visualisasi Data
1. **Membuat Flask App:**

   Buat file python dengan nama `app.py` yang akan digunakan sebagai aplikasi web dengan **Flask**.

   ```python
   
   from flask import Flask, render_template, jsonify
   import firebase_admin
   from firebase_admin import credentials, db
   import os

   app = Flask(__name__)

   # Inisialisasi Firebase Admin SDK
   cred = credentials.Certificate("path/to/your-serviceAccountKey.json")
   firebase_admin.initialize_app(cred, {
       'databaseURL': 'https://your-project-url.firebasedatabase.app/'
   })

   # Referensi
   # CPU info
   ref_cpu = db.reference('cpu_usage')
   ref_cpuFreq = db.reference('cpu_frequency')

   # Memory info
   ref_memoryInfo = db.reference('memory_usage')
   ref_swapInfo = db.reference('swap_info')
    
   ref_network = db.reference('network_usage') # Network info
    
   @app.route('/')
   def index():
       return render_template('index.html')

   @app.route('/about')
   def about():
       return render_template('about.html')
    
   @app.route('/data')
   def get_data_cpu():
       snapshot_cpu = ref_cpu.order_by_key().limit_to_last(10).get()  # Ambil 10 data terakhir
       data_cpu = [{'cpu': value['cpu'], 'timestamp': value['timestamp']} for key, value in snapshot_cpu.items()]
       return jsonify(data_cpu)

   @app.route('/data/cpu_freq')
   def get_data_cpu_freq():
       snapshot_cpuFreq = ref_cpuFreq.order_by_key().limit_to_last(10).get()
       data_cpuFreq = [{'cpu_freq': value['cpu_freq'], 'timestamp': value['timestamp']} for key, value in snapshot_cpuFreq.items()]
       return jsonify(data_cpuFreq)
    
   @app.route('/data/memory')
   def get_data_memory():
       snapshot_memory = ref_memoryInfo.order_by_key().limit_to_last(10).get()
       data_memory = [{'memory': value['memory'], 'timestamp': value['timestamp']} for key, value in snapshot_memory.items()]
       return jsonify(data_memory)

   @app.route('/data/network')
   def get_data_network():
       try:
           snapshot_net = ref_network.order_by_key().limit_to_last(10).get()
           print(snapshot_net)  # Menampilkan data yang diambil dari Firebase
        
            data_net = []
            for key, value in snapshot_net.items():
                # Memastikan data yang diinginkan ada
                if 'bytes_sent' in value and 'bytes_recv' in value:
                    data_net.append({
                        'bytes_sent': value['bytes_sent'],
                        'bytes_recv': value['bytes_recv'],
                        'timestamp': value['timestamp']
                    })
                else:
                    print(f"Missing data for key {key}: {value}")

           return jsonify(data_net)
       except Exception as e:
           print(f"Error: {e}")
           return jsonify({"error": str(e)}), 500
   
   # Tidak perlu run app.py karena vercel yang akan mengurus servernya
   
   ```
   
2. **Membuat Template HTML:**

   Buat folder bernama `templates`, lalu didalam folder tersebut buat file `index.html`.

   ```html
   
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">

       <link rel="icon" type="img/png" href="../static/img/chart.png">
       <title>System Monitoring</title>
  
       <link rel="stylesheet" href="../static/style.css">
       <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
   </head>
   <body>

       <div class="nav">
           <ul>
               <li><a class="active" href="index.html">Realtime System Monitoring</a></li>
               <li><a href="{{url_for('about')}}">About</a></li>
           </ul>
       </div>

       <div class="chart-container">
           <h2>Monitor CPU, Memory, Swap, and Network usage in real-time</h2>
    
           <div class="cpu-charts">
               <div class="chart-item">
                   <h3>CPU Usage (%)</h3>
                   <canvas id="cpuChart" width="600" height="300"></canvas>
               </div>
               <div class="chart-item">
                   <h3>CPU Frequency (MHz)</h3>
                   <canvas id="cpuFreqChart" width="600" height="300"></canvas>
               </div>
           </div>
    
           <div class="memory-network-charts">
               <div class="chart-item">
                   <h3>Memory Usage (%)</h3>
                   <canvas id="memoryChart" width="600" height="300"></canvas>
               </div>
               <div class="chart-item">
                   <h3>Network Usage (Bytes Sent/Received)</h3>
                   <canvas id="networkChart" width="600" height="300"></canvas>
               </div>
           </div>
       </div>
    
       <script src="{{ url_for('static', filename='chart.js') }}"></script>
   </body>
   </html>
   
   ```

   Tambahkan file `about.html` pada folder `templates`.
   ```html

   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
       <link rel="icon" type="img/png" href="../static/img/chart.png">
       <title>About Real-Time System Monitoring</title>
  
       <link href="../static/style.css" rel="stylesheet">
   </head>
   <body>
   
       <div class="nav">
           <ul>
               <li><a href="{{url_for('index')}}">Realtime System Monitoring</a></li>
               <li><a class="active" href="about.html">About</a></li>
           </ul>
       </div>

       <div class="container">
           <header>
               <h1>About Real-Time System Monitoring</h1>
           </header>

           <section class="about-section">
               <h2>Overview</h2>
               <p>
                   Real-Time System Monitoring merupakan platform inovatif yang dirancang untuk 
                   memberikan wawasan kepada pengguna tentang kinerja dan pemanfaatan sumber daya 
                   sistem mereka. Dengan terus memantau penggunaan CPU, virtual memory, jaringan, dsb.
               </p>

               <h2>Key Features</h2>
               <ol>
                   <li>Real-time monitoring penggunaan CPU, memory, dan jaringan</li>
                   <li>Visualisasi tentang konsumsi sumber daya penggunaan sistem melalui grafik interaktif</li>
                   <li>Peringatan untuk aktivitas yang tidak biasa dan peningkatan sumber daya sistem secara tiba-tiba</li>
                   <li>Tampilan antarmuka yang ramah pengguna dan navigasi yang mudah</li>
                   <li>Dashboard yang dapat disesuaikan untuk preferensi pemantauan yang dipersonalisasi</li>
               </ol>

               <h2>Technologies Used</h2>
               <p>
                   Platform ini dibangun menggunakan teknologi web modern, termasuk:
               </p>
               <ol>
                   <li><strong>Flask:</strong> Kerangka kerja web ringan untuk membangun aplikasi web dalam Python</li>
                   <li><strong>Chart.js:</strong> Library JavaScript yang canggih untuk membuat visualisasi grafik interaktif</li>
                   <li><strong>HTML5 & CSS3:</strong> Bahasa HTML5 dan CSS3 untuk membuat tampilan antarmuka</li>
                   <li><strong>JavaScript:</strong> Untuk konten dinamis dan update real-time konsumsi sumber daya sistem</li>
               </ol>

               <h2>Explanation</h2>
               <p>
                   Modul psutil (Python System and Process Utilities) yang digunakan dalam platform ini dijelaskan sebagai berikut:
               </p>
               <ol>
                   <li>Modul <strong>psutil.cpu_percent()</strong>: Mendapatkan persentase penggunaan CPU oleh sistem dalam interval 1 detik.</li>
                   <li>Modul <strong>psutil.cpu_freq()</strong>: Mendapatkan informasi tentang frekuensi CPU terkini.</strong></li>
                   <li>Modul <strong>psutil.virtual_memory()</strong>: Memberikan informasi terkait penggunaan virtual memory pada sistem.</li>
                   <li>Modul <strong>psutil.net_io_counters()</strong>: Memberikan informasi tentang penggunaan jaringan termasuk bytes sent dan bytes received.</li>
               </ol>
           </section>
       </div>
      
   </body>
   </html>
   
   ```

3. **Menambahkan Style:**

   Buat folder baru bernama `static`, lalu didalam folder tersebut buat file bernama `style.css`.

   ```css

   @import url('https://fonts.googleapis.com/css2?family=Mochiy+Pop+One&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');

   * {
       margin: 0;
       padding: 0;
   }

   a {
       text-decoration: none;
   }
  
   body {
       background-color: #31363F;
   }

   .nav ul {
       display: flex;
       list-style: none;
       justify-content: center;
       font-family: Poppins, sans-serif;
       font-size: 25px;
       padding-top: 20px;
   }
  
   .nav a {
       text-decoration: none;
       transition: color 0.3s ease-in-out;
       margin-right: 15px;
   }

   .nav a.active {
       color: white;
   }
  
   .nav a:not(.active) {
       color: #767676;
   }
  
   .nav a:not(.active):hover {
       color: #d3d3d3;
   }

   .chart-container {
       display: flex;
       flex-direction: column;
       align-items: center;
       padding: 20px;
       color: white;
   }
  
   .chart-container h2 {
       font-family: 'Roboto', sans-serif;
       font-weight: 300;
       margin-bottom: 20px;
       margin-top: 20px;
   }

   .chart-container h3 {
       font-family: 'Roboto', sans-serif;
       font-weight: 300;
       padding-bottom: 5px;
   }
  
   .cpu-charts, .memory-network-charts {
       display: flex;
       justify-content: center;
       margin-bottom: 20px;
   }

   .chart-item {
       margin: 0 15px;
       text-align: center;
   }
  
   canvas {
       background-color: #222831;
       border-radius: 5px;
   }


   /* Styles for the About page */
   .container {
       width: 60%;
       margin: 20px auto;
       background: #222831;
       padding: 20px;
       border-radius: 8px;
       box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
       color: #b1b1b1;
   }

   header {
       font-family: 'Roboto', sans-serif;
       margin-bottom: 10px;
   }
  
   h1 {
       color: #d1d1d1;
       text-align: center;
   }

   .about-section h2 {
       font-family: 'Roboto', sans-serif;
       margin-top: 20px;
       border-bottom: 2px solid #5eacff;
       padding-bottom: 5px;
       color: #c0c0c0;
   }
  
   .about-section p {
       font-family: 'Roboto', sans-serif;
       margin: 15px 0;
   }

   .about-section ol {
       margin: 15px 0;
       padding-left: 20px;
   }
  
   .about-section ol li {
       font-family: 'Roboto', sans-serif;
       margin-bottom: 10px;
   }

   ```

   Tambahkan file baru bernama `chart.js` di dalam folder `static`

   ```javascript

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
   
   ```
