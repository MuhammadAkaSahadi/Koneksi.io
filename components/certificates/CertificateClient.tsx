"use client";

import React, { useState, useRef, useEffect } from "react";
import { Award, Download, Share2, Copy, Check, ShieldCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FaLinkedin } from "react-icons/fa";

interface CertificateClientProps {
  certificate: {
    id: string;
    certificate_code: string;
    issued_at: string;
    profile: {
      full_name: string | null;
      email: string | null;
    } | null;
    theme: {
      id: string;
      title: string;
      slug: string;
    } | null;
  };
}

export default function CertificateClient({ certificate }: CertificateClientProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [imageExists, setImageExists] = useState(true);
  const certificateRef = useRef<HTMLDivElement>(null);

  const fullName = certificate.profile?.full_name || "Nama Peserta";
  const themeTitle = certificate.theme?.title || "Materi Pembelajaran";
  const certificateCode = certificate.certificate_code;
  const issuedDate = new Date(certificate.issued_at);
  
  const formattedDate = issuedDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const verificationUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/certificates/${certificate.id}`
    : `https://koneksi.io/certificates/${certificate.id}`;

  // Check if certificate template image exists on the public folder
  useEffect(() => {
    const img = new Image();
    img.src = "/certificate-template.png";
    img.onload = () => setImageExists(true);
    img.onerror = () => setImageExists(false);
  }, []);

  // Construct LinkedIn Share URL
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verificationUrl)}`;

  // Construct LinkedIn Add Certification URL (Pre-fills forms on LinkedIn Profile)
  const lYear = issuedDate.getFullYear();
  const lMonth = issuedDate.getMonth() + 1;
  const linkedinAddCertUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
    themeTitle
  )}&organizationName=Koneksi.io&issueYear=${lYear}&issueMonth=${lMonth}&certId=${certificateCode}&certUrl=${encodeURIComponent(
    verificationUrl
  )}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    setIsDownloading(true);
    const canvas = document.createElement("canvas");
    canvas.width = 1920;
    canvas.height = 1358; // Standard A4 Aspect Ratio at High Res
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsDownloading(false);
      return;
    }

    const img = new Image();
    img.src = "/certificate-template.png";
    img.crossOrigin = "anonymous";

    const drawText = (cCtx: CanvasRenderingContext2D, cWidth: number, cHeight: number) => {
      // 1. Draw Module Name (Cyan brand color, centered in left white panel at Y = 36% height)
      cCtx.fillStyle = "#0891b2"; // cyan-600
      cCtx.textAlign = "center";
      cCtx.font = "bold 44px 'Plus Jakarta Sans', sans-serif";
      cCtx.fillText(themeTitle, cWidth * 0.34, cHeight * 0.36);

      // 2. Draw User Full Name (Dark Slate color, centered in left white panel at Y = 57% height)
      cCtx.fillStyle = "#1e293b"; // slate-800
      cCtx.font = "bold 60px 'Plus Jakarta Sans', sans-serif";
      cCtx.fillText(fullName, cWidth * 0.34, cHeight * 0.57);

      // 3. Draw Verification Code (White color, next to 'Kode Verifikasi :' on the top right)
      cCtx.textAlign = "left";
      cCtx.fillStyle = "#ffffff";
      cCtx.font = "bold 24px monospace";
      cCtx.fillText(certificateCode, cWidth * 0.81, 75); // Adjusted Y coordinate to match text baseline
    };

    const triggerDownload = (c: HTMLCanvasElement) => {
      const dataUrl = c.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `Sertifikat-Koneksiio-${themeTitle.replace(/\s+/g, "-")}.png`;
      link.href = dataUrl;
      link.click();
      setIsDownloading(false);
    };

    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      drawText(ctx, canvas.width, canvas.height);
      triggerDownload(canvas);
    };

    img.onerror = () => {
      // Draw Vector Fallback Certificate matching the screenshot layout programmatically
      // Left White Section (68% width)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width * 0.68, canvas.height);

      // Right Blue Sidebar (32% width)
      const gradient = ctx.createLinearGradient(canvas.width * 0.68, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "#1e60b8");
      gradient.addColorStop(1, "#124296");
      ctx.fillStyle = gradient;
      ctx.fillRect(canvas.width * 0.68, 0, canvas.width * 0.32, canvas.height);

      // Draw light grey inner border in white area
      ctx.strokeStyle = "#f1f5f9";
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, canvas.width * 0.68 - 40, canvas.height - 40);

      // Star Deco
      ctx.fillStyle = "#f59e0b"; // amber-500
      ctx.font = "bold 48px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("✦", canvas.width * 0.68 - 60, 80);

      // Header CERTIFICATE
      ctx.fillStyle = "#1e293b";
      ctx.textAlign = "center";
      ctx.font = "bold 68px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("CERTIFICATE", canvas.width * 0.34, 210);

      // Subtitle OF COMPLETION
      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 42px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("OF COMPLETION", canvas.width * 0.34, 275);

      // Thin divider
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.34 - 300, 315);
      ctx.lineTo(canvas.width * 0.34 + 300, 315);
      ctx.stroke();

      // Module Name
      ctx.fillStyle = "#0891b2";
      ctx.font = "bold 44px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText(themeTitle, canvas.width * 0.34, 488);

      // THIS CERTIFICATE IS PROUDLY PRESENTED TO
      ctx.fillStyle = "#475569";
      ctx.font = "bold 26px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("THIS CERTIFICATE IS PROUDLY PRESENTED TO", canvas.width * 0.34, 630);

      // Name
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 64px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText(fullName, canvas.width * 0.34, 774);

      // Thick divider under name
      ctx.strokeStyle = "#0891b2";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.34 - 400, 835);
      ctx.lineTo(canvas.width * 0.34 + 400, 835);
      ctx.stroke();

      // Paragraph citation
      ctx.fillStyle = "#64748b";
      ctx.font = "italic 22px 'Inter', sans-serif";
      ctx.fillText("his certificate is awarded in recognition of outstanding achievement in the field of", canvas.width * 0.34, 915);
      ctx.fillText("education and certifies the recipient's competence and dedication in their area of expertise.", canvas.width * 0.34, 955);

      // Seal bottom left
      ctx.beginPath();
      ctx.arc(160, 1150, 50, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(245, 158, 11, 0.12)";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#f59e0b";
      ctx.stroke();

      // Signature line bottom right
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.68 - 350, 1150);
      ctx.lineTo(canvas.width * 0.68 - 150, 1150);
      ctx.stroke();

      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 24px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("Muhammad Aka", canvas.width * 0.68 - 250, 1190);
      ctx.fillStyle = "#64748b";
      ctx.font = "20px 'Inter', sans-serif";
      ctx.fillText("CEO", canvas.width * 0.68 - 250, 1225);

      // Blue Sidebar content
      // Kode Verifikasi
      ctx.textAlign = "left";
      ctx.fillStyle = "#bfdbfe";
      ctx.font = "bold 24px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("Kode Verifikasi :", canvas.width * 0.70, 75);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px monospace";
      ctx.fillText(certificateCode, canvas.width * 0.83, 75);

      // Brand Centered
      ctx.textAlign = "center";
      ctx.font = "bold 44px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("Koneksi.io", canvas.width * 0.84, canvas.height / 2);
      ctx.font = "bold 28px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("Tech Engineering", canvas.width * 0.84, canvas.height / 2 + 55);

      triggerDownload(canvas);
    };
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-16 space-y-10 animate-in fade-in duration-300">
      
      {/* Top Breadcrumb / Nav */}
      <div className="flex items-center justify-between">
        <Link 
          href="/dashboard/certificates" 
          className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          KEMBALI KE DASHBOARD
        </Link>
        <span className="text-xs font-bold text-[#0891b2] bg-[#0891b2]/10 px-3 py-1 rounded-full flex items-center gap-1.5 border border-[#0891b2]/20">
          <ShieldCheck className="h-4 w-4 text-emerald-600 animate-pulse" />
          Koneksi.io Verified
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* LEFT COLUMN: Visual Certificate rendering (Landscape aspect-[1.414/1]) */}
        <div className="lg:col-span-8 space-y-4">
          <div 
            ref={certificateRef}
            className="w-full aspect-[1.414/1] relative overflow-hidden bg-white rounded-2xl shadow-2xl border-4 border-slate-900 select-none group"
            style={{
              backgroundImage: imageExists ? 'url("/certificate-template.png")' : 'none',
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Conditional layouts based on template image loading */}
            {!imageExists ? (
              // HTML Fallback split layout matching template design
              <div className="absolute inset-0 flex bg-white font-sans text-[#1e293b] z-0">
                {/* Left Area (68% width) */}
                <div className="w-[68%] h-full p-6 md:p-12 flex flex-col justify-between relative text-center">
                  <div className="absolute inset-4 border border-slate-200/80 rounded-xl pointer-events-none" />

                  {/* Top-right star ornament */}
                  <div className="absolute top-6 right-6 text-amber-500 text-2xl">✦</div>

                  {/* Title Header */}
                  <div className="space-y-1 mt-2 md:mt-4">
                    <h1 className="text-[2.6vw] font-black text-slate-800 tracking-wider font-heading leading-none">
                      CERTIFICATE
                    </h1>
                    <h2 className="text-[1.8vw] font-bold text-slate-700 tracking-widest font-heading">
                      OF COMPLETION
                    </h2>
                    <div className="w-[85%] h-0.5 bg-slate-200 mx-auto mt-2" />
                  </div>

                  {/* Module Name below "OF COMPLETION" */}
                  <div className="my-auto">
                    <span className="text-[0.8vw] text-slate-400 font-extrabold uppercase tracking-widest block">Kelas/Modul</span>
                    <h3 className="text-[1.8vw] md:text-[2.2vw] font-extrabold text-[#0891b2] font-heading tracking-wide leading-tight mt-1">
                      {themeTitle}
                    </h3>
                  </div>

                  {/* Present Text Section */}
                  <div className="space-y-0.5">
                    <p className="text-[0.8vw] text-slate-500 font-bold tracking-widest uppercase">
                      This certificate is proudly presented to
                    </p>
                    {/* User Full Name */}
                    <h2 className="text-[2.2vw] md:text-[2.8vw] font-black text-slate-800 font-heading tracking-wide leading-tight pt-1">
                      {fullName}
                    </h2>
                    <div className="w-[85%] h-0.5 bg-[#0891b2] mx-auto mt-2" />
                  </div>

                  {/* Static citation */}
                  <p className="text-[0.7vw] md:text-[0.8vw] text-slate-400 max-w-[80%] mx-auto leading-relaxed italic">
                    his certificate is awarded in recognition of outstanding achievement in the field of education and certifies the recipient's competence and dedication in their area of expertise.
                  </p>

                  {/* Footer seal/signature */}
                  <div className="flex justify-between items-center px-4 mt-2">
                    {/* Seal Emblem */}
                    <div className="flex items-center gap-1.5 text-left">
                      <div className="h-10 w-10 md:h-14 md:w-14 rounded-full bg-amber-50 border border-amber-300 flex items-center justify-center relative shadow-sm">
                        <Award className="h-5 w-5 md:h-8 md:w-8 text-amber-500" />
                      </div>
                      <div className="hidden sm:block text-[0.8vw]">
                        <span className="font-bold text-amber-600 block leading-tight">OFFICIAL SEAL</span>
                        <span className="text-slate-400">Koneksi.io</span>
                      </div>
                    </div>

                    {/* CEO Signature */}
                    <div className="text-center space-y-0.5">
                      <span className="font-cursive text-slate-500 text-[1.4vw] italic font-serif">Aka Sahadi</span>
                      <div className="w-24 h-px bg-slate-350" />
                      <span className="font-bold text-slate-800 block text-[0.8vw] mt-0.5">Muhammad Aka</span>
                      <span className="text-slate-450 text-[0.7vw] block uppercase font-medium">CEO, Koneksi.io</span>
                    </div>
                  </div>
                </div>

                {/* Right Area (32% Blue Sidebar) */}
                <div className="w-[32%] h-full bg-gradient-to-b from-[#1e60b8] to-[#124296] p-6 text-white flex flex-col justify-between relative text-left">
                  {/* Ornamental dot grids */}
                  <div className="absolute top-12 right-6 grid grid-cols-4 gap-1 opacity-25">
                    {[...Array(16)].map((_, i) => (
                      <div key={i} className="w-1 h-1 bg-white rounded-full" />
                    ))}
                  </div>

                  {/* Verification Code */}
                  <div className="space-y-1 mt-4">
                    <span className="text-[0.7vw] font-bold text-blue-200 uppercase tracking-widest block">
                      Kode Verifikasi
                    </span>
                    <p className="font-mono text-[0.9vw] font-bold bg-white/10 px-2.5 py-1 rounded border border-white/20 select-all w-fit">
                      {certificateCode}
                    </p>
                  </div>

                  {/* Brand Center */}
                  <div className="my-auto space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#124296]">
                        <Award className="h-5 w-5 fill-current" />
                      </div>
                      <span className="font-black text-[1.4vw] font-heading tracking-wide">
                        Koneksi.io
                      </span>
                    </div>
                    <p className="text-[0.9vw] text-blue-100 font-semibold tracking-wider font-heading leading-tight pl-0.5 uppercase">
                      Tech Engineering
                    </p>
                  </div>

                  {/* Verified badge */}
                  <div className="text-[0.7vw] text-blue-200/80 font-medium tracking-wide">
                    Verified Digital License
                  </div>
                </div>
              </div>
            ) : (
              // Active Template Overlay Mode (Only renders absolute labels on top of blank template)
              <>
                {/* Verification Code top-right in blue sidebar */}
                <div className="absolute right-[4%] top-[3.2%] font-mono font-bold text-white text-[0.8vw] md:text-[1.1vw] lg:text-[1.2vw] tracking-wider select-text pointer-events-auto">
                  {certificateCode}
                </div>

                {/* Module Name below "OF COMPLETION" centered in white left sidebar (X=34%, Y=36%) */}
                <div className="absolute left-[34%] top-[36%] -translate-x-1/2 -translate-y-1/2 text-center w-[55%] pointer-events-none select-none">
                  <h3 className="text-[1.5vw] md:text-[2vw] lg:text-[2.2vw] font-extrabold text-[#0891b2] font-heading tracking-wide leading-tight">
                    {themeTitle}
                  </h3>
                </div>

                {/* User Name centered in white left sidebar (X=34%, Y=57%) */}
                <div className="absolute left-[34%] top-[57%] -translate-x-1/2 -translate-y-1/2 text-center w-[55%] pointer-events-none select-none">
                  <h2 className="text-[2.2vw] md:text-[2.8vw] lg:text-[3.2vw] font-black text-slate-800 font-heading tracking-wide leading-tight">
                    {fullName}
                  </h2>
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Verification Information & Action Panel */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Status Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 font-heading">Sertifikat Valid</h4>
                <p className="text-[11px] text-slate-500 font-medium">Terverifikasi secara resmi oleh Koneksi.io</p>
              </div>
            </div>

            <div className="h-px bg-slate-100 w-full" />

            {/* Info Table */}
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Penerima</span>
                <span className="font-bold text-slate-800 text-right">{fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Nama Kelas</span>
                <span className="font-bold text-[#0891b2] text-right max-w-[200px]">{themeTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">ID Sertifikat</span>
                <span className="font-mono font-bold text-slate-800 bg-slate-50 px-1.5 py-0.5 border border-slate-100 rounded">{certificateCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Diterbitkan</span>
                <span className="font-medium text-slate-700">{formattedDate}</span>
              </div>
            </div>
          </div>

          {/* Action Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm text-left">
            <h4 className="font-bold text-slate-900 font-heading text-sm">Tindakan Sertifikat</h4>

            {/* Download Button */}
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full bg-[#0891b2] hover:bg-[#0891b2]/90 text-white font-extrabold text-xs h-11 rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2 border-0"
            >
              <Download className="h-4 w-4" />
              {isDownloading ? "Membuat Gambar..." : "Unduh Gambar Sertifikat (PNG)"}
            </Button>

            {/* LinkedIn Add Profile Button */}
            <a 
              href={linkedinAddCertUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full"
            >
              <Button
                variant="outline"
                className="w-full border-slate-200 hover:bg-slate-50/50 text-slate-700 font-extrabold text-xs h-11 rounded-xl cursor-pointer flex items-center justify-center gap-2"
              >
                <FaLinkedin className="h-4 w-4 text-[#0A66C2] fill-current" />
                Tambah ke LinkedIn Profile
              </Button>
            </a>

            {/* LinkedIn Share Post Button */}
            <a 
              href={linkedinShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full"
            >
              <Button
                variant="outline"
                className="w-full border-slate-200 hover:bg-slate-50/50 text-slate-700 font-extrabold text-xs h-11 rounded-xl cursor-pointer flex items-center justify-center gap-2"
              >
                <Share2 className="h-4 w-4 text-slate-500" />
                Bagikan ke Feed LinkedIn
              </Button>
            </a>

            <div className="h-px bg-slate-100 w-full my-2" />

            {/* Link Copy */}
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={verificationUrl}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-medium text-slate-500 select-all outline-none"
              />
              <Button
                onClick={handleCopyLink}
                className="shrink-0 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs h-10 w-10 p-0 rounded-xl cursor-pointer flex items-center justify-center"
              >
                {isCopied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-slate-500" />}
              </Button>
            </div>
            <p className="text-[10px] text-slate-400 font-medium text-center">
              Gunakan link di atas untuk membagikan halaman verifikasi ini ke CV atau portofolio Anda.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
