/**
 * Mendeteksi URL dasar aplikasi secara dinamis berdasarkan environment.
 *
 * Urutan prioritas:
 * 1. NEXT_PUBLIC_SITE_URL — production (mis. https://koneksi-io.vercel.app)
 * 2. NEXT_PUBLIC_VERCEL_URL — preview deployment Vercel (otomatis di-set oleh Vercel)
 * 3. Fallback ke http://localhost:3000/ untuk development lokal
 *
 * Fungsi ini aman dipanggil di server maupun client karena hanya
 * menggunakan variabel NEXT_PUBLIC_*.
 */
export function getURL(): string {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    "http://localhost:3000/";

  // Pastikan skema https:// ada (NEXT_PUBLIC_VERCEL_URL tidak menyertakannya)
  url = url.startsWith("http") ? url : `https://${url}`;

  // Pastikan selalu diakhiri trailing slash
  url = url.endsWith("/") ? url : `${url}/`;

  return url;
}
