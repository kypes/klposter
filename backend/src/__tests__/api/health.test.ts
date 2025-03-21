import request from 'supertest';
import app from '../../index';

describe('Health Endpoint', () => {
  it('should return a 200 status and correct response format', async () => {
    const response = await request(app).get('/api/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
    
    // Verify timestamp is in ISO format
    const timestamp = new Date(response.body.timestamp);
    expect(timestamp.toISOString()).toBe(response.body.timestamp);
  });
  
  it('should return a 200 status for music API health endpoint', async () => {
    const response = await request(app).get('/api/music/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('message', 'Music API is running');
  });
}); 