import { readonly } from 'vue';

export function useGlpiScope() {
  // 1. Définition de la liste des scopes requis par l'application
  const requiredScopes = [
    'email', 
    'user',     
    'inventory',
    'api',
    'status',
    'graphql'
  ] as const;

  // 2. Transformation en chaîne de caractères séparée par des espaces (format OAuth2)
  const formattedScopes = requiredScopes.join(' ');

  return {
    // On utilise readonly pour s'assurer que personne ne modifie les scopes par accident dans l'application
    scopesList: readonly(requiredScopes),
    glpiScopes: formattedScopes,
  };
}