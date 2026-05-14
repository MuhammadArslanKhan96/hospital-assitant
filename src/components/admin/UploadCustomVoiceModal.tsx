'use client';

import { useState, useEffect } from 'react';
import { Upload, X, Loader2, Music, CheckCircle2, AlertCircle, Sparkles, Settings2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UploadCustomVoiceModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    value: '',
    costPerUnit: '0',
    isStaffTwin: false,
    engineType: 'piper' as 'piper' | 'kokoro'
  });

  const [files, setFiles] = useState<{
    modelFile: File | null;
    configFile: File | null;
  }>({
    modelFile: null,
    configFile: null,
  });

  // Handle Voice ID formatting for Kokoro
  const getDisplayVoiceId = () => {
    if (formData.engineType === 'kokoro' && formData.value && !formData.value.startsWith('k-')) {
      return `k-${formData.value}`;
    }
    return formData.value;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'modelFile' | 'configFile') => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [type]: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const actualVoiceId = getDisplayVoiceId();

    const data = new FormData();
    data.append('name', formData.name);
    data.append('value', actualVoiceId);
    data.append('costPerUnit', formData.costPerUnit);
    data.append('isStaffTwin', formData.isStaffTwin ? 'true' : 'false');
    data.append('engineType', formData.engineType);

    if (files.modelFile) data.append('modelFile', files.modelFile);
    if (formData.engineType === 'piper' && files.configFile) {
      data.append('configFile', files.configFile);
    }

    try {
      const res = await fetch('/api/admin/catalog/upload-voice', {
        method: 'POST',
        body: data,
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          setSuccess(false);
          setFormData({ name: '', value: '', costPerUnit: '0', isStaffTwin: false, engineType: 'piper' });
          setFiles({ modelFile: null, configFile: null });
          router.refresh();
        }, 2000);
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to upload voice model');
      }
    } catch (err) {
      setError('An unexpected error occurred during upload');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn-primary flex items-center space-x-2"
      >
        <Upload className="w-4 h-4" />
        <span>Upload Custom Voice</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <Music className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900">Upload Custom Voice</h3>
          </div>
          <button
            onClick={() => !loading && setIsOpen(false)}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Engine Type</label>
                <div className="relative">
                  <select
                    name="engineType"
                    value={formData.engineType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none appearance-none"
                  >
                    <option value="piper">Piper Engine</option>
                    <option value="kokoro">Kokoro Engine</option>
                  </select>
                  <Settings2 className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Cost Per Minute</label>
                <input
                  required
                  type="number"
                  step="0.001"
                  name="costPerUnit"
                  value={formData.costPerUnit}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Voice Name</label>
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Sarah Local"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Voice ID {formData.engineType === 'kokoro' && <span className="text-indigo-600 normal-case">(will be prefixed with k-)</span>}
              </label>
              <div className="relative flex items-center">
                {formData.engineType === 'kokoro' && (
                   <span className="absolute left-4 text-slate-400 text-sm font-medium">k-</span>
                )}
                <input
                  required
                  name="value"
                  value={formData.value}
                  onChange={handleInputChange}
                  placeholder="e.g. sarah-v1"
                  className={`w-full ${formData.engineType === 'kokoro' ? 'pl-8' : 'pl-4'} pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none`}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl">
              <div>
                <label className="block text-sm font-bold text-indigo-900 italic flex items-center">
                  <Sparkles className="w-4 h-4 mr-1.5 text-indigo-600" />
                  Staff Voice Twin
                </label>
                <p className="text-[10px] font-medium text-indigo-600 mt-0.5 uppercase tracking-tight">Tag as personalized staff clone</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isStaffTwin"
                  checked={formData.isStaffTwin}
                  onChange={handleInputChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                {formData.engineType === 'piper' ? 'Model File (.onnx)' : 'Voice Weights (.pt)'}
              </label>
              <div className="relative">
                <input
                  required
                  type="file"
                  accept={formData.engineType === 'piper' ? '.onnx' : '.pt'}
                  onChange={(e) => handleFileChange(e, 'modelFile')}
                  className="hidden"
                  id="model-upload"
                />
                <label
                  htmlFor="model-upload"
                  className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-white border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/30 transition-all"
                >
                  <Upload className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-600">
                    {files.modelFile ? files.modelFile.name : `Select ${formData.engineType === 'piper' ? '.onnx' : '.pt'} file`}
                  </span>
                </label>
              </div>
            </div>

            {formData.engineType === 'piper' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Config File (.json)</label>
                <div className="relative">
                  <input
                    required
                    type="file"
                    accept=".json"
                    onChange={(e) => handleFileChange(e, 'configFile')}
                    className="hidden"
                    id="config-upload"
                  />
                  <label
                    htmlFor="config-upload"
                    className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-white border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/30 transition-all"
                  >
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-600">
                      {files.configFile ? files.configFile.name : 'Select .json file'}
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs font-medium text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-100 rounded-xl flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <p className="text-xs font-medium text-green-700">Voice model uploaded successfully!</p>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading Files...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Start Upload</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
