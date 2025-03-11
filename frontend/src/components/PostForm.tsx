import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Search, Calendar, Music, Image, Save, Clock } from 'lucide-react';
import debounce from 'lodash.debounce';

interface PostFormProps {
  postId?: string;
  onSubmit: (data: PostFormData) => Promise<void>;
  isSubmitting: boolean;
}

export interface PostFormData {
  title: string;
  artist: string;
  album: string;
  releaseDate?: string;
  spotifyUrl?: string;
  lastfmUrl?: string;
  imageUrl?: string;
  description?: string;
  trackList?: Array<{ name: string; duration?: string }>;
  scheduledFor?: string;
}

interface SearchResult {
  title: string;
  artist: string;
  album: string;
  releaseDate?: string;
  spotifyUrl?: string;
  lastfmUrl?: string;
  imageUrl?: string;
  tracks?: Array<{ name: string; duration?: string }>;
}

const PostForm: React.FC<PostFormProps> = ({ postId, onSubmit, isSubmitting }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isScheduled, setIsScheduled] = useState<boolean>(false);
  
  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<PostFormData>({
    defaultValues: {
      title: '',
      artist: '',
      album: '',
      releaseDate: '',
      spotifyUrl: '',
      lastfmUrl: '',
      imageUrl: '',
      description: '',
      trackList: [],
      scheduledFor: ''
    }
  });
  
  const watchedImageUrl = watch('imageUrl');
  
  // Load existing post data if editing
  useEffect(() => {
    const fetchPostData = async () => {
      if (!postId) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/posts/${postId}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch post data');
        }
        
        const postData = await response.json();
        
        // Set form values
        setValue('title', postData.title);
        setValue('artist', postData.artist);
        setValue('album', postData.album);
        setValue('releaseDate', postData.releaseDate || '');
        setValue('spotifyUrl', postData.spotifyUrl || '');
        setValue('lastfmUrl', postData.lastfmUrl || '');
        setValue('imageUrl', postData.imageUrl || '');
        setValue('description', postData.description || '');
        setValue('trackList', postData.trackList ? JSON.parse(postData.trackList) : []);
        
        if (postData.scheduledFor) {
          setIsScheduled(true);
          // Format date for datetime-local input
          const scheduledDate = new Date(postData.scheduledFor);
          const formattedDate = scheduledDate.toISOString().slice(0, 16);
          setValue('scheduledFor', formattedDate);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPostData();
  }, [postId, setValue]);
  
  // Debounced search function
  const debouncedSearch = debounce(async (query: string) => {
    if (!query || query.length < 3) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    setSearchError(null);
    
    try {
      const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/music/combine?query=${encodeURIComponent(query)}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Failed to search for music data');
    } finally {
      setIsSearching(false);
    }
  }, 500);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };
  
  // Apply search results to form
  const applySearchResults = () => {
    if (!searchResults) return;
    
    setValue('title', searchResults.title);
    setValue('artist', searchResults.artist);
    setValue('album', searchResults.album);
    setValue('releaseDate', searchResults.releaseDate || '');
    setValue('spotifyUrl', searchResults.spotifyUrl || '');
    setValue('lastfmUrl', searchResults.lastfmUrl || '');
    setValue('imageUrl', searchResults.imageUrl || '');
    setValue('trackList', searchResults.tracks || []);
    
    // Clear search
    setSearchQuery('');
    setSearchResults(null);
  };
  
  // Handle form submission
  const handleFormSubmit = (data: PostFormData) => {
    // If not scheduled, remove scheduledFor field
    if (!isScheduled) {
      data.scheduledFor = undefined;
    }
    
    onSubmit(data);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Search Section */}
      <div className="card bg-base-200 shadow-sm mb-6">
        <div className="card-body">
          <h3 className="card-title flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search for Music
          </h3>
          
          <div className="form-control">
            <div className="input-group">
              <input
                type="text"
                placeholder="Search by artist and album..."
                className="input input-bordered w-full"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <button 
                type="button" 
                className="btn btn-square btn-primary"
                disabled={isSearching}
              >
                {isSearching ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>
            </div>
            {searchError && (
              <p className="text-error text-sm mt-1">{searchError}</p>
            )}
          </div>
          
          {searchResults && (
            <div className="mt-4 p-4 bg-base-100 rounded-box">
              <div className="flex items-start gap-4">
                {searchResults.imageUrl && (
                  <img 
                    src={searchResults.imageUrl} 
                    alt={`${searchResults.artist} - ${searchResults.album}`}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-bold">{searchResults.title}</h4>
                  <p>{searchResults.artist} - {searchResults.album}</p>
                  <p className="text-sm opacity-70">
                    {searchResults.tracks?.length || 0} tracks
                    {searchResults.releaseDate && ` • Released: ${searchResults.releaseDate}`}
                  </p>
                  
                  <button 
                    type="button"
                    className="btn btn-sm btn-primary mt-2"
                    onClick={applySearchResults}
                  >
                    Use This Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Basic Info Section */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className="card-title flex items-center gap-2">
            <Music className="w-5 h-5" />
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Title</span>
              </label>
              <input
                type="text"
                className={`input input-bordered w-full ${errors.title ? 'input-error' : ''}`}
                {...register('title', { required: 'Title is required' })}
              />
              {errors.title && (
                <p className="text-error text-sm mt-1">{errors.title.message}</p>
              )}
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Artist</span>
              </label>
              <input
                type="text"
                className={`input input-bordered w-full ${errors.artist ? 'input-error' : ''}`}
                {...register('artist', { required: 'Artist is required' })}
              />
              {errors.artist && (
                <p className="text-error text-sm mt-1">{errors.artist.message}</p>
              )}
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Album</span>
              </label>
              <input
                type="text"
                className={`input input-bordered w-full ${errors.album ? 'input-error' : ''}`}
                {...register('album', { required: 'Album is required' })}
              />
              {errors.album && (
                <p className="text-error text-sm mt-1">{errors.album.message}</p>
              )}
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Release Date</span>
              </label>
              <input
                type="date"
                className="input input-bordered w-full"
                {...register('releaseDate')}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Links Section */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className="card-title flex items-center gap-2">
            <Image className="w-5 h-5" />
            Media & Links
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Spotify URL</span>
              </label>
              <input
                type="url"
                className="input input-bordered w-full"
                placeholder="https://open.spotify.com/album/..."
                {...register('spotifyUrl')}
              />
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Last.fm URL</span>
              </label>
              <input
                type="url"
                className="input input-bordered w-full"
                placeholder="https://www.last.fm/music/..."
                {...register('lastfmUrl')}
              />
            </div>
            
            <div className="form-control md:col-span-2">
              <label className="label">
                <span className="label-text">Image URL</span>
              </label>
              <input
                type="url"
                className="input input-bordered w-full"
                placeholder="https://..."
                {...register('imageUrl')}
              />
              
              {watchedImageUrl && (
                <div className="mt-2">
                  <img 
                    src={watchedImageUrl} 
                    alt="Album cover preview" 
                    className="w-32 h-32 object-cover rounded-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                    onLoad={(e) => {
                      (e.target as HTMLImageElement).style.display = 'block';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-24"
              placeholder="Add a description for this release..."
              {...register('description')}
            ></textarea>
          </div>
        </div>
      </div>
      
      {/* Track List Section */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className="card-title flex items-center gap-2">
            <Music className="w-5 h-5" />
            Track List
          </h3>
          
          <Controller
            name="trackList"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                {field.value && field.value.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Title</th>
                          <th>Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {field.value.map((track, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{track.name}</td>
                            <td>{track.duration || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4 opacity-70">
                    <p>No tracks added yet.</p>
                    <p className="text-sm">Use the search function to automatically add tracks.</p>
                  </div>
                )}
              </div>
            )}
          />
        </div>
      </div>
      
      {/* Scheduling Section */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className="card-title flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Scheduling
          </h3>
          
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Schedule this post for later</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={isScheduled}
                onChange={(e) => setIsScheduled(e.target.checked)}
              />
            </label>
          </div>
          
          {isScheduled && (
            <div className="form-control mt-2">
              <label className="label">
                <span className="label-text">Schedule Date & Time</span>
              </label>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <input
                  type="datetime-local"
                  className="input input-bordered w-full"
                  {...register('scheduledFor')}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Submit Button */}
      <div className="flex justify-end mt-6">
        <button
          type="submit"
          className="btn btn-primary btn-lg gap-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            <Save className="w-5 h-5" />
          )}
          {postId ? 'Update Post' : 'Create Post'}
        </button>
      </div>
    </form>
  );
};

export default PostForm; 