import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  useGetAllIllustrationsQuery,
  useCreateIllustrationMutation,
  useUpdateIllustrationMutation,
  useDeleteIllustrationMutation,
  useGenerateIllustrationByAIMutation
} from '../store/apiSlice';
import { Loader2, Plus, Edit2, Trash2, X, Save, Image as ImageIcon, Wand2 } from 'lucide-react';

export default function Illustrations() {
  const { data, isLoading } = useGetAllIllustrationsQuery({});
  const [createIllustration] = useCreateIllustrationMutation();
  const [updateIllustration] = useUpdateIllustrationMutation();
  const [deleteIllustration] = useDeleteIllustrationMutation();
  const [generateIllustrationByAI, { isLoading: isGeneratingAI }] = useGenerateIllustrationByAIMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [illustrationPrompt, setIllustrationPrompt] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [aiPrompt, setAiPrompt] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const handleOpenModal = (illustration?: any) => {
    if (illustration) {
      setEditingId(illustration.id);
      setTitle(illustration.title);
      setIllustrationPrompt(illustration.illustration_prompt || '');
      setIsActive(illustration.is_active);
      setPreviewUrl(illustration.image_url);
      setImageFile(null);
    } else {
      setEditingId(null);
      setTitle('');
      setIllustrationPrompt('');
      setIsActive(true);
      setPreviewUrl('');
      setImageFile(null);
    }
    setAiPrompt('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return setToastMsg('Please enter a prompt for AI generation');
    
    try {
      const result = await generateIllustrationByAI({ prompt: aiPrompt }).unwrap();
      setPreviewUrl(result.data.image_url);
      setImageFile(null); // Clear any uploaded file since we're using AI generated image
      setToastMsg('Image generated successfully!');
      setTimeout(() => setToastMsg(''), 3000);
    } catch (error: any) {
      setToastMsg(error?.data?.message || 'Failed to generate image');
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setToastMsg('Title is required');
    if (!editingId && !imageFile && !previewUrl) return setToastMsg('Image is required');

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('illustration_prompt', illustrationPrompt);
    formData.append('is_active', String(isActive));
    
    if (imageFile) {
      formData.append('image', imageFile);
    } else if (previewUrl) {
      // If we have a previewUrl but no imageFile, it means it was AI generated
      formData.append('image_url', previewUrl);
    }

    try {
      if (editingId) {
        await updateIllustration({ id: editingId, data: formData }).unwrap();
        setToastMsg('Illustration updated successfully');
      } else {
        await createIllustration(formData).unwrap();
        setToastMsg('Illustration created successfully');
      }
      setTimeout(() => setToastMsg(''), 3000);
      handleCloseModal();
    } catch (error: any) {
      setToastMsg(error?.data?.message || 'Operation failed');
      setTimeout(() => setToastMsg(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this illustration style?')) {
      try {
        await deleteIllustration(id).unwrap();
        setToastMsg('Illustration deleted');
        setTimeout(() => setToastMsg(''), 3000);
      } catch (error: any) {
        setToastMsg(error?.data?.message || 'Failed to delete');
        setTimeout(() => setToastMsg(''), 3000);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#3CCFBD]" />
      </div>
    );
  }

  const illustrations = data?.data || [];

  return (
    <div className="max-w-6xl mx-auto py-8">
      {toastMsg && (
        <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg flex items-center shadow-sm">
          <p className="text-sm font-medium">{toastMsg}</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Illustration Styles</h1>
          <p className="text-sm text-gray-500 mt-1">Manage artistic styles available for users' books.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 px-4 py-2 bg-[#3CCFBD] text-white rounded-xl hover:bg-[#33b8a7] transition-colors shadow-sm font-medium cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Add Style</span>
        </button>
      </div>

      {illustrations.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No illustration styles yet</h3>
          <p className="text-gray-500 mt-1">Add styles to let users personalize their book artwork.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {illustrations.map((item: any) => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group">
              <div className="relative aspect-square bg-gray-50">
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                {!item.is_active && (
                  <div className="absolute top-3 left-3 bg-red-100 text-red-600 px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                    Inactive
                  </div>
                )}
                <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenModal(item)}
                    className="p-2 bg-white text-gray-700 rounded-full shadow-md hover:text-[#3CCFBD] transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 bg-white text-gray-700 rounded-full shadow-md hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4 text-center border-t border-gray-50">
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingId ? 'Edit Illustration Style' : 'New Illustration Style'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Style Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3CCFBD]/20 focus:border-[#3CCFBD] transition-all"
                  placeholder="e.g. Water Color, Anime, 3D Render..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">AI Illustration Prompt (System Instructions)</label>
                <textarea
                  required
                  value={illustrationPrompt}
                  onChange={(e) => setIllustrationPrompt(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3CCFBD]/20 focus:border-[#3CCFBD] transition-all"
                  placeholder="e.g. A charming crayon drawing. Textured waxy strokes..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  This detailed prompt is sent to the AI image generator when users select this style.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Display Image</label>
                
                {/* Image Upload or AI Generate options */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Option 1: Upload Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#3CCFBD]/10 file:text-[#3CCFBD] hover:file:bg-[#3CCFBD]/20 transition-all cursor-pointer"
                    />
                  </div>

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium">OR</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Option 2: Generate with AI</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="e.g. A whimsical cartoon forest style"
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={handleGenerateAI}
                        disabled={isGeneratingAI || !aiPrompt.trim()}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
                      >
                        {isGeneratingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                        <span>Generate</span>
                      </button>
                    </div>
                  </div>
                </div>

                {isGeneratingAI ? (
                  <div className="w-full h-48 bg-gray-100 rounded-xl border border-gray-200 flex flex-col items-center justify-center animate-pulse">
                    <Loader2 className="w-8 h-8 text-blue-500 mb-2 animate-spin" />
                    <span className="text-sm text-gray-500 font-medium">Generating your magic...</span>
                  </div>
                ) : previewUrl ? (
                  <div className="relative">
                    <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover rounded-xl border border-gray-200" />
                    <button 
                      type="button" 
                      onClick={() => { setPreviewUrl(''); setImageFile(null); }}
                      className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md text-gray-500 hover:text-red-500 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-40 bg-gray-50 rounded-xl border border-gray-200 flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon className="w-8 h-8 mb-2" />
                    <span className="text-sm">No image selected</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-5 h-5 text-[#3CCFBD] border-gray-300 rounded focus:ring-[#3CCFBD]"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active (visible to users)
                </label>
              </div>

              <div className="pt-4 flex space-x-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-[#1E3A5F] text-white rounded-xl font-medium hover:bg-[#1E3A5F]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  <span>{editingId ? 'Update' : 'Save'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
