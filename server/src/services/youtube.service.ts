import axios from 'axios';
import { env } from '../config/env.js';

export interface YouTubeVideoMetadata {
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelId: string;
  channelTitle: string;
  duration?: string;
  viewCount?: string;
}

export class YouTubeService {
  /**
   * Extract video ID from various YouTube URL formats
   */
  static extractVideoId(url: string): string | null {
    if (!url || typeof url !== 'string') return null;

    const cleanUrl = url.trim();

    // Standard watch: https://www.youtube.com/watch?v=VIDEO_ID
    const standardMatch = cleanUrl.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i);
    if (standardMatch && standardMatch[1]) {
      return standardMatch[1];
    }

    // Direct 11-char ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
      return cleanUrl;
    }

    return null;
  }

  /**
   * Fetch video metadata using YouTube Data API v3 or oEmbed fallback
   */
  static async getVideoMetadata(videoUrlOrId: string): Promise<YouTubeVideoMetadata> {
    const videoId = this.extractVideoId(videoUrlOrId);
    if (!videoId) {
      throw new Error('Invalid YouTube video URL or Video ID. Please provide a valid YouTube link.');
    }

    // Attempt 1: If YouTube Data API v3 key is provided
    if (env.YOUTUBE_API_KEY && env.YOUTUBE_API_KEY.trim() !== '') {
      try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
          params: {
            part: 'snippet,statistics,contentDetails',
            id: videoId,
            key: env.YOUTUBE_API_KEY,
          },
          timeout: 5000,
        });

        if (response.data.items && response.data.items.length > 0) {
          const item = response.data.items[0];
          const snippet = item.snippet;
          const thumbnails = snippet.thumbnails;
          const thumbnail =
            thumbnails.maxres?.url ||
            thumbnails.standard?.url ||
            thumbnails.high?.url ||
            thumbnails.medium?.url ||
            thumbnails.default?.url;

          return {
            videoId,
            title: snippet.title || 'Untitled YouTube Video',
            description: snippet.description || '',
            thumbnailUrl: thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            channelId: snippet.channelId || '',
            channelTitle: snippet.channelTitle || 'YouTube Creator',
            viewCount: item.statistics?.viewCount,
          };
        }
      } catch (apiErr: any) {
        console.warn(`[YouTube Service] Data API v3 query failed (${apiErr.message}). Falling back to oEmbed...`);
      }
    }

    // Attempt 2: High reliability YouTube oEmbed endpoint (No API key required)
    try {
      const oembedRes = await axios.get('https://www.youtube.com/oembed', {
        params: {
          url: `https://www.youtube.com/watch?v=${videoId}`,
          format: 'json',
        },
        timeout: 4000,
      });

      if (oembedRes.data) {
        return {
          videoId,
          title: oembedRes.data.title || `YouTube Video (${videoId})`,
          description: '',
          thumbnailUrl: oembedRes.data.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          channelId: '',
          channelTitle: oembedRes.data.author_name || 'YouTube Creator',
        };
      }
    } catch (oembedErr) {
      console.warn(`[YouTube Service] oEmbed query failed. Using standard thumbnail construction.`);
    }

    // Attempt 3: Standard YouTube thumbnail & placeholder info
    return {
      videoId,
      title: `YouTube Video (${videoId})`,
      description: 'Submitted YouTube Video Campaign',
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      channelId: '',
      channelTitle: 'YouTube Creator Channel',
    };
  }
}
