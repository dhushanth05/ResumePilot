"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eye, Trash2, UploadCloud, FileText, Calendar, TrendingUp, BarChart3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  deleteResume,
  getResumes,
  uploadResumeFile,
  viewResumeFile,
} from "@/services/resumes";
import type { ResumeListItem } from "@/types/resume";

export function ResumeUploadSection() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadResumes = useCallback(async () => {
    try {
      const data = await getResumes();
      setResumes(data);
    } catch {
      // ignore for now
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 200);
    void loadResumes();
    return () => clearTimeout(timer);
  }, [loadResumes]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    if (selected && !title) {
      setTitle(selected.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const dropped = event.dataTransfer.files?.[0] ?? null;
    if (dropped) {
      setFile(dropped);
      if (!title) {
        setTitle(dropped.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Select a PDF resume to upload.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      await uploadResumeFile(file, title || file.name);
      setFile(null);
      setTitle("");
      await loadResumes();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleView = async (resumeId: string) => {
    const popup = window.open("", "_blank", "noopener,noreferrer");
    if (!popup) {
      setError("Allow popups to view the PDF, or try again.");
      return;
    }
    setViewingId(resumeId);
    setError(null);
    try {
      await viewResumeFile(resumeId, popup);
    } catch (err) {
      popup.close();
      setError((err as Error).message);
    } finally {
      setViewingId(null);
    }
  };

  const handleDelete = async (resumeId: string) => {
    if (!confirm("Delete this resume? This cannot be undone.")) return;
    setDeletingId(resumeId);
    setError(null);
    try {
      await deleteResume(resumeId);
      await loadResumes();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDeletingId(null);
    }
  };

  // Calculate stats
  const totalResumes = resumes.length;
  const lastUploaded = resumes.length > 0 
    ? new Date(Math.max(...resumes.map(r => new Date(r.created_at).getTime()))).toLocaleDateString()
    : "Never";
  const avgAtsScore = 75; // Mock value - would come from actual analysis data
  const totalAnalyses = resumes.length * 2; // Mock value - would come from actual analysis data

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <motion.section
        className="rounded-2xl border-2 border-dashed border-slate-700/60 bg-gradient-to-br from-slate-900/60 to-slate-950/80 p-8 text-center transition-all duration-300 hover:border-cyan-400/60 hover:shadow-lg hover:-translate-y-1"
        initial={{ opacity: 0, translateY: 16 }}
        animate={{ opacity: isLoaded ? 1 : 0, translateY: isLoaded ? 0 : 16 }}
        transition={{ duration: 0.6 }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => {
          document.getElementById("resume-file-input")?.click();
        }}
      >
        <motion.div
          className="flex flex-col items-center justify-center space-y-4"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <UploadCloud className="h-12 w-12 text-cyan-400" />
          <div>
            <h3 className="text-lg font-semibold text-slate-100">
              Upload your resume
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Drag & drop a PDF file here, or click to browse
            </p>
          </div>
          {file && (
            <div className="rounded-lg bg-slate-800/60 px-4 py-2">
              <p className="text-sm text-slate-200">Selected: {file.name}</p>
            </div>
          )}
        </motion.div>
        <input
          id="resume-file-input"
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
      </motion.section>

      {/* Title Input and Upload Button */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, translateY: 16 }}
        animate={{ opacity: isLoaded ? 1 : 0, translateY: isLoaded ? 0 : 16 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">
            Resume title
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Senior Backend Engineer Resume"
            className="bg-slate-900/40 border-slate-700/60"
          />
        </div>
        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
        <Button 
          onClick={handleUpload} 
          disabled={uploading || !file}
          className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 transition-all duration-200"
        >
          {uploading ? "Uploading..." : "Upload Resume"}
        </Button>
      </motion.div>

      {/* Stats Row */}
      {resumes.length > 0 && (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: isLoaded ? 1 : 0, translateY: isLoaded ? 0 : 16 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="rounded-xl bg-slate-900/40 px-4 py-4 transition-all hover:bg-slate-900/60">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-cyan-400" />
              <div>
                <p className="text-xs text-slate-400">Total Resumes</p>
                <p className="text-lg font-semibold text-slate-100">{totalResumes}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-slate-900/40 px-4 py-4 transition-all hover:bg-slate-900/60">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-cyan-400" />
              <div>
                <p className="text-xs text-slate-400">Last Uploaded</p>
                <p className="text-lg font-semibold text-slate-100">{lastUploaded}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-slate-900/40 px-4 py-4 transition-all hover:bg-slate-900/60">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-cyan-400" />
              <div>
                <p className="text-xs text-slate-400">Avg ATS Score</p>
                <p className="text-lg font-semibold text-slate-100">{avgAtsScore}%</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-slate-900/40 px-4 py-4 transition-all hover:bg-slate-900/60">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-cyan-400" />
              <div>
                <p className="text-xs text-slate-400">Total Analyses</p>
                <p className="text-lg font-semibold text-slate-100">{totalAnalyses}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Resume Cards Grid */}
      <motion.div
        initial={{ opacity: 0, translateY: 16 }}
        animate={{ opacity: isLoaded ? 1 : 0, translateY: isLoaded ? 0 : 16 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {resumes.length === 0 ? (
          <div className="text-center py-12">
            <UploadCloud className="mx-auto h-16 w-16 text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-100 mb-2">
              No resumes uploaded yet
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              Upload your first resume to start analysis.
            </p>
            <Button 
              onClick={() => document.getElementById("resume-file-input")?.click()}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              Upload First Resume
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {resumes.map((resume, index) => (
              <motion.div
                key={resume.id}
                className="group rounded-2xl bg-gradient-to-br from-slate-900/60 to-slate-950/80 p-6 border border-slate-800/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-cyan-400/30"
                initial={{ opacity: 0, translateY: 16 }}
                animate={{ opacity: isLoaded ? 1 : 0, translateY: isLoaded ? 0 : 16 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              >
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-100 mb-2 truncate">
                      {resume.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(resume.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="mb-4">
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200 ring-1 ring-emerald-500/20">
                        Ready
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-4 border-t border-slate-800/40">
                    <button
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800/60 text-slate-400 transition-all hover:bg-slate-700 hover:text-cyan-400"
                      onClick={() => handleView(resume.id)}
                      disabled={viewingId === resume.id}
                      title="View PDF"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800/60 text-slate-400 transition-all hover:bg-slate-700 hover:text-red-400"
                      onClick={() => handleDelete(resume.id)}
                      disabled={deletingId === resume.id}
                      title="Delete resume"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

