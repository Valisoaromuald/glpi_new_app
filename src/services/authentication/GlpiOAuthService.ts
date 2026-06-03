import axios from "axios";

export default class GlpiOAuthService {
  async login(usernameStr: string, passwordStr: string) {
    try {
      const baseUrl = import.meta.env.VITE_GLPI_BASE_URL;
      const clientId = import.meta.env.VITE_CLIENT_ID;
      const clientSecret = import.meta.env.VITE_CLIENT_SECRET;

      const params = new URLSearchParams();
      params.append('grant_type', 'password');
      params.append('username', usernameStr);
      params.append('password', passwordStr);
      
      // On passe le client ID et Secret DIRECTEMENT dans le body ici :
      params.append('client_id', clientId);
      params.append('client_secret', clientSecret);

      const response = await axios.post(`${baseUrl}/token`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
          // On n'envoie pas d'en-tête Authorization ici pour éviter le conflit !
        }
      });

      console.log("Connexion réussie !", response.data);
      return response.data;
    } catch (error) {
      console.error("Échec du login OAuth2 GLPI :", error);
      throw new Error("Échec du login OAuth2 GLPI");
    }
  }
};