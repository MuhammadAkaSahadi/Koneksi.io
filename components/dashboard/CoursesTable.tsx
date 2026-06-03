"use client";

import React, { useState, useMemo } from "react";
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  ExternalLink,
  ChevronLeft, 
  ChevronRight,
  Loader2,
  X,
  BookOpen
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Theme {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  preview_video_url: string | null;
  price_lifetime: number;
  category: string;
  status: string;
  created_at: string;
}

interface CoursesTableProps {
  initialCourses: Theme[];
}

export function CoursesTable({ initialCourses }: CoursesTableProps) {
  const [courses, setCourses] = useState<Theme[]>(initialCourses);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Theme | null>(null);
  
  // Delete confirm state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formThumbnail, setFormThumbnail] = useState("");
  const [formPreviewVideo, setFormPreviewVideo] = useState("");
  const [formCategory, setFormCategory] = useState("Hardware (IoT)");
  const [formStatus, setFormStatus] = useState("Published");
  const [formPrice, setFormPrice] = useState("0");

  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const supabase = useMemo(() => createClient(), []);

  // Filter & Search
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch = 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        course.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === "all" || course.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || course.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [courses, searchQuery, categoryFilter, statusFilter]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / itemsPerPage));
  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCourses.slice(start, start + itemsPerPage);
  }, [filteredCourses, currentPage, itemsPerPage]);

  // Reset pagination on filter change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, statusFilter]);

  // Open modal for add
  const handleOpenAddModal = () => {
    setEditingCourse(null);
    setFormTitle("");
    setFormSlug("");
    setFormDescription("");
    setFormThumbnail("");
    setFormPreviewVideo("");
    setFormCategory("Hardware (IoT)");
    setFormStatus("Published");
    setFormPrice("0");
    setSelectedFile(null);
    setUploadProgress(0);
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEditModal = (course: Theme) => {
    setEditingCourse(course);
    setFormTitle(course.title);
    setFormSlug(course.slug);
    setFormDescription(course.description || "");
    setFormThumbnail(course.thumbnail_url || "");
    setFormPreviewVideo(course.preview_video_url || "");
    setFormCategory(course.category || "Hardware (IoT)");
    setFormStatus(course.status || "Published");
    setFormPrice(course.price_lifetime.toString());
    setSelectedFile(null);
    setUploadProgress(0);
    setIsModalOpen(true);
  };

  // Auto generate slug from title
  const handleTitleChange = (val: string) => {
    setFormTitle(val);
    if (!editingCourse) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setFormSlug(generatedSlug);
    }
  };

  // Handle Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error("Nama kurikulum wajib diisi");
      return;
    }
    if (!formSlug.trim()) {
      toast.error("Slug kurikulum wajib diisi");
      return;
    }

    setIsLoading(true);

    let thumbnailUrl = formThumbnail;

    // Upload image to Supabase storage if a new file is selected
    if (selectedFile) {
      try {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `course-thumbnails/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, selectedFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          toast.error(`Gagal mengunggah gambar: ${uploadError.message}`);
          setIsLoading(false);
          return;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);

        thumbnailUrl = publicUrl;
      } catch (error: any) {
        toast.error(`Gagal mengunggah gambar: ${error.message}`);
        setIsLoading(false);
        return;
      }
    }

    const priceNum = Number(formPrice);

    const payload = {
      title: formTitle,
      slug: formSlug,
      description: formDescription,
      thumbnail_url: thumbnailUrl || null,
      preview_video_url: formPreviewVideo || null,
      price_lifetime: priceNum,
      category: formCategory,
      status: formStatus,
    };

    if (editingCourse) {
      // Update
      const { data, error } = await supabase
        .from("themes")
        .update(payload)
        .eq("id", editingCourse.id)
        .select();

      if (error) {
        toast.error(`Gagal memperbarui kurikulum: ${error.message}`);
      } else {
        toast.success("Kurikulum berhasil diperbarui!");
        setCourses((prev) =>
          prev.map((c) => (c.id === editingCourse.id ? { ...c, ...payload } : c))
        );
        setIsModalOpen(false);
      }
    } else {
      // Insert
      const { data, error } = await supabase
        .from("themes")
        .insert([payload])
        .select();

      if (error) {
        toast.error(`Gagal menambahkan kurikulum: ${error.message}`);
      } else {
        toast.success("Kurikulum baru berhasil ditambahkan!");
        if (data && data[0]) {
          setCourses((prev) => [data[0], ...prev]);
        }
        setIsModalOpen(false);
      }
    }
    setIsLoading(false);
  };

  // Handle Delete
  const handleDelete = async (id: string) => {
    setIsLoading(true);
    const { error } = await supabase.from("themes").delete().eq("id", id);

    if (error) {
      toast.error(`Gagal menghapus kurikulum: ${error.message}`);
    } else {
      toast.success("Kurikulum berhasil dihapus");
      setCourses((prev) => prev.filter((c) => c.id !== id));
      setDeleteConfirmId(null);
    }
    setIsLoading(false);
  };

  const formatCurrency = (val: number) => {
    if (Number(val) === 0) return "Gratis";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Published":
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-250 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">Published</span>;
      case "Draft":
        return <span className="bg-amber-50 text-amber-700 border border-amber-250 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">Draft</span>;
      case "Archived":
        return <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">Archived</span>;
      default:
        return <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        
        {/* Search */}
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama atau ID kurikulum..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1164b8] focus:border-[#1164b8] text-slate-800"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1164b8] bg-white text-slate-700 min-w-[140px]"
          >
            <option value="all">Semua Kategori</option>
            <option value="Hardware (IoT)">Hardware (IoT)</option>
            <option value="IoT Cloud / Web">IoT Cloud / Web</option>
            <option value="Smart Home">Smart Home</option>
            <option value="IoT Programming">IoT Programming</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1164b8] bg-white text-slate-700 min-w-[120px]"
          >
            <option value="all">Semua Status</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>

          {/* Add Button */}
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1164b8] hover:bg-[#1164b8]/95 text-white font-extrabold text-sm rounded-lg shadow-sm font-heading transition-colors ml-auto sm:ml-0"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            Kurikulum Baru
          </button>
        </div>

      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider font-heading">
                <th className="py-4 px-6">ID Kurikulum</th>
                <th className="py-4 px-6">Nama Kurikulum</th>
                <th className="py-4 px-6">Kategori</th>
                <th className="py-4 px-6">Harga</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
              {paginatedCourses.length > 0 ? (
                paginatedCourses.map((course) => (
                  <tr 
                    key={course.id} 
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    {/* ID */}
                    <td className="py-4 px-6 font-mono text-xs font-bold text-slate-500">
                      {course.id.substring(0, 8)}...
                    </td>

                    {/* Judul & Slug */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{course.title}</span>
                        <span className="text-xs text-slate-400 font-medium">/{course.slug}</span>
                      </div>
                    </td>

                    {/* Kategori */}
                    <td className="py-4 px-6 font-medium text-slate-650">
                      {course.category}
                    </td>

                    {/* Harga */}
                    <td className="py-4 px-6 font-extrabold text-slate-900 font-heading">
                      {formatCurrency(Number(course.price_lifetime))}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6 text-center">
                      {getStatusBadge(course.status)}
                    </td>

                    {/* Aksi */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Detail link */}
                        <a
                          href={`/katalog/${course.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
                          title="Lihat Detail"
                        >
                          <ExternalLink className="h-4.5 w-4.5" />
                        </a>

                        {/* Tambah Modul */}
                        <a
                          href={`/admin/courses/${course.id}/curriculum`}
                          className="p-1.5 hover:bg-emerald-50 rounded-lg text-slate-500 hover:text-emerald-600 transition-colors"
                          title="Tambah Modul"
                        >
                          <BookOpen className="h-4.5 w-4.5" />
                        </a>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEditModal(course)}
                          className="p-1.5 hover:bg-indigo-50 rounded-lg text-slate-500 hover:text-[#1164b8] transition-colors"
                          title="Edit Kurikulum"
                        >
                          <Edit2 className="h-4.5 w-4.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeleteConfirmId(course.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-slate-500 hover:text-red-600 transition-colors"
                          title="Hapus Kurikulum"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <BookOpen className="h-10 w-10 text-slate-300 stroke-[1.5]" />
                      <span className="font-bold text-slate-500 font-heading">Belum Ada Data Kurikulum</span>
                      <span className="text-xs max-w-xs text-slate-400">Kurikulum tidak ditemukan. Coba ganti kata pencarian atau buat kurikulum baru.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredCourses.length > 0 && (
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-500">
              Menampilkan <span className="font-bold text-slate-800">{Math.min(filteredCourses.length, (currentPage - 1) * itemsPerPage + 1)}</span> - <span className="font-bold text-slate-800">{Math.min(filteredCourses.length, currentPage * itemsPerPage)}</span> dari <span className="font-bold text-slate-800">{filteredCourses.length}</span> kurikulum
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-2 border border-slate-250 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-650 cursor-pointer disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-bold text-slate-700 px-3">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-2 border border-slate-250 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-650 cursor-pointer disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FORM MODAL (ADD / EDIT) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
             <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg font-heading">
                {editingCourse ? "Edit Detail Kurikulum" : "Tambah Kurikulum Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4 text-left">
              {/* Nama Kurikulum */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nama Kurikulum</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: IoT Fundamentals dengan ESP32"
                  value={formTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-250 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1164b8] focus:border-[#1164b8]"
                />
              </div>

              {/* Slug */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Slug Kurikulum (URL)</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: iot-fundamentals-esp32"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-250 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1164b8] focus:border-[#1164b8] font-mono text-xs"
                />
              </div>

              {/* Deskripsi */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Deskripsi Kurikulum</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tulis penjelasan mendalam mengenai apa saja yang akan dipelajari di kelas ini..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-250 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1164b8] focus:border-[#1164b8] resize-none"
                />
              </div>

              {/* Grid 2 Column */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Kategori */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Kategori</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-250 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1164b8] bg-white text-slate-700"
                  >
                    <option value="Hardware (IoT)">Hardware (IoT)</option>
                    <option value="IoT Cloud / Web">IoT Cloud / Web</option>
                    <option value="Smart Home">Smart Home</option>
                    <option value="IoT Programming">IoT Programming</option>
                  </select>
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Status Publikasi</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-250 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1164b8] bg-white text-slate-700"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Thumbnail Upload */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Cover Thumbnail</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFile(file);
                      // Preview the selected file
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormThumbnail(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 border border-slate-250 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1164b8] focus:border-[#1164b8]"
                />
                {formThumbnail && (
                  <div className="mt-2 relative aspect-video w-48 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                    <img src={formThumbnail} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as any).style.display = 'none'; }} />
                  </div>
                )}
              </div>

              {/* Pricing */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Harga Lifetime (Rp)</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">Rp</div>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="Contoh: 199000"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-250 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1164b8] font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-250 hover:bg-slate-50 text-slate-650 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#1164b8] hover:bg-[#1164b8]/95 disabled:opacity-50 text-white font-extrabold text-xs rounded-lg shadow-sm font-heading cursor-pointer transition-colors"
                >
                  {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Simpan Kurikulum
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM DIALOG */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-sm w-full text-center shadow-2xl space-y-4">
            <h4 className="text-base font-extrabold text-slate-800 font-heading">Hapus Kurikulum Ini?</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Apakah Anda yakin ingin menghapus kurikulum ini secara permanen dari database? Tindakan ini tidak dapat dibatalkan dan semua modul di dalamnya juga akan terhapus.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-slate-250 hover:bg-slate-50 text-slate-650 font-bold text-xs rounded-lg cursor-pointer transition-all"
              >
                Batal
              </button>
              <button
                disabled={isLoading}
                onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-lg cursor-pointer transition-all"
              >
                {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
