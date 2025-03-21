import React, { useState } from 'react';
import { usePostForm } from './hooks/usePostForm';
import { DiscordPreview } from './DiscordPreview';

interface PostFormData {
  title: string;
  description: string;
  trackList: string;
  externalUrl: string;
  scheduledDate?: string;
  scheduledTime?: string;
}

interface StepProps {
  formData: PostFormData;
  updateField: (field: keyof PostFormData, value: string) => void;
}

const BasicInfo: React.FC<StepProps> = ({ formData, updateField }) => (
  <div className="space-y-4">
    <div>
      <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
      <input
        type="text"
        id="title"
        value={formData.title}
        onChange={(e) => updateField('title', e.target.value)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-discord focus:ring-discord sm:text-sm"
      />
    </div>
    <div>
      <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
      <textarea
        id="description"
        value={formData.description}
        onChange={(e) => updateField('description', e.target.value)}
        rows={4}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-discord focus:ring-discord sm:text-sm"
      />
    </div>
  </div>
);

const TrackList: React.FC<StepProps> = ({ formData, updateField }) => {
  const handleTrackListPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    
    // Format pasted text: add numbers if missing, clean up formatting
    const lines = pastedText.split('\n').filter(line => line.trim());
    const formattedLines = lines.map((line, index) => {
      // Remove existing numbers and dots at the start
      const cleanLine = line.replace(/^\d+\.\s*/, '').trim();
      return `${index + 1}. ${cleanLine}`;
    });
    
    updateField('trackList', formattedLines.join('\n'));
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="trackList" className="block text-sm font-medium text-gray-700">Track List</label>
        <div className="mt-1">
          <textarea
            id="trackList"
            value={formData.trackList}
            onChange={(e) => updateField('trackList', e.target.value)}
            onPaste={handleTrackListPaste}
            rows={8}
            placeholder="1. Track Name - 3:45&#10;2. Another Track - 4:20"
            className="mt-1 block w-full font-mono rounded-md border-gray-300 shadow-sm focus:border-discord focus:ring-discord sm:text-sm"
          />
          <p className="mt-1 text-sm text-gray-500">
            Paste your track list here. Track numbers will be added automatically if missing.
          </p>
        </div>
      </div>
      <div>
        <label htmlFor="externalUrl" className="block text-sm font-medium text-gray-700">External URL</label>
        <input
          type="url"
          id="externalUrl"
          value={formData.externalUrl}
          onChange={(e) => updateField('externalUrl', e.target.value)}
          placeholder="https://example.com"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-discord focus:ring-discord sm:text-sm"
        />
      </div>
    </div>
  );
};

const Schedule: React.FC<StepProps> = ({ formData, updateField }) => {
  const [isScheduled, setIsScheduled] = useState(false);

  // Set minimum date to today
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];
  
  // Set minimum time if date is today
  const getMinTime = () => {
    if (formData.scheduledDate === minDate) {
      const now = new Date();
      return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }
    return undefined;
  };

  const handleScheduleToggle = (scheduled: boolean) => {
    setIsScheduled(scheduled);
    if (!scheduled) {
      updateField('scheduledDate', '');
      updateField('scheduledTime', '');
    } else {
      // Set default to next hour
      const nextHour = new Date();
      nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
      updateField('scheduledDate', nextHour.toISOString().split('T')[0]);
      updateField('scheduledTime', `${String(nextHour.getHours()).padStart(2, '0')}:00`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => handleScheduleToggle(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                !isScheduled
                  ? 'bg-discord text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Post Immediately
            </button>
            <button
              type="button"
              onClick={() => handleScheduleToggle(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                isScheduled
                  ? 'bg-discord text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Schedule for Later
            </button>
          </div>

          {isScheduled && (
            <div className="space-y-4 pt-4">
              <div>
                <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  id="scheduledDate"
                  min={minDate}
                  value={formData.scheduledDate}
                  onChange={(e) => updateField('scheduledDate', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-discord focus:ring-discord sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700">
                  Time
                </label>
                <input
                  type="time"
                  id="scheduledTime"
                  min={getMinTime()}
                  value={formData.scheduledTime}
                  onChange={(e) => updateField('scheduledTime', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-discord focus:ring-discord sm:text-sm"
                />
                <p className="mt-1 text-sm text-gray-500">
                  All times are in your local timezone
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Post Summary</h3>
        <p className="text-sm text-gray-600">
          {isScheduled
            ? `This post will be published on ${new Date(
                `${formData.scheduledDate}T${formData.scheduledTime}`
              ).toLocaleString()}`
            : 'This post will be published immediately'}
        </p>
      </div>
    </div>
  );
};

const StepContent: React.FC<StepProps & { step: number }> = ({ formData, updateField, step }) => {
  const steps = [
    { title: 'Basic Info', component: BasicInfo },
    { title: 'Track List', component: TrackList },
    { title: 'Schedule', component: Schedule },
  ];

  const CurrentStepComponent = steps[step].component;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <CurrentStepComponent formData={formData} updateField={updateField} />
      </div>
      <div className="hidden lg:block">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Live Preview</h3>
        <DiscordPreview {...formData} />
      </div>
    </div>
  );
};

export function PostWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const { formData, updateField, clearForm } = usePostForm();

  const steps = [
    { title: 'Basic Info', component: BasicInfo },
    { title: 'Track List', component: TrackList },
    { title: 'Schedule', component: Schedule }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    clearForm();
  };

  return (
    <div className="space-y-8">
      {/* Progress bar */}
      <nav className="flex justify-between">
        {steps.map((step, index) => (
          <button
            key={step.title}
            onClick={() => setCurrentStep(index)}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              index === currentStep
                ? 'bg-discord text-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {step.title}
          </button>
        ))}
      </nav>

      {/* Step content */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <StepContent formData={formData} updateField={updateField} step={currentStep} />

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div>
            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-discord hover:bg-discord/90"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Create Post
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
} 