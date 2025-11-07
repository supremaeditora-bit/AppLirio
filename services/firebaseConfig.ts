// Este arquivo substitui o antigo 'supabaseClient.ts'
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Substitua este objeto pela configuração do seu próprio projeto Firebase
// Você pode obter isso no console do Firebase em:
// Configurações do projeto > Geral > Seus aplicativos > SDK setup and configuration
const firebaseConfig = {
  apiKey: "AIzaSyAEj59ajzsnTscBrs4dZs5gpe3DzdX-4k8",
  authDomain: "appfelv.firebaseapp.com",
  projectId: "appfelv",
  storageBucket: "appfelv.firebasestorage.app",
  messagingSenderId: "824899442097",
  appId: "1:824899442097:web:bcbef5c4964a7727079990"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta os serviços do Firebase para serem usados em todo o aplicativo
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);