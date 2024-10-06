from flask import Flask, render_template, jsonify
import firebase_admin
from firebase_admin import credentials, db
import os

app = Flask(__name__)

# Inisialisasi Firebase Admin SDK
cred = credentials.Certificate("serviceAccount_privateKey.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://pervasive-simple-web-default-rtdb.asia-southeast1.firebasedatabase.app/'
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