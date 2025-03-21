import React, { useState } from 'react';
import { AlbumSearchStep } from './AlbumSearchStep';
import { DiscordPreview } from './DiscordPreview';
import { ChevronLeft, ChevronRight, Music2, Edit3, Clock } from 'lucide-react';
import type { EnrichedAlbum } from '../../../lib/types/album';

interface PostFormData {
  albumInfo: EnrichedAlbum | null;
  description: string;
  scheduledDate: string | null;
  postImmediately: boolean;
}

interface Step {
  title: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  isComplete: () => boolean;
}

export function PostWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<PostFormData>({
    albumInfo: null,
    description: '',
    scheduledDate: null,
    postImmediately: true
  });

  // TODO: Get the actual username from Discord auth
  const username = "User";

  const handleAlbumSelect = (album: EnrichedAlbum) => {
    setFormData(prev => ({
      ...prev,
      albumInfo: album,
      description: `${album.name} by ${album.artist}\n\nRelease Date: ${album.releaseDate}\nLabel: ${album.label}\nGenres: ${album.genres.join(', ')}\n\n${album.description || ''}\n\nTrack List:\n${album.tracks.map((track, index) => `${index + 1}. ${track.name}`).join('\n')}\n\nListen on Spotify: ${album.spotifyUrl}`
    }));
  };

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleDescriptionChange = (value: string) => {
    setFormData(prev => ({ ...prev, description: value }));
  };

  const handleScheduleChange = (date: string | null, postNow: boolean) => {
    setFormData(prev => ({
      ...prev,
      scheduledDate: date,
      postImmediately: postNow
    }));
  };

  const steps: Step[] = [
    {
      title: 'Search Album',
      icon: <Music2 size={20} />,
      component: (
        <AlbumSearchStep
          onAlbumSelect={handleAlbumSelect}
          onNext={handleNext}
        />
      ),
      isComplete: () => formData.albumInfo !== null
    },
    {
      title: 'Edit Description',
      icon: <Edit3 size={20} />,
      component: (
        <div className="w-full max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-gradient">Edit Post Description</h2>
          <div className="relative card p-1">
            <textarea
              value={formData.description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              className="w-full h-64 px-4 py-3 bg-surface-50 rounded-lg text-content resize-none focus:outline-none"
              placeholder="Edit the post description..."
            />
            <div className="absolute bottom-4 right-4">
              <button onClick={handleNext} className="btn-primary">
                Next
                <ChevronRight size={18} className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      ),
      isComplete: () => formData.description.trim().length > 0
    },
    {
      title: 'Schedule Post',
      icon: <Clock size={20} />,
      component: (
        <div className="w-full max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-gradient">Schedule Post</h2>
          <div className="card p-6 space-y-6">
            <div className="space-y-4">
              <label className="flex items-center gap-3 p-4 rounded-xl cursor-pointer bg-surface-50 hover:bg-surface-100 transition-colors duration-200">
                <input
                  type="radio"
                  checked={formData.postImmediately}
                  onChange={() => handleScheduleChange(null, true)}
                  className="form-radio text-brand h-5 w-5 border-surface-300"
                />
                <div>
                  <span className="font-medium text-content">Post immediately</span>
                  <p className="text-sm text-content-400">Your post will be published right away</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-4 rounded-xl cursor-pointer bg-surface-50 hover:bg-surface-100 transition-colors duration-200">
                <input
                  type="radio"
                  checked={!formData.postImmediately}
                  onChange={() => handleScheduleChange(new Date().toISOString(), false)}
                  className="form-radio text-brand h-5 w-5 border-surface-300"
                />
                <div>
                  <span className="font-medium text-content">Schedule for later</span>
                  <p className="text-sm text-content-400">Choose when to publish your post</p>
                </div>
              </label>
            </div>
            {!formData.postImmediately && (
              <div className="pt-4 border-t border-surface-200">
                <label className="block text-sm font-medium text-content-200 mb-2">Select date and time</label>
                <input
                  type="datetime-local"
                  value={formData.scheduledDate?.slice(0, 16) || ''}
                  onChange={(e) => handleScheduleChange(e.target.value, false)}
                  className="input"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            )}
            <div className="pt-4 flex justify-end">
              <button onClick={handleNext} className="btn-primary">
                Create Post
              </button>
            </div>
          </div>
        </div>
      ),
      isComplete: () => formData.postImmediately || (formData.scheduledDate !== null)
    }
  ];

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-6 text-gradient">Create New Post</h1>
          <div className="card p-6">
            <div className="flex flex-wrap gap-8">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="flex items-center"
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                      index === currentStep
                        ? 'bg-gradient-to-r from-brand-300 to-brand-400 text-white shadow-glow'
                        : index < currentStep
                        ? 'bg-accent-green text-white'
                        : 'bg-surface-200 text-content-400'
                    }`}
                  >
                    {step.icon}
                  </div>
                  <div className="ml-3">
                    <span
                      className={`font-medium transition-colors duration-200 ${
                        index === currentStep
                          ? 'text-gradient'
                          : index < currentStep
                          ? 'text-accent-green'
                          : 'text-content-400'
                      }`}
                    >
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <ChevronRight className="inline-block ml-4 text-surface-300" size={20} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 card p-6">
            {steps[currentStep].component}
          </div>
          <div className="w-full lg:w-96 lg:sticky lg:top-8 lg:self-start">
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4 text-gradient">Preview</h2>
              <DiscordPreview
                albumInfo={formData.albumInfo}
                description={formData.description}
                username={username}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="btn-secondary"
            >
              <ChevronLeft size={18} className="mr-2" />
              Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 