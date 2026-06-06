import { glpiApi } from "@/api/GlpiApi"

export default class AssetService{
    async getTotalByElementName(elementName:string):Promise<number>{
        try {
            if(elementName){
                const response = await glpiApi.get(`/Assets/${elementName}`);
                const contentRange = response.headers['content-range'];
                if(contentRange){
                    const totalElements = contentRange ? parseInt(contentRange.split('/')[1], 10) : 0;
                    return totalElements
                }
                return 0;
            }
            else{
                throw new Error("veuillez specifier le nom de l'element avant d'utiliser getTotalByElementName")
            }
            
        } catch (error) {
            throw error;
        }
    }
}