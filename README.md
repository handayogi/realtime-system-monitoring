# Simple Real-Time Database

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

### Langkah 1: Membuat Firebase Project
1. Buat Firebase Project:
   - Pergi ke [Firebase Console](https://console.firebase.google.com), kemudian buat project baru.
   - Setelah project dibuat, buka bagian **Product categories > Build > Realtime Database** dan klik **Create Database**.
3. Setting Firebase Realtime Database:
   - Setting database dalam mode **Test Mode** agar bisa **read and write** tanpa melakukan autentikasi selama pengembangan.
5. Download Firebase Admin SDK:
   - Buka **Project Settings** (logo gear disebelah *Project Overview*) di Firebase Console, kemudian masuk ke tab **Service Account**.
   - Klik **Generate New Private Key** untuk mendapatkan file **JSON** yang akan digunakan di project kita nanti.

### Langkah 2: Conda Virtual Environment
1. Buka VSCode melalui **Anaconda/Miniconda** yang sudah diinstall.
2. Buat environment baru dengan perintah berikut pada terminal:
   
   ```bash
   conda create -n {nama_env} python=3.10
   ```
   
4. 
