import { useRouter } from "vue-router";

export function useRedirect(){
    const router = useRouter()
    const to = (path:string) =>{
        if(path){
            router.push(path)
        }
    }
    return {
        to
    }
    
}