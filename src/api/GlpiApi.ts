// src/api/GlpiApi.ts
import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { useRedirect } from "../composables/useRedirect"; // À importer ou adapter selon ton routeur
import { useGlpiScope } from "../composables/useGlpiScope";

class GlpiApi {
    private api: AxiosInstance;
    private baseUrl = import.meta.env.VITE_GLPI_BASE_URL;
    private clientId = import.meta.env.VITE_CLIENT_ID;
    private clientSecret = import.meta.env.VITE_CLIENT_SECRET;

    constructor() {
        this.api = axios.create({
            baseURL: this.baseUrl,
        });

        this.initInterceptors();
    }
    /**
     * Configuration des intercepteurs de requêtes et réponses
     */
    private initInterceptors() {
        // 1. INTERCEPTEUR DES REQUÊTES (Ajout du Bearer Token)
        this.api.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                const token = localStorage.getItem("access_token");
                if (token && config.headers) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // 2. INTERCEPTEUR DES RÉPONSES (Gestion du Refresh Token & Erreurs)
        this.api.interceptors.response.use(
            (response: AxiosResponse) => response,
            async (error) => {
                const originalRequest = error.config;
                const status = error.response?.status;
                const { to } = useRedirect();

                // Gestion du 401 (Token expiré)
                if (status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        const newAccessToken = await this.refreshMyToken();
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        }
                        return this.api(originalRequest); // Rejoue la requête initiale
                    } catch (refreshError) {
                        console.error("Le refresh token a échoué, reconnexion requise.", refreshError);
                        localStorage.removeItem("access_token");
                        localStorage.removeItem("refresh_token");
                        to('/backoffice/login');
                        return Promise.reject(refreshError);
                    }
                }

                // Gestion du 403 (Interdit)
                if (status === 403) {
                    console.warn("Accès interdit - Droits insuffisants");
                    window.location.href = "/backoffice/403";
                    return Promise.reject(error);
                }

                // Gestion du 400 (Bad Request)
                if (status === 400) {
                    console.error("Une erreur 400 est survenue");
                    to('/backoffice/login');
                }

                return Promise.reject(error);
            }
        );
    }

    /**
     * Logique de rafraîchissement du Token
     */
    private async refreshMyToken(): Promise<string> {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) throw new Error("Aucun refresh token disponible.");

        const { glpiScopes } = useGlpiScope();

        const params = new URLSearchParams();
        params.append("grant_type", "refresh_token");
        params.append("refresh_token", refreshToken);
        params.append("client_id", this.clientId);
        params.append("client_secret", this.clientSecret);
        params.append('scope', glpiScopes);

        // Utilisation d'un axios vierge global pour éviter la boucle infinie d'intercepteurs
        const response = await axios.post(`${this.baseUrl}/token`, params, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        const newAccessToken = response.data.access_token.trim();
        localStorage.setItem("access_token", newAccessToken);

        if (response.data.refresh_token) {
            localStorage.setItem("refresh_token", response.data.refresh_token.trim());
        }

        return newAccessToken;
    }

    /**
     * ==========================================
     * MÉTHODE GRAPHQL INTÉGRÉE
     * ==========================================
     * @param query La chaîne de caractères contenant la requête GraphQL
     * @param variables Les variables optionnelles associées à la requête
     */
    public async graphql<T = any>(query: string, variables: Record<string, any> = {}): Promise<T> {
        try {
            // On fait un POST sur l'endpoint /graphql en réutilisant l'instance "this.api" d'Axios.
            // Pas besoin d'ajouter les headers Authorization ici, l'intercepteur s'en charge !
            const response = await this.api.post('/graphql', {
                query: query,
                variables: variables
            });

            const result = response.data;

            // GraphQL renvoie un statut HTTP 200 même en cas d'erreur de syntaxe/schéma.
            // On inspecte donc la présence de la clé "errors" dans la réponse.
            if (result.errors) {
                console.error('Erreurs GraphQL détectées :', result.errors);
                throw new Error(result.errors[0].message || 'Erreur GraphQL');
            }

            // On retourne uniquement la clé 'data' attendue
            return result.data as T;
        } catch (error) {
            console.error('Erreur lors de la requête GraphQL :', error);
            throw error;
        }
    }

    /**
     * MÉTHODES HTTP ENVELOPPÉES (Wrappers)
     * GLPI demande l'encapsulation automatique dans { input: data } pour POST/PUT/PATCH
     */

    public async get<T = any>(endpoint: string, params: any = {}): Promise<AxiosResponse<T>> {
        return this.api.get<T>(endpoint, { params });
    }

    public async post<T = any>(endpoint: string, data: any = {}): Promise<AxiosResponse<T>> {
        // Encapsulation automatique dans "input" demandée par l'API REST GLPI
        return this.api.post<T>(endpoint, { input: data });
    }

    public async put<T = any>(endpoint: string, data: any = {}): Promise<AxiosResponse<T>> {
        return this.api.put<T>(endpoint, { input: data });
    }

    public async patch<T = any>(endpoint: string, data: any = {}): Promise<AxiosResponse<T>> {
        return this.api.patch<T>(endpoint, { input: data });
    }

    public async delete<T = any>(endpoint: string, params: any = {}): Promise<AxiosResponse<T>> {
        return this.api.delete<T>(endpoint, { params });
    }
}

// Exportation d'une instance UNIQUE (Singleton)
export const glpiApi = new GlpiApi();