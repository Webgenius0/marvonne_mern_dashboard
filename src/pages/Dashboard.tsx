import { useState } from 'react';
import { useGetAllStoriesQuery, useRegenerateCoverImageMutation, useDeleteStoryMutation, useToggleFeaturedStoryMutation } from '../store/apiSlice';
import { Loader2, BookOpen, PlusCircle, Eye, ChevronLeft, ChevronRight, Brain, RefreshCw, Trash2, X, CheckCircle, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

function StoryCard({ story, onDeleteClick, onUpdateCoverClick, onToggleFeatured, isDeleting, isRegenerating, isTogglingFeatured }: { story: any, onDeleteClick: (story: any) => void, onUpdateCoverClick: (story: any) => void, onToggleFeatured: (story: any) => void, isDeleting: boolean, isRegenerating: boolean, isTogglingFeatured: boolean }) {
  const handleDeleteStory = () => {
    onDeleteClick(story);
  };

  const handleUpdateCoverClick = () => {
    onUpdateCoverClick(story);
  };

  const handleToggleFeatured = (e: React.MouseEvent) => {
    e.preventDefault();
    onToggleFeatured(story);
  };

  const isFeatured = story.is_featured;

  return (
    <div className={`bg-white rounded-3xl shadow-md border-2 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col hover:-translate-y-1 ${isDeleting ? 'opacity-50 pointer-events-none' : ''
      } ${isFeatured
        ? 'border-amber-400 shadow-[0_0_0_2px_rgba(251,191,36,0.3),0_4px_24px_rgba(251,191,36,0.2)]'
        : 'border-gray-100'
      }`}>
      <div className="h-64 bg-gradient-to-br from-[#0d9488]/20 to-[#0f3a4a]/20 relative overflow-hidden group/image">
        {story.cover_image ? (
          <img
            src={story.cover_image}
            alt={story.title}
            className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ease-out ${isRegenerating ? 'opacity-40 blur-sm' : 'opacity-100'}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className={`w-16 h-16 text-[#0d9488]/40 ${isRegenerating ? 'opacity-40 blur-sm' : 'opacity-100'}`} />
          </div>
        )}

        {/* Title Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex items-end p-5">
          <h3 className="text-2xl font-extrabold text-white line-clamp-2 leading-tight drop-shadow-md">
            {story.title}
          </h3>
        </div>

        {/* Loading Overlay */}
        {isRegenerating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 z-20">
            <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-xl flex flex-col items-center">
              <Brain className="w-8 h-8 text-[#0d9488] animate-pulse mb-2" />
              <p className="text-[#0f3a4a] font-bold text-xs text-center">Crafting<br />Cover...</p>
            </div>
          </div>
        )}

        {/* Action Buttons Group */}
        {!isRegenerating && (
          <div className="absolute top-4 left-4 z-30 flex items-center space-x-2 opacity-0 lg:group-hover/image:opacity-100 transition-all" style={{ opacity: window.innerWidth < 1024 ? 1 : undefined }}>
            <button
              onClick={(e) => {
                e.preventDefault();
                handleUpdateCoverClick();
              }}
              className="flex items-center px-3 py-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-bold rounded-full transition-all shadow-lg"
            >
              <RefreshCw className="w-3 h-3 mr-1.5" />
              Update Cover
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                handleDeleteStory();
              }}
              className="flex items-center px-3 py-1.5 bg-red-500/80 hover:bg-red-600 backdrop-blur-md text-white text-xs font-bold rounded-full transition-all shadow-lg"
            >
              <Trash2 className="w-3 h-3 mr-1.5" />
              Delete
            </button>
          </div>
        )}

        <div className="absolute top-4 right-4 flex items-center gap-2 z-30">
          {isFeatured && (
            <div className="bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase text-white shadow-lg shadow-amber-400/30 flex items-center gap-1.5 border border-amber-300">
              <Star className="w-3.5 h-3.5 fill-white" />
              Featured
            </div>
          )}
          <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-[#0d9488] shadow-lg border border-white/20">
            {story.age_group} yrs
          </div>
        </div>
      </div>
      <div className={`p-5 flex-1 flex flex-col ${isFeatured ? 'bg-gradient-to-b from-amber-50/80 to-white' : 'bg-white'}`}>
        <p className="text-sm text-gray-600 line-clamp-3 flex-1 leading-relaxed">
          {story.description}
        </p>
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            {story.page_count} Pages
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleFeatured}
              disabled={isTogglingFeatured}
              title={isFeatured ? 'Unfeature story' : 'Feature on homepage'}
              className={`flex items-center justify-center p-1.5 rounded-full transition-all shadow-sm ${isFeatured
                  ? 'bg-amber-400 text-white hover:bg-amber-500'
                  : 'bg-gray-100 text-gray-400 hover:text-amber-400 hover:bg-amber-50'
                } ${isTogglingFeatured ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {isTogglingFeatured
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Star className={`w-4 h-4 ${isFeatured ? 'fill-white' : ''}`} />
              }
            </button>
            <Link
              to={`/preview/${story.id}`}
              className="flex items-center text-sm font-extrabold text-[#0d9488] hover:text-[#0a192f] transition-colors"
            >
              <Eye className="w-4 h-4 mr-1.5" />
              Preview Story
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, isFetching } = useGetAllStoriesQuery({ page, limit: 9 });
  const [deleteStory, { isLoading: isDeletingStory }] = useDeleteStoryMutation();
  const [regenerateCoverImage, { isLoading: isRegeneratingCover }] = useRegenerateCoverImageMutation();
  const [toggleFeaturedStory, { isLoading: isTogglingFeatured }] = useToggleFeaturedStoryMutation();
  const [togglingStoryId, setTogglingStoryId] = useState<string | null>(null);

  const [storyToDelete, setStoryToDelete] = useState<any>(null);
  const [storyToUpdateCover, setStoryToUpdateCover] = useState<any>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const stories = data?.data || [];
  const meta = data?.meta;

  const confirmDelete = async () => {
    if (!storyToDelete) return;
    try {
      await deleteStory(storyToDelete.id).unwrap();
      setToastMsg(`"${storyToDelete.title}" deleted successfully`);
      setTimeout(() => setToastMsg(''), 4000);
    } catch (err: any) {
      alert(err?.data?.message || err?.message || 'Failed to delete story');
    } finally {
      setStoryToDelete(null);
    }
  };

  const handleToggleFeatured = async (story: any) => {
    setTogglingStoryId(story.id);
    try {
      const result: any = await toggleFeaturedStory(story.id).unwrap();
      setToastMsg(result?.message || `Story featured status updated!`);
      setTimeout(() => setToastMsg(''), 4000);
    } catch (err: any) {
      alert(err?.data?.message || err?.message || 'Failed to toggle featured status');
    } finally {
      setTogglingStoryId(null);
    }
  };

  const confirmUpdateCover = async () => {
    if (!storyToUpdateCover) return;
    try {
      await regenerateCoverImage({ storyId: storyToUpdateCover.id, customPrompt }).unwrap();
      setToastMsg(`Cover for "${storyToUpdateCover.title}" is being generated!`);
      setTimeout(() => setToastMsg(''), 4000);
      setStoryToUpdateCover(null);
      setCustomPrompt('');
    } catch (err: any) {
      alert(err?.data?.message || err?.message || 'Failed to regenerate cover image');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-500 py-10">
        Failed to load stories.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
      <div className="bg-gradient-to-r from-[#0a192f] to-[#0f3a4a] p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
          <div className="bg-[#bef264]/20 p-3 rounded-2xl">
            <BookOpen className="w-8 h-8 text-[#bef264]" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Story Management</h1>
            <p className="text-[#bef264] font-medium mt-1">Manage and view your generated stories</p>
          </div>
        </div>
        <Link
          to="/create"
          className="flex items-center justify-center w-full sm:w-auto px-5 py-2.5 bg-[#bef264] text-[#0a192f] font-bold rounded-full hover:bg-[#bef264]/90 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 duration-200"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Create New Story
        </Link>
      </div>

      <div className="p-6 sm:p-10">

        {stories.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No stories generated yet</h2>
            <p className="text-gray-500 mb-6">Create your first story to get started.</p>
            <Link
              to="/create"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Create First Story
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {stories.map((story: any) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  onDeleteClick={setStoryToDelete}
                  onUpdateCoverClick={setStoryToUpdateCover}
                  onToggleFeatured={handleToggleFeatured}
                  isDeleting={isDeletingStory && storyToDelete?.id === story.id}
                  isRegenerating={isRegeneratingCover && storyToUpdateCover?.id === story.id}
                  isTogglingFeatured={isTogglingFeatured && togglingStoryId === story.id}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {meta && meta.total > meta.limit && (
              <div className="mt-12 flex justify-center items-center space-x-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isFetching}
                  className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </button>
                <span className="text-sm font-medium text-gray-500">
                  Page {meta.page} of {Math.ceil(meta.total / meta.limit)}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(Math.ceil(meta.total / meta.limit), p + 1))}
                  disabled={page >= Math.ceil(meta.total / meta.limit) || isFetching}
                  className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {storyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Story</h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-gray-900">"{storyToDelete.title}"</span>? This will permanently delete the story and all its generated pages and books. This cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setStoryToDelete(null)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                disabled={isDeletingStory}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex items-center px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={isDeletingStory}
              >
                {isDeletingStory ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Cover Modal */}
      {storyToUpdateCover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-[#0a192f] mb-2">Regenerate Cover Image</h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Provide custom instructions for the AI to guide the new cover generation for <span className="font-bold text-gray-900">"{storyToUpdateCover.title}"</span>. Leave blank to let the AI decide.
            </p>

            <textarea
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-[#0d9488] focus:border-[#0d9488] block p-4 mb-6 resize-none shadow-inner"
              rows={4}
              placeholder="e.g. 'A magical forest at night with glowing mushrooms, watercolor style...'"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              disabled={isRegeneratingCover}
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setStoryToUpdateCover(null);
                  setCustomPrompt('');
                }}
                className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                disabled={isRegeneratingCover}
              >
                Cancel
              </button>
              <button
                onClick={confirmUpdateCover}
                className="flex items-center px-5 py-2.5 bg-[#0d9488] text-white text-sm font-bold rounded-xl hover:bg-[#0f3a4a] transition-colors disabled:opacity-50 shadow-md"
                disabled={isRegeneratingCover}
              >
                {isRegeneratingCover ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Brain className="w-4 h-4 mr-2" />}
                Generate Cover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center bg-[#0a192f] text-white px-5 py-3.5 rounded-2xl shadow-xl animate-in slide-in-from-bottom-5">
          <CheckCircle className="w-5 h-5 text-[#bef264] mr-3" />
          <p className="text-sm font-medium">{toastMsg}</p>
          <button onClick={() => setToastMsg('')} className="ml-4 text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
