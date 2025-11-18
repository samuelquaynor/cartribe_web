import { apiClient } from './api';

export interface UploadResult {
    key: string;
    url?: string;
    size: number;
    content_type: string;
}

/**
 * Upload a file to the server
 */
export const uploadFile = async (file: File): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<any>('/media/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    if (response.data.success && response.data.data) {
        return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to upload file');
};

/**
 * Delete a file from the server
 */
export const deleteFile = async (key: string): Promise<void> => {
    await apiClient.delete(`/media/${encodeURIComponent(key)}`);
};

/**
 * Get a presigned URL for a file
 */
export const getFileURL = async (key: string): Promise<string> => {
    const response = await apiClient.get<{ data: { url: string } }>(`/media/url?key=${encodeURIComponent(key)}`);
    return response.data.data.url;
};

