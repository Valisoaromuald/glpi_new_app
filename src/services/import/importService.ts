
import { glpiApi } from "@/api/GlpiApi";
import StateService from "../dropdowns/stateService";
import type { CsvResult, CsvRow } from "./fileService"

import type { Manufacturer } from "@/types/dropdowns/manufacturer";
import LocationService from "../dropdowns/locationService";
import ManufacturerService from "../management/manufacturerService";
import type { Location } from "@/types/dropdowns/location";
import type { State } from "@/types/dropdowns/state";
import type { User } from "@/types/administration/user/user";
import type { AssetModel } from "@/types/asset/assetModel";
import AssetService from "../assets/assetService";
import UserService from "../administration/userService";
import type { AssetType } from "@/types/asset/assetType";
import ComputerService from "../assets/computerService";
import type { Computer } from "@/types/asset/computer";

export default class ImportService {
    getAllByHeader(csv: CsvResult, header: string): string[] {
        let headers: string[] = csv.headers
        if (!headers.includes(header)) {
            throw new Error("l'entete " + header + "n'est pas inclus dans la liste des entetes [" + headers.join(",") + "]")
        }
        let results: string[] = []
        if (!csv) {
            throw new Error("csv indefini")
        }
        let rows: CsvRow[] = csv.rows
        if (rows && rows.length !== 0) {
            for (let row of rows) {
                if (row[header]) {
                    results.push(row[header].trim())
                }
            }
        }
        else {
            throw new Error("le fichier ne contient aucune ligne")
        }
        return this.removeDuplicates(results)
    }

    removeDuplicates(stringArray: string[]): string[] {
        const treated: string[] = []
        for (let value of stringArray) {
            if (!treated.includes(value)) {
                treated.push(value)
            }
        }
        return treated
    }
    async importStates(csv: CsvResult): Promise<Partial<State>[]> {
        let states: string[] = this.getAllByHeader(csv, "Status")
        let results: Partial<State>[] = []

        try {
            for (let state of states) {
                let object: Object = StateService.createObject(state)
                if (Object.keys(object).length !== 0) {
                    let result = await glpiApi.postV1('/State', object)
                    let res = {
                        state: state,
                        id: result.data.id
                    }
                    results.push(res)
                }
            }
        } catch (error) {
            throw error;
        }
        return results
    }

    async importLocations(csv: CsvResult): Promise<Partial<Location>[]> {
        let locations: string[] = this.getAllByHeader(csv, "Location")
        let results: Partial<Location>[] = []

        try {
            for (let location of locations) {
                let object: Object = LocationService.createObject(location)
                if (Object.keys(object).length !== 0) {
                    let result = await glpiApi.postV1('/Location', object)
                    let res = {
                        name: location,
                        id: result.data.id
                    }
                    results.push(res)
                }
            }
        } catch (error) {
            throw error;
        }
        return results
    }
    async importManufacturers(csv: CsvResult): Promise<Partial<Manufacturer>[]> {
        let states: string[] = this.getAllByHeader(csv, "Manufacturer")
        let results: Partial<Manufacturer>[] = []

        try {
            for (let manufacturer of states) {
                let object: Object = ManufacturerService.createObject(manufacturer)
                if (Object.keys(object).length !== 0) {
                    let result = await glpiApi.postV1('/Manufacturer', object)
                    let res = {
                        name: manufacturer,
                        id: result.data.id
                    }
                    results.push(res)
                }
            }
        } catch (error) {
            throw error;
        }
        return results
    }

    async importUsers(csv: CsvResult): Promise<Partial<User>[]> {
        let users: string[] = this.getAllByHeader(csv, "User")
        let results: Partial<Manufacturer>[] = []

        try {
            for (let user of users) {
                let names = user.split(" ")
                let usr: Partial<User> = {
                    realname: names[1]?.trim(),
                    firstname: names[0]?.trim()
                }
                let object: Object = UserService.createObject(usr)
                if (Object.keys(object).length !== 0) {
                    let result = await glpiApi.postV1('/User', object)
                    let res = {
                        name: user,
                        id: result.data.id
                    }
                    results.push(res)
                }
            }
        } catch (error) {
            throw error;
        }
        return results
    }

