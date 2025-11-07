import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebaseConfig';

/**
 * Uploads an audio file (MP3 or recorded blob) to Firebase Storage.
 * 
 * @param file The audio file (File or Blob) to upload.
 * @param userId The ID of the user uploading the file, for path organization.
 * @param onProgress A callback function to track upload progress (0-100).
 * @returns A promise that resolves with the public download URL of the uploaded file.
 */
export const uploadAudio = (
    file: File | Blob, 
    userId: string, 
    onProgress: (progress: number) => void
): Promise<string> => {
    return new Promise((resolve, reject) => {
        // Use a unique name for the file to avoid overwrites
        const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.mp3`;
        const storageRef = ref(storage, `podcasts/${fileName}`);
        
        const uploadTask = uploadBytesResumable(storageRef, file, {
            contentType: 'audio/mpeg',
        });

        uploadTask.on('state_changed', 
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                onProgress(progress);
            }, 
            (error) => {
                console.error("Upload failed:", error);
                reject(error);
            }, 
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL);
                });
            }
        );
    });
};

/**
 * Uploads an image file to Firebase Storage.
 * 
 * @param file The image file to upload.
 * @param userId The ID of the user uploading the file, for path organization.
 * @param onProgress A callback function to track upload progress (0-100).
 * @returns A promise that resolves with the public download URL of the uploaded file.
 */
export const uploadImage = (
    file: File, 
    userId: string, 
    onProgress: (progress: number) => void
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const fileExtension = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
        const storageRef = ref(storage, `images/${fileName}`);
        
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed', 
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                onProgress(progress);
            }, 
            (error) => {
                console.error("Image upload failed:", error);
                reject(error);
            }, 
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL);
                });
            }
        );
    });
};