import { useGlpiScope } from "@/composables/useGlpiScope";
import axios from "axios";

export default class GlpiOAuthService {
  async login(usernameStr: string, passwordStr: string) {
    try {
      const baseUrl = import.meta.env.VITE_GLPI_BASE_URL;
      const clientId = import.meta.env.VITE_CLIENT_ID;
      const clientSecret = import.meta.env.VITE_CLIENT_SECRET;
      const { glpiScopes } = useGlpiScope();
      const params = new URLSearchParams();
      params.append('grant_type', 'password');
      params.append('username', usernameStr);
      params.append('password', passwordStr);

      // On passe le client ID et Secret DIRECTEMENT dans le body ici :
      params.append('client_id', clientId);
      params.append('client_secret', clientSecret);
      params.append('scope', glpiScopes);
      const response = await axios.post(`${baseUrl}/token`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
          // On n'envoie pas d'en-tête Authorization ici pour éviter le conflit !
        }
      });

      const accessToken = response.data.access_token;
      const refreshToken = response.data.refresh_token;

      localStorage.setItem('access_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      };

      return response.data;
    } catch (error) {
      console.error("Échec du login OAuth2 GLPI :", error);
      throw new Error("Échec du login OAuth2 GLPI");
    }
  }
  logout(){
    const acces_token = localStorage.getItem('access_token');
    const refresh_token = localStorage.getItem('refresh_token')
    if(acces_token){
      localStorage.removeItem('access_token')
    }
    if(refresh_token){
      localStorage.removeItem('refresh_token')
    }
  }
};