import { glpiApi } from "@/api/GlpiApi";
import type { User } from "@/types/administration/user/user";
import PromiseUtil from "@/utils/promiseUtil";

export default class UserService {
    private readonly subEndPoint = 'User'
    private readonly endPointPrefix = `/Administration/${this.subEndPoint}`
    async getAllIdsDifferentFromDefaultIds(): Promise<number[]> {
        try {
            const endpoint = `query { User(filter: "id=gt=6") {id} }`;
            const response = await glpiApi.graphql<{ User: { id: number | string }[] }>(endpoint);
            if (response.User) {
                return response.User.map(user => Number(user.id));
            }
            return [];
        } catch (error) {
            // Le "throw error" dans un bloc catch simple est redondant, 
            // mais si tu prévois d'ajouter des logs ici, tu peux le laisser.
            throw error;
        }
    }

    async deleteById(id: number | string): Promise<void> {
        try {
            const endpoint = `${this.endPointPrefix}/${id}?force=1`
            const response = await glpiApi.delete(endpoint)
        } catch (error) {
            throw error;
        }
    }
    async deleteAll(): Promise<void> {
        const pas: number = 5;
        try {
            const ids: number[] = await this.getAllIdsDifferentFromDefaultIds();
            for (let i = 0; i < ids.length; i += pas) {
                const subIds: number[] = ids.slice(i, i + pas);
                const promises: Promise<void>[] = PromiseUtil.buildPromises<number, void>(subIds, this.deleteById);
                await Promise.all(promises)
            }
        } catch (error) {
            throw error;
        }
    }
    static createObject(user: Partial<User>): Object {
        if (user.firstname ||  user.realname) {
            return {
                name: UserService.getName(user.realname?? '',user.firstname?? ''),
                realname: user.realname,
                firstname: user.firstname,
                password: "glpi",
            }
        }
        return {}
    }
    static getName(realname:string,firstname:string): string {
        const name = '';
        if(!realname && firstname){
            return firstname.toLowerCase().trim()
        }
        else if(realname && !firstname){
            return realname.toLowerCase().trim()
        }
        else if (realname && firstname) {
            return `${firstname? firstname.toLowerCase().trim() :''}.${realname ? realname.toLowerCase().trim():''}`
        }
        return ''
    }

    async getAll(): Promise<Partial<User>[]> {
        let users: Partial<User>[] = []
        try {
            const response = await glpiApi.get('/Administration/User');
            if (response.data.length > 0) {
                users = response.data
            }

        } catch (error) {
            throw error;
        }
        return users
    }
}