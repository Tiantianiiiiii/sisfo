import 'package:flutter/material.dart';

// --- 1. LOGIKA STATUS ABSENSI ---
enum AbsenStatus {
  belumWaktunyaMasuk,
  waktunyaMasuk,
  belumWaktunyaPulang,
  waktunyaPulang,
  hariLibur,
}

class AttendanceLogic {
  static AbsenStatus getStatus() {
    DateTime now = DateTime.now();
    int hour = now.hour;
    int weekday = now.weekday;

    // Cek Hari Libur (Sabtu = 6, Minggu = 7)
    if (weekday == DateTime.saturday || weekday == DateTime.sunday) {
      return AbsenStatus.hariLibur;
    }

    // Penentuan Status Berdasarkan Jam
    if (hour < 7) {
      return AbsenStatus.belumWaktunyaMasuk;
    } else if (hour >= 7 && hour < 9) {
      return AbsenStatus.waktunyaMasuk;
    } else if (hour >= 9 && hour < 16) {
      return AbsenStatus.belumWaktunyaPulang;
    } else if (hour >= 16 && hour < 20) {
      return AbsenStatus.waktunyaPulang;
    } else {
      return AbsenStatus.belumWaktunyaMasuk;
    }
  }
}

// --- 2. TAMPILAN HALAMAN (UI) ---
class AbsensiPage extends StatelessWidget {
  const AbsensiPage({super.key});

  @override
  Widget build(BuildContext context) {
    // Ambil status waktu saat ini
    final status = AttendanceLogic.getStatus();

    // Inisialisasi properti berdasarkan status
    String judulTombol;
    Color warnaTema;
    IconData ikonTombol;
    String deskripsiStatus;

    switch (status) {
      case AbsenStatus.waktunyaMasuk:
        judulTombol = "Absen Masuk";
        warnaTema = Colors.green;
        ikonTombol = Icons.login;
        deskripsiStatus = "Waktunya absen masuk";
        break;
      case AbsenStatus.waktunyaPulang:
        judulTombol = "Absen Pulang";
        warnaTema = Colors.orange;
        ikonTombol = Icons.logout;
        deskripsiStatus = "Waktunya absen pulang";
        break;
      case AbsenStatus.belumWaktunyaMasuk:
        judulTombol = "Belum Waktunya";
        warnaTema = Colors.grey;
        ikonTombol = Icons.timer_outlined;
        deskripsiStatus = "Absen dibuka jam 07:00 WIB";
        break;
      case AbsenStatus.belumWaktunyaPulang:
        judulTombol = "Belum Pulang";
        warnaTema = Colors.blueGrey;
        ikonTombol = Icons.lock_clock;
        deskripsiStatus = "Pulang mulai jam 16:00 WIB";
        break;
      case AbsenStatus.hariLibur:
        judulTombol = "Hari Libur";
        warnaTema = Colors.redAccent;
        ikonTombol = Icons.event_busy;
        deskripsiStatus = "Selamat berakhir pekan!";
        break;
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF9FBF9),
      body: SafeArea(
        child: Column(
          children: [
            // HEADER PROFIL (Seperti di Screenshot)
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: Row(
                children: [
                  const CircleAvatar(
                    radius: 25,
                    backgroundColor: Colors.green,
                    child: Text(
                      "PK",
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(width: 15),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        "VIANI SRI MALIK",
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                      Row(
                        children: const [
                          Icon(Icons.school, size: 14, color: Colors.grey),
                          SizedBox(width: 5),
                          Text(
                            "SMKN 9 GARUT",
                            style: TextStyle(color: Colors.grey, fontSize: 13),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const Spacer(),
                  const Icon(
                    Icons.notifications_none_outlined,
                    color: Colors.grey,
                  ),
                ],
              ),
            ),

            const Spacer(),

            // TOMBOL DINAMIS LINGKARAN
            Center(
              child: Column(
                children: [
                  Container(
                    width: 230,
                    height: 230,
                    decoration: BoxDecoration(
                      color: warnaTema.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: InkWell(
                        onTap: () {
                          // Logika klik tombol (Misal simpan ke Supabase)
                          if (status == AbsenStatus.waktunyaMasuk ||
                              status == AbsenStatus.waktunyaPulang) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text("Berhasil $judulTombol!")),
                            );
                          }
                        },
                        borderRadius: BorderRadius.circular(100),
                        child: Container(
                          width: 180,
                          height: 180,
                          decoration: BoxDecoration(
                            color: warnaTema,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: warnaTema.withOpacity(0.3),
                                blurRadius: 25,
                                spreadRadius: 5,
                              ),
                            ],
                          ),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(ikonTombol, color: Colors.white, size: 55),
                              const SizedBox(height: 12),
                              Text(
                                judulTombol,
                                textAlign: TextAlign.center,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 18,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 25),
                  Text(
                    deskripsiStatus,
                    style: TextStyle(
                      color: Colors.grey[600],
                      fontSize: 15,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ],
              ),
            ),

            const Spacer(),

            // INFO CARD DI BAWAH
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 30),
              child: Row(
                children: [
                  _infoCard(
                    Icons.info_outline,
                    "Status",
                    judulTombol,
                    Colors.orange,
                  ),
                  const SizedBox(width: 15),
                  _infoCard(Icons.timer, "Durasi", "0 Jam", Colors.blue),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Widget Helper untuk Kartu Info
  Widget _infoCard(IconData icon, String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(height: 10),
            Text(
              value,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            Text(
              label,
              style: const TextStyle(color: Colors.grey, fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }
}
