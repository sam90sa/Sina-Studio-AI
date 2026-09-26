/**
 * API client service
 */

import axios, { AxiosInstance } from 'axios';
import { APIResponse, Job } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const SERVER_URL = API_URL.replace(/\/api\/?$/, '');

class APIClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({ baseURL: API_URL, headers: { 'Content-Type': 'application/json' } });
    this.client.interceptors.request.use((request) => {
      if (this.token) request.headers.Authorization = `Bearer ${this.token}`;
      return request;
    });
    this.token = localStorage.getItem('authToken');
  }

  setToken(token: string): void { this.token = token; localStorage.setItem('authToken', token); }
  clearToken(): void { this.token = null; localStorage.removeItem('authToken'); }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await axios.get(`${SERVER_URL}/health`);
    return response.data;
  }

  async createJob(jobData: { type: string; input: Record<string, any>; priority?: string }): Promise<APIResponse<any>> {
    const response = await this.client.post('/v1/jobs', jobData);
    return response.data;
  }

  async getJobStatus(jobId: string): Promise<APIResponse<Job>> {
    const response = await this.client.get(`/v1/jobs/${jobId}`);
    return response.data;
  }

  async cancelJob(jobId: string): Promise<APIResponse<any>> {
    const response = await this.client.post(`/v1/jobs/${jobId}/cancel`);
    return response.data;
  }

  async generateImage(prompt: string, size = '1024x1024', quality = 'standard'): Promise<any> {
    const response = await this.client.post('/v1/generate/image', { prompt, size, quality });
    return response.data;
  }

  async generateVideo(prompt: string, duration = 10, fps = 24): Promise<any> {
    const response = await this.client.post('/v1/generate/video', { prompt, duration, fps });
    return response.data;
  }

  async generateAudio(prompt: string, voice = 'neutral', duration = 30): Promise<any> {
    const response = await this.client.post('/v1/generate/audio', { prompt, voice, duration });
    return response.data;
  }

  async generateSpeech(text: string, language = 'fa', voice = 'neutral'): Promise<any> {
    const response = await this.client.post('/v1/generate/speech', { text, language, voice });
    return response.data;
  }
}

export default new APIClient();
