
import StateService from "../dropdowns/stateService";
import type { CsvResult, CsvRow } from "./fileService"

export default class ImportService{
    private readonly stateService:StateService;
    constructor(){
        this.stateService = new StateService()
    }
    getAllStates(csv:CsvResult):string[]{
        let results  : string[] =[]
        if(!csv){
            throw new Error("csv indefini")
        }
        let rows : CsvRow[] = csv.rows
        if(rows && rows.length !== 0){
            for(let row of rows){
                if(row["Status"]){
                    results.push(row["Status"].trim())
                }
            }
        }
        else{
            throw new Error("le fichier ne contient aucune ligne")
        }
        return this.removeDuplicates(results)
    }
    removeDuplicates(stringArray:string[]) : string[]{
        const treated :string[] = []
        for(let value of stringArray){
            if(!treated.includes(value)){
                treated.push(value)
            }
        }
        return treated
    }
    async importAllStates(csv:CsvResult){
        let states : string[] = this.getAllStates(csv)
        try {
            for(let state of states){
                
            }
        } catch (error) {
           throw error; 
        } 
    }
}