    async importModels(csv: CsvResult): Promise<Partial<AssetModel>[]> {
        let models: string[] = this.getAllByHeader(csv, "Model")
        let results: Partial<Manufacturer>[] = []
        let rows: CsvRow[] = csv.rows
        try {
            for (let i = 0; i < models.length; i++) {

                if (rows[i]) {
                    const row = rows[i]
                    if (row && row["Item_Type"]) {
                        let mdl: Partial<AssetModel> = {
                            name: models[i]
                        }
                        let object: Object = AssetService.createModelObject(mdl, row["Item_Type"])
                        if (Object.keys(object).length !== 0) {
                            let result = await glpiApi.postV1(`/${row["Item_Type"]}Model`, object)
                            let assetModel = {
                                name: models[i],
                                id: result.data.id,
                            }
                            results.push(assetModel)
                        }
                    }
                }
            }
        } catch (error) {
            throw error;
        }
        return results
    }


    getRelevantState(states: Partial<State>[], stateName: string): Partial<State> {
        for (let state of states) {
            if (state.name === stateName) {
                return state
            }
        }
        return {}
    }
    getRelevantLocation(locations: Partial<Location>[], locationName: string): Partial<Location> {
        for (let location of locations) {
            if (location.name === locationName) {
                return location
            }
        }
        return {}
    }
    getRelevantManfacturer(manufacturers: Partial<Manufacturer>[], manufacturerName: string): Partial<Manufacturer> {
        for (let manufacturer of manufacturers) {
            if (manufacturer.name === manufacturerName) {
                return manufacturer
            }
        }
        return {}
    }
    getRelevantUser(users: Partial<User>[], realName: string, firstName: string): Partial<User> {
        for (let user of users) {
            if (user.realname === realName && user.firstname === firstName) {
                return user
            }
        }
        return {}
    }
    getRelevantModel(assetModels: Partial<AssetModel>[], modelName: string): Partial<AssetModel> {
        for (let assetModel of assetModels) {
            if (assetModel.name === modelName) {
                return assetModel
            }
        }
        return {}
    }

    async importFromFirstFile(csv: CsvResult): Promise<string> {
        let message: string = '';
        try {
            let states: Partial<State>[] = await this.importStates(csv)
            let locations: Partial<Location>[] = await this.importLocations(csv)
            let manufacturers: Partial<Manufacturer>[] = await this.importManufacturers(csv)
            let models: Partial<AssetModel>[] = await this.importModels(csv);
            let users: Partial<User>[] = await this.importUsers(csv);
            let rows: CsvRow[] = csv.rows;
            for (let row of rows) {

                let state = this.getRelevantState(states, row["Status"] ?? '')
                let location = this.getRelevantLocation(locations, row["Location"] ?? '')
                let manufacturer = this.getRelevantManfacturer(manufacturers, row["Manufacturer"] ?? '')
                let model = this.getRelevantModel(models, row["Model"] ?? '')
                let names: string[] = row["User"]?.split(" ") ?? [];
                let user: Partial<User> = {}
                if (names.length !== 0) {
                    let user = this.getRelevantUser(users, names[0] ?? '', names[1] ?? '')
                    let computer: Partial<Computer> = {
                        name: row["Name"],
                        otherserial: row["Inventory_Number"],
                        status: {
                            id: state.id ?? 0,
                            name: state.name ?? ''
                        },
                        manufacturer: {
                            id: manufacturer.id ?? 0,
                            name: manufacturer.name ?? ''
                        },
                        user: {
                            id: user.id ?? 0,
                            name: user.firstname ?? ''
                        },
                        location: {
                            id: location.id?? 0,
                        },
                        model: {
                            name: model.name ?? '',
                            id: model.id ?? 0
                        },
                    }
                    let computerObject = ComputerService.createObject(computer)
                    if(Object.values(computerObject).length !== 0){
                        let result = await glpiApi.postV1(`${row["Item_Type"]}`, computerObject)
                    }
                }
            }
            message = "import Fichier  1 Termine"
        } catch (error) {
            console.error(error)
            message = "Une erreur est survenue lors de l'import du fichier numero 1";
        }
        return message;
    }
}