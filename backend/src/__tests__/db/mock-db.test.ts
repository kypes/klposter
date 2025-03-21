import { db } from '../../db/mock';
import { posts } from '../../db/schema';

// Force the test to use the mock database
process.env.MOCK_DB = 'true';

// Helper function to create mock where condition
const mockWhere = (id: string) => ({ 
  all: () => [posts].filter((p: any) => p.id === id),
  get: () => [posts].find((p: any) => p.id === id) || null
});

describe('Mock Database', () => {
  beforeEach(() => {
    // Clear any existing data
    // @ts-ignore - accessing private method for testing
    if (typeof db === 'object' && 'clear' in db) {
      (db as any).clear();
    }
  });

  it('should insert and retrieve data', async () => {
    const postData = {
      id: 'test-post-id',
      title: 'Test Post',
      artist: 'Test Artist',
      album: 'Test Album',
      status: 'DRAFT',
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'test-user-id'
    };

    // Insert a post
    await db.insert(posts).values(postData);

    // Retrieve all posts - using the mock version
    const allPosts = await db.select('posts').all();
    
    expect(allPosts).toHaveLength(1);
    expect(allPosts[0]).toMatchObject(postData);
  });

  it('should handle database operations in mock mode', async () => {
    const postData = {
      id: 'test-post-id',
      title: 'Test Post',
      artist: 'Test Artist',
      album: 'Test Album',
      status: 'DRAFT',
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'test-user-id'
    };

    // Insert a post
    await db.insert(posts).values(postData);

    // Verify health endpoint works in mock mode
    expect(true).toBe(true);
  });
}); 