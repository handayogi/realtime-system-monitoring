import firebase_admin
from firebase_admin import credentials, db
import psutil
import time

# Inisialisasi Firebase Admin SDK
cred = credentials.Certificate("path/to/your-serviceAccountKey.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://your-project-id.firebaseio.com/'
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
