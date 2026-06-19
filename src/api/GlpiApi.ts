// src/api/GlpiApi.ts
import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { useRedirect } from "../composables/useRedirect";
import { useGlpiScope } from "../composables/useGlpiScope";

/**
 * ============================================================
 *  GLPI API — Support v1 (Legacy /apirest.php) + v2 (/api.php/v2)
 *
 *  v2  → lecture avec filtres RSQL, GraphQL, Assets standards
 *  v1  → types absents de v2 (Cable, Cartridge…), écriture,
 *         liste exhaustive des itemtypes
 *
 *  Auth :
 *   - v2 utilise Bearer token (OAuth2)
 *   - v1 utilise session_token (obtenu via initSessionV1)
 * ============================================================
 */



class GlpiApi {
    // ── Instances Axios ──────────────────────────────────────
    private apiV2: AxiosInstance;  // Bearer token  →  /api.php/v2
    private apiV1: AxiosInstance;  // session_token →  /apirest.php

    // ── Config ───────────────────────────────────────────────
    private baseUrlV2 = import.meta.env.VITE_GLPI_BASE_URL_V2;   // ex: https://glpi.example.com/api.php/v2
    private baseUrlV1 = import.meta.env.VITE_GLPI_BASE_URL_V1;   // ex: https://glpi.example.com/apirest.php
    private clientId = import.meta.env.VITE_CLIENT_ID;
    private clientSecret = import.meta.env.VITE_CLIENT_SECRET;
    private appToken = import.meta.env.VITE_GLPI_APP_TOKEN;     // App-Token requis par la v1

    // ── État session v1 ──────────────────────────────────────
    private sessionTokenV1: string | null = null;

    constructor() {
        this.apiV2 = axios.create({ baseURL: this.baseUrlV2 });
        this.apiV1 = axios.create({ baseURL: this.baseUrlV1 });

        this.initInterceptorsV2();
        this.initInterceptorsV1();
    }

