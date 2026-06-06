export class GraphQlService {
  private endpoint: string;
  private token: string | null;

  constructor(endpoint: string, token: string | null = null) {
    this.endpoint = endpoint; // Exemple: 'http://ton-serveur/graphql'
    this.token = token;       // Ton jeton d'authentification (si nécessaire)
  }

  /**
   * Modifie ou définit le jeton d'authentification dynamiquement
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * Méthode générique pour envoyer une requête (Query ou Mutation) au serveur GraphQL
   * @param query La chaîne de caractères contenant la requête GraphQL
   * @param variables Les variables optionnelles associées à la requête
   */
  async send<T = any>(query: string, variables: Record<string, any> = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Ajout du token Bearer si présent
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST', // GraphQL utilise TOUJOURS du POST
        headers: headers,
        body: JSON.stringify({
          query: query,
          variables: variables,
        }),
      });

      const result = await response.json();

      // Gestion des erreurs spécifiques renvoyées par GraphQL
      if (result.errors) {
        console.error('Erreurs GraphQL détectées :', result.errors);
        throw new Error(result.errors[0].message || 'Erreur GraphQL');
      }

      // Retourne uniquement la propriété 'data' qui contient les résultats
      return result.data as T;
    } catch (error) {
      console.error('Erreur réseau ou HTTP lors de la requête GraphQL :', error);
      throw error;
    }
  }
}