import axios, { type AxiosResponse } from "axios";

export default class NewAppApi {
    private readonly api;
    constructor() {
        this.api = axios.create({ baseURL: import.meta.env.VITE_BACKEND_NEW_APP });
    }
    public async get<T = any>(endpoint: string, params: any = {}): Promise<AxiosResponse<T>> {
        return this.api.get<T>(endpoint, { params });
    }

    public async post<T = any, D = any>(endpoint: string, data: D = {} as D): Promise<AxiosResponse<T>> {
        return this.api.post<T>(endpoint, { data });
    }

    public async put<T = any, D = any>(endpoint: string, data: D = {} as D): Promise<AxiosResponse<T>> {
        return this.api.put<T>(endpoint, { input: data });
    }

    public async patch<T = any, D = any>(endpoint: string, data: D = {} as D): Promise<AxiosResponse<T>> {
        return this.api.patch<T>(endpoint, { data });
    }

    public async delete<T = any>(endpoint: string, params: any = {}): Promise<AxiosResponse<T>> {
        return this.api.delete<T>(endpoint, { params });
    }


}