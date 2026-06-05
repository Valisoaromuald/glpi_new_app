import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { useRedirect } from "./useRedirect";
import { useGlpiScope } from "./useGlpiScope";

export function useAxiosInterceptor() {
    const baseUrl = import.meta.env.VITE_GLPI_BASE_URL;
    const clientId = import.meta.env.VITE_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_CLIENT_SECRET;

    // 1. Création d'une instance Axios dédiée à GLPI
    const apiGLPI = axios.create({
        baseURL: baseUrl,
    });
    const { glpiScopes } = useGlpiScope();
    const { to } = useRedirect();

    // Fonction interne pour rafraîchir le token
    async function refreshMyToken(): Promise<string> {
        const refreshToken = localStorage.getItem("refresh_token");

        if (!refreshToken) {
            throw new Error("Aucun refresh token disponible dans le stockage.");
        }

        const params = new URLSearchParams();
        params.append("grant_type", "refresh_token");
        params.append("refresh_token", refreshToken);
        params.append("client_id", clientId);
        params.append("client_secret", clientSecret);
        params.append('scope', glpiScopes);

        // On utilise l'instance globale 'axios' ici pour éviter une boucle infinie
        const response = await axios.post(`${baseUrl}/token`, params, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        console.log("mankato eeee:{kjl;kjlkj}")
        const newAccessToken = response.data.access_token.trim();
        localStorage.setItem("access_token", newAccessToken);

        // Si l'API renvoie aussi un nouveau refresh_token, on le met à jour
        if (response.data.refresh_token) {
            localStorage.setItem("refresh_token", response.data.refresh_token.trim());
        }

        return newAccessToken;
    }

    // 2. INTERCEPTEUR DES REQUÊTES (Ajout automatique du Token)
    apiGLPI.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
            const token = localStorage.getItem("access_token");
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    // 3. INTERCEPTEUR DES RÉPONSES (Gestion de l'expiration / 401)
    apiGLPI.interceptors.response.use(
        (response: AxiosResponse) => response,
        async (error) => {
            const originalRequest = error.config;
            const status = error.response?.status;

            // Si l'erreur est un 401 (Non autorisé/Expiré) et qu'on n'a pas déjà tenté un retry
            if (status === 401 && !originalRequest._retry) {
                originalRequest._retry = true; // On marque la requête pour ne pas boucler en boucle

                try {
                    // On tente de récupérer un nouveau token
                    const newAccessToken = await refreshMyToken();

                    // On met à jour l'en-tête de la requête initiale défaillante
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    }

                    // On rejoue la requête initiale avec le nouveau token
                    return apiGLPI(originalRequest);
                } catch (refreshError) {
                    // Si même le rafraîchissement échoue (refresh token expiré ou invalide)
                    console.error("Le refresh token a échoué, reconnexion requise.", refreshError);

                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");

                    // // Exemple de redirection (à adapter selon votre routeur, ex: router.push('/login'))
                    to('/backoffice/login')

                    return Promise.reject(refreshError);
                }
            }
            if (status === 403) {
                // L'utilisateur est connecté, mais n'a pas le droit d'être ici
                console.warn("Accès interdit - Droits insuffisants");
                // Option A : Tu l'envoies sur une page 403 spécifique
                window.location.href = "/backoffice/403";
                return Promise.reject(error);
            }
            if (status === 400) {
                // Mauvaise requête (ex: paramètres manquants)
                console.error("Une erreur 400 est survenue (Bad Request)");
                to('/backoffice/login')
            }

            return Promise.reject(error);
        }
    );

    // On retourne l'instance configurée pour pouvoir l'utiliser partout
    return {
        apiGLPI,
    };
}