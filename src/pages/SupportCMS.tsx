import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useGetSupportCmsQuery, useUpdateSupportCmsMutation } from '../store/apiSlice';
import { Loader2, Save } from 'lucide-react';

interface SupportCmsForm {
  heading: string;
  subtitle: string;
  emailLabel: string;
  email: string;
  emailNote: string;
  phoneLabel: string;
  phone: string;
  phoneNote: string;
}

const SupportCMS = () => {
  const { data, isLoading } = useGetSupportCmsQuery({});
  const [updateSupportCms, { isLoading: isUpdating }] = useUpdateSupportCmsMutation();

  const { register, handleSubmit, reset } = useForm<SupportCmsForm>();
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (data?.data) {
      reset({
        heading: data.data.heading || '',
        subtitle: data.data.subtitle || '',
        emailLabel: data.data.emailLabel || '',
        email: data.data.email || '',
        emailNote: data.data.emailNote || '',
        phoneLabel: data.data.phoneLabel || '',
        phone: data.data.phone || '',
        phoneNote: data.data.phoneNote || '',
      });
    }
  }, [data, reset]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const onSubmit = async (formData: SupportCmsForm) => {
    try {
      await updateSupportCms(formData).unwrap();
      showToast('Support page updated successfully', 'success');
    } catch (error: any) {
      showToast(error?.data?.message || 'Failed to update support page', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#3CCFBD]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      {toastMsg && (
        <div
          className={`mb-4 p-4 rounded-lg flex items-center shadow-sm ${
            toastType === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          <p className="text-sm font-medium">{toastMsg}</p>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Support Page</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage the content displayed on the public support / contact page
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

        {/* Header Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-lg font-medium text-gray-900 pb-4 border-b border-gray-100">
            Page Header
          </h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heading
              </label>
              <input
                {...register('heading')}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3CCFBD]/20 focus:border-[#3CCFBD] transition-all"
                placeholder="We're Here to Help"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtitle
              </label>
              <input
                {...register('subtitle')}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3CCFBD]/20 focus:border-[#3CCFBD] transition-all"
                placeholder="Have a question or need assistance? We're always happy to help."
              />
            </div>
          </div>
        </div>

        {/* Email Support */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-lg font-medium text-gray-900 pb-4 border-b border-gray-100">
            Email Support
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Label
              </label>
              <input
                {...register('emailLabel')}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3CCFBD]/20 focus:border-[#3CCFBD] transition-all"
                placeholder="Email Support"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3CCFBD]/20 focus:border-[#3CCFBD] transition-all"
                placeholder="johndoe@gmail.com"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Response Note
              </label>
              <input
                {...register('emailNote')}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3CCFBD]/20 focus:border-[#3CCFBD] transition-all"
                placeholder="Response within 24 hours"
              />
            </div>
          </div>
        </div>

        {/* Phone Support */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-lg font-medium text-gray-900 pb-4 border-b border-gray-100">
            Phone Support
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Label
              </label>
              <input
                {...register('phoneLabel')}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3CCFBD]/20 focus:border-[#3CCFBD] transition-all"
                placeholder="Phone Support"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                {...register('phone')}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3CCFBD]/20 focus:border-[#3CCFBD] transition-all"
                placeholder="+1 564 5548 89744"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Availability Hours
              </label>
              <input
                {...register('phoneNote')}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3CCFBD]/20 focus:border-[#3CCFBD] transition-all"
                placeholder="Mon-Fri 9AM-6PM IST"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isUpdating}
            className="flex items-center space-x-2 px-6 py-3 bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 text-white rounded-xl transition-all disabled:opacity-50"
          >
            {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SupportCMS;
