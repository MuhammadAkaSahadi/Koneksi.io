import Link from "next/link";
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="bg-slate-900 py-16 text-slate-300">
      <div className="container mx-auto px-4 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          <div className="flex flex-col gap-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="font-heading font-bold text-lg">K.</span>
              </div>
              <span className="font-heading font-bold text-xl text-white">Koneksi.io</span>
            </Link>
            <p className="text-sm mt-2">
              Jembatan talenta digital Indonesia ke industri teknologi melalui jalur belajar IoT & Software terstruktur.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-white mb-2">Produk</h4>
            <Link href="/katalog" className="text-sm hover:text-white transition-colors">Katalog Kursus</Link>
            <Link href="/katalog?category=software" className="text-sm hover:text-white transition-colors">Jalur Software</Link>
            <Link href="/katalog?category=hardware" className="text-sm hover:text-white transition-colors">Jalur Hardware (IoT)</Link>
            <Link href="/pricing" className="text-sm hover:text-white transition-colors">Harga</Link>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-white mb-2">Perusahaan</h4>
            <Link href="/tentang" className="text-sm hover:text-white transition-colors">Tentang Kami</Link>
            <Link href="/faq" className="text-sm hover:text-white transition-colors">FAQ</Link>
            <Link href="/hubungi" className="text-sm hover:text-white transition-colors">Hubungi Kami</Link>
            <Link href="/syarat" className="text-sm hover:text-white transition-colors">Syarat Layanan</Link>
            <Link href="/privasi" className="text-sm hover:text-white transition-colors">Kebijakan Privasi</Link>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-white mb-2">Terhubung</h4>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-white transition-colors" aria-label="Twitter">
                <FaTwitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors" aria-label="LinkedIn">
                <FaLinkedin className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors" aria-label="GitHub">
                <FaGithub className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Koneksi.io. Hak Cipta Dilindungi.
          </p>
          <div className="text-sm text-slate-500">
            Dibuat di Indonesia 🇮🇩
          </div>
        </div>
      </div>
    </footer>
  );
}
