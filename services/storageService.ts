
import { supabase } from './supabaseClient';

/**
 * Handles Supabase storage errors by logging them and throwing a more informative,
 * user-friendly error message.
 * @param error The original error object from Supabase.
 * @param context A string describing the operation (e.g., "Audio upload").
 */
function handleStorageError(error: any, context: string) {
    console.error(`${context} failed:`, error);
    let message = `Falha no upload: ${error.message || 'Erro desconhecido.'}`;
    
    if (error.message?.includes("Bucket not found")) {
        message = `Falha no upload (${context}): O bucket de armazenamento não foi encontrado. AÇÃO NECESSÁRIA: Crie o bucket no seu painel Supabase.`;
    } else if (error.message?.includes("permission denied")) {
        message = `Falha no upload (${context}): Permissão negada. Verifique as políticas de segurança (RLS) do bucket no Supabase Storage.`;
    }
    
    throw new Error(message);
}

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
    // Determine file extension from mime type for robustness
    let extension = 'mp3'; // default
    if (file.type.includes('webm')) {
        extension = 'webm';
    } else if (file.type.includes('wav')) {
        extension = 'wav';
    }
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`;

    const { data, error } = await supabase.storage
        .from('audio') // Assume um bucket público chamado 'audio'
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type, // Use the file's mime type
        });

    if (error) {
        handleStorageError(error, "Audio upload");
    }
    
    // data is guaranteed to exist if there's no error
    const { data: { publicUrl } } = supabase.storage.from('audio').getPublicUrl(data!.path);
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
            contentType: file.type, // Explicitly set content type
        });

    if (error) {
       handleStorageError(error, "Image upload");
    }

    // data is guaranteed to exist if there's no error
    const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(data!.path);
    return publicUrl;
};
