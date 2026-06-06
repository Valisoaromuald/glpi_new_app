import { glpiApi } from "../api/GlpiApi";

export function useAxios() {
    return {
        glpiApi, // Ton instance partagée
    };
}