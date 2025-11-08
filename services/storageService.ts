import { supabase } from './supabaseClient';

const BUCKETS = {
    AUDIO: 'audios',
    IMAGES: 'images',
};

export const uploadAudio = (
    file: File | Blob, 
    userId: string, 
    onProgress: (progress: number) => void
): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.mp3`;
        
        const { data, error } = await supabase.storage
            .from(BUCKETS.AUDIO)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false,
                contentType: 'audio/mpeg',
            });

        if (error) {
            console.error("Audio upload failed:", error);
            return reject(error);
        }

        const { data: { publicUrl } } = supabase.storage
            .from(BUCKETS.AUDIO)
            .getPublicUrl(data.path);

        resolve(publicUrl);
    });
};


export const uploadImage = (
    file: File, 
    userId: string, 
    onProgress: (progress: number) => void
): Promise<string> => {
     return new Promise(async (resolve, reject) => {
        const fileExtension = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
        
        const { data, error } = await supabase.storage
            .from(BUCKETS.IMAGES)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (error) {
            console.error("Image upload failed:", error);
            return reject(error);
        }

        const { data: { publicUrl } } = supabase.storage
            .from(BUCKETS.IMAGES)
            .getPublicUrl(data.path);

        resolve(publicUrl);
    });
};
