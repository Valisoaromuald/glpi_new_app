// src/services/GlpiOAuthService.ts
import { glpiApi } from "@/api/GlpiApi";
import { useGlpiScope } from "@/composables/useGlpiScope";
import axios from "axios";

export default class GlpiOAuthService {

  async login(usernameStr: string, passwordStr: string) {
    try {
      const baseUrl = import.meta.env.VITE_GLPI_BASE_URL_V2;
      const clientId = import.meta.env.VITE_CLIENT_ID;
      const clientSecret = import.meta.env.VITE_CLIENT_SECRET;
      const { glpiScopes } = useGlpiScope();

      const params = new URLSearchParams();
      params.append("grant_type", "password");
      params.append("username", usernameStr);
      params.append("password", passwordStr);
      params.append("client_id", clientId);
      params.append("client_secret", clientSecret);
      params.append("scope", glpiScopes);

      const response = await axios.post(`${baseUrl}/token`, params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      const accessToken = response.data.access_token;
      const refreshToken = response.data.refresh_token;

      localStorage.setItem("access_token", accessToken);
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      }


      // ✅ Ouvre la session v1 juste après avoir obtenu le Bearer token,
      //    afin que les appels v1 (Cable, Cartridge, écriture…) soient prêts.
      await glpiApi.initSessionV1(usernameStr,passwordStr);
      return response.data;

    } catch (error) {
      console.error("Échec du login OAuth2 GLPI :", error);
      throw new Error("Échec du login OAuth2 GLPI");
    }
  }

  async logout() {
    // ✅ Ferme proprement la session v1 avant de vider le localStorage
    await glpiApi.killSessionV1();

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }
}