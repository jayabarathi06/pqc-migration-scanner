import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  AlertCircle,
  FileCheck,
  Play,
  Loader2,
  ShieldCheck,
  FileCode
} from 'lucide-react';
import { uploadAndScanZip, scanBundledSample } from '../services/api';
import type { ScanResult } from '../types/scan';

interface Props {
  onScanComplete: (result: ScanResult) => void;
}

const MAX_SIZE_BYTES = 3 * 1024 * 1024; // 3 MB

export const UploadPage: React.FC<Props> = ({ onScanComplete }) => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanningMessage, setScanningMessage] = useState('Initializing scan...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    setErrorMessage(null);

    if (fileRejections.length > 0) {
      const err = fileRejections[0].errors[0];
      if (err.code === 'file-too-large') {
        setErrorMessage('File size exceeds the 3 MB upload limit.');
      } else if (err.code === 'file-invalid-type') {
        setErrorMessage('Invalid file format. Please upload a standard .zip archive.');
      } else {
        setErrorMessage(err.message || 'File upload rejected.');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (!file.name.toLowerCase().endsWith('.zip')) {
        setErrorMessage('Only .zip archives are supported.');
        return;
      }
      setSelectedFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip'],
    },
    maxFiles: 1,
    maxSize: MAX_SIZE_BYTES,
  });

  const handleStartScan = async () => {
    if (!selectedFile) return;

    setIsScanning(true);
    setErrorMessage(null);
    setScanningMessage('Decompressing and validating ZIP integrity...');

    const msgTimer1 = setTimeout(() => {
      setScanningMessage('Analyzing Python AST trees and regex heuristics...');
    }, 800);

    const msgTimer2 = setTimeout(() => {
      setScanningMessage('Evaluating against NIST FIPS 203/204/205 standards...');
    }, 1600);

    try {
      const result = await uploadAndScanZip(selectedFile);
      clearTimeout(msgTimer1);
      clearTimeout(msgTimer2);
      onScanComplete(result);
      navigate('/results');
    } catch (err: any) {
      clearTimeout(msgTimer1);
      clearTimeout(msgTimer2);
      setErrorMessage(
        err.response?.data?.detail || err.message || 'Failed to scan uploaded archive.'
      );
    } finally {
      setIsScanning(false);
    }
  };

  const handleScanSample = async () => {
    setIsScanning(true);
    setErrorMessage(null);
    setScanningMessage('Loading and analyzing bundled vulnerable sample codebase...');

    try {
      const result = await scanBundledSample();
      onScanComplete(result);
      navigate('/results');
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.detail || err.message || 'Failed to scan sample project.'
      );
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-10">
      {/* Page Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Upload Source Code Archive
        </h1>
        <p className="text-sm text-slate-400">
          Upload a ZIP archive (up to 3 MB) containing your repository source files.
          Our backend inspects cryptographic symbols safely in an isolated sandbox.
        </p>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="block font-semibold">Upload Error</strong>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Dropzone Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-4 ${
            isDragActive
              ? 'border-cyan-400 bg-cyan-950/20'
              : selectedFile
              ? 'border-emerald-500/50 bg-emerald-950/10'
              : 'border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800/40'
          }`}
        >
          <input {...getInputProps()} />

          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-cyan-400">
            {selectedFile ? (
              <FileCheck className="w-8 h-8 text-emerald-400" />
            ) : (
              <Upload className="w-8 h-8" />
            )}
          </div>

          <div>
            <p className="text-base font-semibold text-white">
              {selectedFile ? selectedFile.name : 'Drag and drop your project ZIP here'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {selectedFile
                ? `${(selectedFile.size / 1024).toFixed(1)} KB — Ready to scan`
                : 'Or click to browse your computer (Max size: 3 MB)'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] text-slate-500">
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">.ZIP Only</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">Max 3 MB</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">Zip-Bomb Protected</span>
          </div>
        </div>

        {/* Scan Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Files are extracted into ephemeral memory and cleaned up immediately.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleStartScan}
              disabled={!selectedFile || isScanning}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-md shadow-cyan-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-sm"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <FileCode className="w-4 h-4" />
                  Scan Project
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Alternative: Scan Bundled Sample App */}
      <div className="rounded-2xl border border-cyan-900/40 bg-gradient-to-r from-cyan-950/30 via-slate-900 to-purple-950/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
            Want to test without uploading a file?
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Scan our bundled vulnerable sample application. It runs through real detection against
            RSA keypair generation, ECDH exchange, ECDSA signatures, AES-128, 3DES, MD5, and PEM keys.
          </p>
        </div>

        <button
          onClick={handleScanSample}
          disabled={isScanning}
          className="shrink-0 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-700/50 shadow transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-cyan-300" />}
          Scan Sample Project
        </button>
      </div>

      {/* Loading Modal / Overlay */}
      {isScanning && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center mx-auto text-cyan-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <h3 className="text-lg font-bold text-white">Scanning Codebase</h3>
            <p className="text-xs text-cyan-300 font-mono animate-pulse">{scanningMessage}</p>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full w-2/3 animate-indeterminate" />
            </div>
            <p className="text-[11px] text-slate-500">
              Inspecting imports, cryptographic primitives, and configuration files...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
