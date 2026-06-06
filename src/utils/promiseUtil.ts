export default class PromiseUtil {
    static buildPromises<T, R>(array: T[], fonction: (element: T) => Promise<R>): Promise<R>[] {
        // Si le tableau est vide, .map() retournera automatiquement []
        if (!array || array.length === 0) {
            return [];
        }

        // .map() transforme chaque élément en appelant la fonction et retourne le nouveau tableau de Promesses
        return array.map(element => fonction(element));
    }
}