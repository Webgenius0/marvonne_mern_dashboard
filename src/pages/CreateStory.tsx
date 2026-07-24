import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useGetSettingsQuery, useCreateStoryMutation, useGetStoryStatusQuery } from '../store/apiSlice';
import { Wand2, ArrowLeft, Brain, Type, CheckCircle2, BookOpen, Users, Layers } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';

const FONT_OPTIONS = [
  { value: 'Chewy', family: 'Chewy', label: 'Chewy', desc: 'Playful & bubbly', sample: 'Once upon a time...' },
  { value: 'Fredoka One', family: 'Fredoka One', label: 'Fredoka One', desc: 'Rounded & fun', sample: 'A magical world...' },
  { value: 'Baloo 2', family: 'Baloo 2', label: 'Baloo 2', desc: 'Friendly storybook', sample: 'In a land far away...' },
  { value: 'Patrick Hand', family: 'Patrick Hand', label: 'Patrick Hand', desc: 'Hand-written feel', sample: 'Dear little reader...' },
  { value: 'Schoolbell', family: 'Schoolbell', label: 'Schoolbell', desc: 'Chalk-board style', sample: 'Today we explore...' },
  { value: 'Architects Daughter', family: 'Architects Daughter', label: 'Architects Daughter', desc: 'Sketchy & creative', sample: 'The adventure begins...' },
  { value: 'Comic Neue', family: 'Comic Neue', label: 'Comic Neue', desc: 'Comic-book look', sample: 'Zoom! Off they went...' },
  { value: 'Bubblegum Sans', family: 'Bubblegum Sans', label: 'Bubblegum Sans', desc: 'Sweet & dreamy', sample: 'Sweet dreams await...' },
];

const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=' +
  FONT_OPTIONS.map((f) => f.family.replace(/ /g, '+')).join('&family=') +
  '&display=swap';

