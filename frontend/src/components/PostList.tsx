import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Music, ExternalLink, Edit, Trash2 } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  artist: string;
  album: string;
  imageUrl?: string;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED';
  scheduledFor?: string;
  publishedAt?: string;
  createdAt: string;
}

interface PostListProps {
  limit?: number;
  status?: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED';
}

const PostList: React.FC<PostListProps> = ({ limit, status }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        let url = `${import.meta.env.PUBLIC_API_URL}/posts`;
        const params = new URLSearchParams();
        
        if (limit) {
          params.append('limit', limit.toString());
        }
        
        if (status) {
          params.append('status', status);
        }
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        
        const response = await fetch(url, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        setError('Could not load posts');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [limit, status]);
  
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/posts/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete post');
      }
      
      // Remove post from state
      setPosts(posts.filter(post => post.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete post');
    }
  };
  
  const getStatusBadge = (status: Post['status']) => {
    switch (status) {
      case 'DRAFT':
        return <span className="badge badge-outline">Draft</span>;
      case 'SCHEDULED':
        return <span className="badge badge-primary">Scheduled</span>;
      case 'PUBLISHED':
        return <span className="badge badge-success">Published</span>;
      case 'FAILED':
        return <span className="badge badge-error">Failed</span>;
      default:
        return null;
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };
  
  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="card card-side bg-base-100 shadow-sm animate-pulse">
            <div className="w-24 h-24 bg-base-300"></div>
            <div className="card-body">
              <div className="h-4 bg-base-300 rounded w-3/4"></div>
              <div className="h-3 bg-base-300 rounded w-1/2"></div>
              <div className="h-3 bg-base-300 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
      </div>
    );
  }
  
  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <Music className="w-12 h-12 mx-auto text-base-content opacity-20" />
        <h3 className="mt-4 text-lg font-medium">No posts found</h3>
        <p className="mt-2 text-sm opacity-70">
          Create your first music release post to get started.
        </p>
        <a href="/posts/new" className="btn btn-primary mt-4">
          Create New Post
        </a>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-4">
      {posts.map(post => (
        <div key={post.id} className="card card-side bg-base-100 shadow-sm hover:shadow">
          <figure className="w-24 h-24">
            {post.imageUrl ? (
              <img 
                src={post.imageUrl} 
                alt={`${post.artist} - ${post.album}`}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="bg-base-300 w-full h-full flex items-center justify-center">
                <Music className="w-8 h-8 text-base-content opacity-40" />
              </div>
            )}
          </figure>
          
          <div className="card-body py-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="card-title text-base">{post.title}</h3>
                <p className="text-sm opacity-70">
                  {post.artist} - {post.album}
                </p>
              </div>
              <div>
                {getStatusBadge(post.status)}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs opacity-70">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Created: {formatDate(post.createdAt)}
              </span>
              
              {post.scheduledFor && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Scheduled: {formatDate(post.scheduledFor)}
                </span>
              )}
            </div>
            
            <div className="card-actions justify-end mt-2">
              <a 
                href={`/posts/${post.id}`}
                className="btn btn-xs btn-ghost"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                View
              </a>
              
              <a 
                href={`/posts/${post.id}/edit`}
                className="btn btn-xs btn-ghost"
              >
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </a>
              
              <button 
                onClick={() => handleDelete(post.id)}
                className="btn btn-xs btn-ghost text-error"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostList; 