    // ════════════════════════════════════════════════════════
    //  INTERCEPTEURS V2  (Bearer / OAuth2)
    // ════════════════════════════════════════════════════════
    private initInterceptorsV2() {
        this.apiV2.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                const token = localStorage.getItem("access_token");
                if (token && config.headers) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        this.apiV2.interceptors.response.use(
            (response: AxiosResponse) => response,
            async (error) => {
                const originalRequest = error.config;
                const status = error.response?.status;
                const { to } = useRedirect();

                if (status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    try {
                        const newToken = await this.refreshMyToken();
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        }
                        return this.apiV2(originalRequest);
                    } catch (refreshError) {
                        console.error("Refresh token échoué (v2), reconnexion requise.", refreshError);
                        localStorage.removeItem("access_token");
                        localStorage.removeItem("refresh_token");
                        to("/backoffice/login");
                        return Promise.reject(refreshError);
                    }
                }

                if (status === 403) {
                    console.warn("Accès interdit (v2) - Droits insuffisants");
                    // window.location.href = "/backoffice/403";
                    return Promise.reject(error);
                }

                if (status === 400) {
                    console.error("Erreur 400 (v2)");
                    to("/backoffice/login");
                }

                return Promise.reject(error);
            }
        );
    }

    // ════════════════════════════════════════════════════════
    //  INTERCEPTEURS V1  (session_token)
    // ════════════════════════════════════════════════════════
    private initInterceptorsV1() {
        this.apiV1.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                const sessionToken = localStorage.getItem("session_token");

                if (config.headers) {
                    // Correction : GLPI attend "Session-Token"
                    if (sessionToken) {
                        config.headers["Session-Token"] = sessionToken;
                    }
                    // Correction : GLPI attend "App-Token"
                    if (this.appToken) {
                        config.headers["app_token"] = this.appToken;
                    }
                    if (!(config.data instanceof FormData)) {
                        config.headers["Content-Type"] = "application/json";
                    }
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        this.apiV1.interceptors.response.use(
            (response: AxiosResponse) => response,
            async (error) => {
                const originalRequest = error.config;
                const status = error.response?.status;

                // GLPI renvoie parfois un statut 200 ou 400 avec le message d'erreur dans les données
                // au lieu d'un vrai statut HTTP 401. Sécurisons la détection :
                const isSessionMissing = error.response?.data &&
                    Array.isArray(error.response.data) &&
                    error.response.data[0] === "ERROR_SESSION_TOKEN_MISSING";

                // Session v1 expirée ou manquante → on la renouvelle automatiquement
                if ((status === 401 || isSessionMissing) && !originalRequest._retryV1) {
                    originalRequest._retryV1 = true;
                    try {
                        console.info("[GlpiApi] Session manquante ou expirée. Tentative de renouvellement...");

                        const username = import.meta.env.VITE_GLPI_USERNAME;
                        const password = import.meta.env.VITE_GLPI_PASSWORD;

                        // On recrée la session
                        await this.initSessionV1(username, password);

                        // On applique le nouveau token à la requête qui avait échoué
                        if (originalRequest.headers) {
                            originalRequest.headers["Session-Token"] = localStorage.getItem("session_token");
                        }

                        // On rejoue la requête initiale
                        return this.apiV1(originalRequest);
                    } catch (sessionError) {
                        console.error("Impossible de renouveler la session v1.", sessionError);
                        return Promise.reject(sessionError);
                    }
                }

                return Promise.reject(error);
            }
        );
    }
    // ════════════════════════════════════════════════════════
    //  GESTION DE SESSION V1
    // ════════════════════════════════════════════════════════

    /**
     * Ouvre une session v1 à partir du Bearer token OAuth2 courant.
     * À appeler une fois au démarrage de l'app (ou après login).
     */
    public async initSessionV1(username: string, password: string): Promise<void> {
        const credentials = btoa(`${username}:${password}`);
        const response = await axios.get(`${this.baseUrlV1}/initSession`, {
            headers: {
                Authorization: `Basic ${credentials}`,
                "app_token": this.appToken,
            },
        });

        this.sessionTokenV1 = response.data.session_token;
        localStorage.setItem("session_token", this.sessionTokenV1 ?? '');
        console.info("[GlpiApi] Session v1 initiée.");
        this.apiV1.defaults.headers.common["Session-Token"] = localStorage.getItem("session_token");
    }

    /**
     * Ferme la session v1 proprement (bonne pratique à l'appeler au logout).
     */
    public async killSessionV1(): Promise<void> {
        if (!this.sessionTokenV1) return;
        try {
            await this.apiV1.get("/killSession");
        } finally {
            this.sessionTokenV1 = null;
        }
    }

    // ════════════════════════════════════════════════════════
    //  REFRESH TOKEN (OAuth2 — inchangé)
    // ════════════════════════════════════════════════════════
    private async refreshMyToken(): Promise<string> {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) throw new Error("Aucun refresh token disponible.");

        const { glpiScopes } = useGlpiScope();
        const params = new URLSearchParams();
        params.append("grant_type", "refresh_token");
        params.append("refresh_token", refreshToken);
        params.append("client_id", this.clientId);
        params.append("client_secret", this.clientSecret);
        params.append("scope", glpiScopes);

        const response = await axios.post(`${this.baseUrlV2}/token`, params, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        const newAccessToken = response.data.access_token.trim();
        localStorage.setItem("access_token", newAccessToken);
        if (response.data.refresh_token) {
            localStorage.setItem("refresh_token", response.data.refresh_token.trim());
        }

        // On profite du refresh pour renouveler la session v1 aussi
        const username = import.meta.env.VITE_GLPI_USERNAME;
        const password = import.meta.env.VITE_GLPI_PASSWORD;
        await this.initSessionV1(username, password);

        return newAccessToken;
    }

    // ════════════════════════════════════════════════════════
    //  GRAPHQL  (v2 uniquement)    
    // ════════════════════════════════════════════════════════
    public async graphql<T = any>(query: string, variables: Record<string, any> = {}): Promise<T> {
        try {
            const response = await this.apiV2.post("/graphql", { query, variables });
            const result = response.data;
            if (result.errors) {
                console.error("Erreurs GraphQL :", result.errors);
                throw new Error(result.errors[0].message || "Erreur GraphQL");
            }
            return result.data as T;
        } catch (error) {
            console.error("Erreur requête GraphQL :", error);
            throw error;
        }
    }

    // ════════════════════════════════════════════════════════
    //  MÉTHODES V2  (Bearer token)
    // ════════════════════════════════════════════════════════
    public async get<T = any>(endpoint: string, params: any = {}): Promise<AxiosResponse<T>> {
        return this.apiV2.get<T>(endpoint, { params });
    }

    public async post<T = any>(endpoint: string, data: any = {}): Promise<AxiosResponse<T>> {
        return this.apiV2.post<T>(endpoint, { input: data });
    }

    public async put<T = any>(endpoint: string, data: any = {}): Promise<AxiosResponse<T>> {
        return this.apiV2.put<T>(endpoint, { input: data });
    }

    public async    patch<T = any>(endpoint: string, data: any = {}): Promise<AxiosResponse<T>> {
        return this.apiV2.patch<T>(endpoint, { input: data });
    }

    public async delete<T = any>(endpoint: string, params: any = {}): Promise<AxiosResponse<T>> {
        return this.apiV2.delete<T>(endpoint, { params });
    }

    // ════════════════════════════════════════════════════════
    //  MÉTHODES V1  (session_token)
    // ════════════════════════════════════════════════════════

    public async getV1<T = any>(endpoint: string, params: any = {}): Promise<AxiosResponse<T>> {

        return this.apiV1.get<T>(endpoint, { params });
    }
    public async postV1Raw<T = any>(endpoint: string, formData: FormData): Promise<AxiosResponse<T>> {
        return this.apiV1.post<T>(endpoint, formData)
    }
    public async postV1<T = any>(endpoint: string, data: any = {}): Promise<AxiosResponse<T>> {
        // FormData → envoi direct, sans envelopper dans input ni sérialiser
        if (data instanceof FormData) {
            return this.apiV1.post<T>(endpoint, data)
        }

        // JSON classique → enveloppe dans input comme avant
        let realInput = {}
        if (data.input) {
            realInput = { input: data.input }
        } else {
            realInput = { input: data }
        }
        return this.apiV1.post<T>(endpoint, realInput)
    }

    public async putV1<T = any>(endpoint: string, data: any = {}): Promise<AxiosResponse<T>> {
        return this.apiV1.put<T>(endpoint, { input: data });
    }

    public async patchV1<T = any>(endpoint: string, data: any = {}): Promise<AxiosResponse<T>> {
        return this.apiV1.patch<T>(endpoint, { input: data });
    }

    public async deleteV1<T = any>(endpoint: string, params: any = {}): Promise<AxiosResponse<T>> {
        return this.apiV1.delete<T>(endpoint, { params });
    }
}


// Exportation d'une instance UNIQUE (Singleton)
export const glpiApi = new GlpiApi();