export default function CreateStory() {
  const navigate = useNavigate();
  const [createStory, { isLoading: isCreating }] = useCreateStoryMutation();
  const { data: settingsResponse } = useGetSettingsQuery({});
  const maxPages = settingsResponse?.data?.max_pages || 20;

  const [errorMsg, setErrorMsg] = useState('');
  const [pollingStoryId, setPollingStoryId] = useState<string | null>(() => {
    return sessionStorage.getItem('pollingStoryId');
  });

  useEffect(() => {
    const linkId = 'create-story-fonts';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = GOOGLE_FONTS_URL;
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    if (pollingStoryId) {
      sessionStorage.setItem('pollingStoryId', pollingStoryId);
    } else {
      sessionStorage.removeItem('pollingStoryId');
    }
  }, [pollingStoryId]);

  const { data: statusData } = useGetStoryStatusQuery(pollingStoryId, {
    skip: !pollingStoryId,
    pollingInterval: 3000,
  });

  const storyStatus = statusData?.data;
  const isLoading = isCreating || pollingStoryId !== null;

  useEffect(() => {
    if (storyStatus) {
      if (storyStatus.status === 'COMPLETED') {
        sessionStorage.removeItem('pollingStoryId');
        navigate('/');
      } else if (storyStatus.status === 'FAILED') {
        sessionStorage.removeItem('pollingStoryId');
        setErrorMsg(storyStatus.error_message || 'Failed to generate story');
        setPollingStoryId(null);
      }
    }
  }, [storyStatus, navigate]);

  const createStorySchema = useMemo(
    () =>
      z.object({
        title: z.string().min(1, 'Title is required'),
        description: z.string().min(10, 'Description must be at least 10 characters'),
        age_group: z.string().min(1, 'Age group is required'),
        page_count: z
          .number()
          .min(1, 'Must have at least 1 page')
          .max(maxPages, `Max ${maxPages} pages`),
        font_style: z.string().min(1, 'Please select a font style'),
      }),
    [maxPages]
  );

  type CreateStoryForm = z.infer<typeof createStorySchema>;

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<CreateStoryForm>({
    resolver: zodResolver(createStorySchema),
    defaultValues: {
      page_count: 5,
      font_style: 'Chewy',
    },
  });

  const selectedFont = watch('font_style');

  const onSubmit = async (data: CreateStoryForm) => {
    try {
      setErrorMsg('');
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('age_group', data.age_group);
      formData.append('page_count', data.page_count.toString());
      formData.append('create_with_ai', 'true');
      formData.append('font_style', data.font_style);

      const res = await createStory(formData).unwrap();
      if (res?.data?.id) {
        setPollingStoryId(res.data.id);
      } else {
        navigate('/');
      }
    } catch (err: any) {
      let msg = err?.data?.message || err?.message || 'Failed to create story';
      try {
        if (typeof msg === 'string' && msg.trim().startsWith('{')) {
          const parsed = JSON.parse(msg);
          if (parsed?.error?.message) msg = parsed.error.message;
          else if (parsed?.message) msg = parsed.message;
        }
      } catch (_) { }
      setErrorMsg(msg);
    }
  };

  const selectedFontObj = FONT_OPTIONS.find((f) => f.value === selectedFont);

  return (
    <div
      className="min-h-screen -m-4 sm:-m-6 md:-m-10 p-4 md:p-10 relative overflow-y-auto"
      style={{ background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 50%, #faf8ff 100%)' }}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500" />

      <div className="max-w-4xl mx-auto relative z-10 pt-4 pb-10">

        {/* Header */}
        <div className="flex items-center gap-5 mb-8 bg-gradient-to-r from-[#0a192f] via-[#0d2741] to-[#0f3a4a] p-6 md:p-8 rounded-3xl shadow-2xl">
          <Link
            to="/"
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all border border-white/20 backdrop-blur-md shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="p-3 bg-[#bef264]/20 rounded-2xl shrink-0">
            <Wand2 className="w-8 h-8 text-[#bef264]" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Generate Magic Story
            </h1>
            <p className="text-[#bef264]/90 font-medium mt-0.5 text-sm md:text-base">
              AI crafts a beautiful children's book — you control the style
            </p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 flex flex-col items-center justify-center min-h-[480px]">
            <div className="relative flex justify-center items-center w-28 h-28 mb-6">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-400 to-purple-500 rounded-full blur-3xl opacity-25 animate-pulse" />
              <div className="relative bg-white p-6 rounded-3xl shadow-lg border border-indigo-100 flex items-center justify-center">
                <Brain className="w-12 h-12 text-indigo-600 animate-pulse" />
              </div>
            </div>
            <div className="w-full max-w-md space-y-4 mb-8">
              {[90, 75, 60].map((w, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-10 h-10 shrink-0 bg-indigo-50 rounded-xl animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-2.5 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-full animate-pulse" style={{ width: `${w}%` }} />
                    <div className="h-2.5 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-full animate-pulse" style={{ width: `${w - 15}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {storyStatus ? `Generating... ${storyStatus.progress}%` : 'Starting...'}
            </h3>
            <p className="text-gray-500 text-sm font-medium mb-6">
              {storyStatus?.status === 'PROCESSING_TEXT' && 'Writing the magical story text...'}
              {storyStatus?.status === 'PROCESSING_IMAGES' && 'Crafting beautiful illustrations...'}
              {!storyStatus && 'Initializing your story...'}
            </p>
            {storyStatus && (
              <div className="w-full max-w-sm h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${storyStatus.progress}%` }}
                />
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {errorMsg && (
              <div className="bg-red-50 text-red-700 text-sm p-4 rounded-2xl border border-red-100 font-medium flex items-start gap-3 shadow-sm">
                <div className="mt-1 w-2 h-2 rounded-full bg-red-500 shrink-0" />
                {errorMsg}
              </div>
            )}

            {/* Row 1: Title + Age/Pages */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 group hover:border-indigo-200 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-indigo-50 rounded-lg">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                  </div>
                  <label className="text-sm font-bold text-gray-700 group-focus-within:text-indigo-600 transition-colors">
                    Story Title
                  </label>
                </div>
                <input
                  type="text"
                  {...register('title')}
                  placeholder="e.g. A boy in the forest"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition-all text-sm"
                />
                <p className="mt-2 text-[11px] text-gray-400">AI will improve and polish this title</p>
                {errors.title && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.title.message}</p>}
              </div>

              {/* Age Group + Pages */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 group hover:border-indigo-200 transition-colors space-y-5">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-emerald-50 rounded-lg">
                      <Users className="w-4 h-4 text-emerald-600" />
                    </div>
                    <label className="text-sm font-bold text-gray-700">Age Group</label>
                  </div>
                  <select
                    {...register('age_group')}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition-all text-sm cursor-pointer appearance-none"
                  >
                    <option value="">Select age group</option>
                    <option value="0-3">0–3 years</option>
                    <option value="3-7">3–7 years</option>
                    <option value="8-12">8–12 years</option>
                    <option value="13-17">13–17 years</option>
                    <option value="18-30">18–30 years</option>
                    <option value="30-40">30–40 years</option>
                    <option value="40-60">40–60 years</option>
                    <option value="60-80">60–80 years</option>
                    <option value="80-100">80–100 years</option>
                  </select>
                  {errors.age_group && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.age_group.message}</p>}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-amber-50 rounded-lg">
                      <Layers className="w-4 h-4 text-amber-600" />
                    </div>
                    <label className="text-sm font-bold text-gray-700">Number of Pages</label>
                  </div>
                  <input
                    type="number"
                    {...register('page_count', { valueAsNumber: true })}
                    min={1}
                    max={maxPages}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition-all text-sm"
                  />
                  <p className="mt-2 text-[11px] text-gray-400">Maximum {maxPages} pages allowed</p>
                  {errors.page_count && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.page_count.message}</p>}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 group hover:border-indigo-200 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-violet-50 rounded-lg">
                    <Brain className="w-4 h-4 text-violet-600" />
                  </div>
                  <label className="text-sm font-bold text-gray-700 group-focus-within:text-indigo-600 transition-colors">
                    Story Idea / Description
                  </label>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-500 flex items-center bg-indigo-50 px-2.5 py-1 rounded-full">
                  <Brain className="w-3 h-3 mr-1" /> AI Powered
                </span>
              </div>
              <textarea
                {...register('description')}
                rows={5}
                placeholder="e.g. A curious cat and a friendly dog go on an adventure in the magical forest, discovering hidden treasures and making new friends along the way..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition-all resize-none text-sm"
              />
              <p className="mt-2 text-[11px] text-gray-400">Be descriptive — AI uses this to create the entire narrative arc</p>
              {errors.description && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.description.message}</p>}
            </div>

            {/* Font Style Picker */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-50 rounded-lg">
                    <Type className="w-4 h-4 text-purple-600" />
                  </div>
                  <label className="text-sm font-bold text-gray-700">
                    Text Overlay Font Style
                  </label>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600 flex items-center bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-full">
                  <Wand2 className="w-3 h-3 mr-1" /> Admin Control
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mb-5 ml-8">
                Story text is always rendered directly onto each illustration. Select the font that will be used.
              </p>

              <Controller
                name="font_style"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {FONT_OPTIONS.map((font) => {
                      const isSelected = field.value === font.value;
                      return (
                        <button
                          key={font.value}
                          type="button"
                          onClick={() => field.onChange(font.value)}
                          className={`relative flex flex-col items-start text-left cursor-pointer p-4 rounded-2xl border-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-md focus:outline-none
                            ${isSelected
                              ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-md shadow-indigo-100'
                              : 'border-gray-100 bg-gray-50/60 hover:border-indigo-200 hover:bg-indigo-50/30'
                            }`}
                        >
                          {isSelected && (
                            <CheckCircle2 className="absolute top-2.5 right-2.5 w-4 h-4 text-indigo-600" />
                          )}
                          <span
                            className="block text-xl text-gray-800 mb-3 leading-snug"
                            style={{ fontFamily: `'${font.family}', cursive` }}
                          >
                            {font.sample}
                          </span>
                          <span className={`block text-[11px] font-bold mt-auto ${isSelected ? 'text-indigo-700' : 'text-gray-600'}`}>
                            {font.label}
                          </span>
                          <span className="block text-[10px] text-gray-400 mt-0.5">
                            {font.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              />

              {/* Live preview */}
              {selectedFontObj && (
                <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 flex items-center gap-4">
                  <Type className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider mb-0.5">
                      Live Preview — {selectedFontObj.label}
                    </p>
                    <p
                      className="text-lg text-gray-800 truncate"
                      style={{ fontFamily: `'${selectedFontObj.family}', cursive` }}
                    >
                      The magical adventure begins here...
                    </p>
                  </div>
                </div>
              )}

              {errors.font_style && (
                <p className="mt-2 text-xs text-red-500 font-medium">{errors.font_style.message}</p>
              )}
            </div>

            {/* Submit */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              {selectedFontObj && (
                <p className="text-xs text-gray-400 font-medium">
                  ✦ Text overlay will use <strong className="text-gray-600">{selectedFontObj.label}</strong> font
                </p>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="ml-auto flex items-center justify-center gap-2 px-10 py-4 bg-gradient-to-r from-[#0a192f] to-[#0f3a4a] text-white rounded-2xl font-bold text-sm hover:opacity-90 focus:ring-4 focus:ring-indigo-200 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                <Brain className="w-4 h-4 text-[#bef264]" />
                Generate Magic Story
                <Wand2 className="w-4 h-4 text-[#bef264]" />
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}
