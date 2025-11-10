import { supabase } from './supabaseClient';

/**
 * Uploads an audio file (MP3 or recorded blob) to Supabase Storage.
 * 
 * @param file The audio file (File or Blob) to upload.
 * @param userId The ID of the user uploading the file, for path organization.
 * @param onProgress A callback function to track upload progress (0-100).
 * @returns A promise that resolves with the public download URL of the uploaded file.
 */
export const uploadAudio = async (
    file: File | Blob, 
    userId: string, 
    onProgress: (progress: number) => void
): Promise<string> => {
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.mp3`;
    const { data, error } = await supabase.storage
        .from('audio') // Assume um bucket público chamado 'audio'
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: 'audio/mpeg',
        });

    if (error) {
        console.error("Audio upload failed:", error);
        throw error;
    }

    const { data: { publicUrl } } = supabase.storage.from('audio').getPublicUrl(data.path);
    return publicUrl;
};

/**
 * Uploads an image file to Supabase Storage.
 * 
 * @param file The image file to upload.
 * @param userId The ID of the user uploading the file, for path organization.
 * @param onProgress A callback function to track upload progress (0-100).
 * @returns A promise that resolves with the public download URL of the uploaded file.
 */
export const uploadImage = async (
    file: File, 
    userId: string, 
    onProgress: (progress: number) => void
): Promise<string> => {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
    
    const { data, error } = await supabase.storage
        .from('images') // Assume um bucket público chamado 'images'
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (error) {
        console.error("Image upload failed:", error);
        throw error;
    }

    const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(data.path);
    return publicUrl;
};
