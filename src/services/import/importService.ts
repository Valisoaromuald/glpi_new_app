
import { glpiApi } from "@/api/GlpiApi";
import StateService from "../dropdowns/stateService";
import { FileService, type CsvResult, type CsvRow, type ExtractedImage } from "./fileService"

import type { Manufacturer } from "@/types/dropdowns/manufacturer";
import LocationService from "../dropdowns/locationService";
import ManufacturerService from "../management/manufacturerService";
import type { Location } from "@/types/dropdowns/location";
import type { State } from "@/types/dropdowns/state";
import type { User } from "@/types/administration/user/user";
import type { AssetModel } from "@/types/asset/assetModel";
import AssetService from "../assets/assetService";
import UserService from "../administration/userService";
import ComputerService from "../assets/computerService";
import type { Computer } from "@/types/asset/computer";
import { PRIORITY_MAP, replaceChar, STATUS_MAP, TYPE_MAP } from "@/utils/importUtil";
import { ASSET_ENDPOINTS } from "@/utils/assetUtil";
import TicketService from "../assistance/ticketService";
import type { ImportedFile } from "@/types/file/importedFile";
import TicketCostService from "../assistance/ticketCostService";
import { uploadImageAsDocument } from "./documentService";
import type { BaseAsset } from "@/types/asset/asset";
import type { AssetType } from "@/types/asset/assetType";
export default class ImportService {
    isSimilarRow(row1: Record<string, any>, row2: Record<string, any>): boolean {
        const keys = Object.keys(row1);

        // Sécurité au cas où row2 n'aurait pas le même nombre de clés
        if (keys.length !== Object.keys(row2).length) return false;

        return keys.every(key => row1[key] === row2[key]);
    }
    trimStringArray(values: string[]): string[] {
        return values.map(value => value.trim());
    }
    trimCsvRows(
        records: CsvRow[]
    ): CsvRow[] {
        return records.map(record =>
            Object.fromEntries(
                Object.entries(record).map(([key, value]) => [
                    key,
                    value.trim()
                ])
            )
        );
    }
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
                        name: state,
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
                let existingLocation = await glpiApi.getV1(`/Location?searchText[name]=${location}`)
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
        let manufacturers: string[] = this.getAllByHeader(csv, "Manufacturer")
        let results: Partial<Manufacturer>[] = []
        try {
            for (let manufacturer of manufacturers) {

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
        let results: Partial<User>[] = []
        try {
            for (let user of users) {
                let names = user.split(" ")
                let usr: Partial<User> = {
                    realname: names[0]?.trim() ?? '',
                    firstname: names[1]?.trim() ?? ''
                }
                let object: Object = UserService.createObject(usr)
                if (Object.keys(object).length !== 0) {
                    let result = await glpiApi.postV1('/User', object)
                    let res = {
                        realname: usr.realname,
                        firstname: usr.firstname,
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
        let results: Partial<AssetModel>[] = []
        let rows: CsvRow[] = csv.rows
        try {
            for (let i = 0; i < models.length; i++) {

                if (rows[i]) {
                    const row = rows[i]
                    if (row && row["Item_Type"]) {
                        let modelNameEndPoint = `${row["Item_Type"]}Model`
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

    async importTypes(csv: CsvResult): Promise<Partial<AssetType>[]> {
        let types: string[] = this.getAllByHeader(csv, "Item_Type")
        let results: Partial<AssetModel>[] = []
        try {
            for (let i = 0; i < types.length; i++) {
                let type = types[i]
                if (type) {

                    let modelNameEndPoint = `${type}Type`
                    let mdl: Partial<AssetType> = {
                        name: type[i]
                    }
                    let object: Object = AssetService.createTypeObject(mdl)
                    if (Object.keys(object).length !== 0) {
                        let result = await glpiApi.postV1(modelNameEndPoint, object)
                        let assetType = {
                            name: type,
                            id: result.data.id,
                        }
                        results.push(assetType)
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
            console.log(state.name === stateName," ","statName: ",state," state.name: ",stateName)
            if (state.name === stateName) {
                console.log("state id: ", state.id)
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
    getRelevantType(assetTypes: Partial<AssetType>[], modelName: string): Partial<AssetType> {
        for (let assetType of assetTypes) {
            if (assetType.name === modelName) {
                return assetType
            }
        }
        return {}
    }
    isAlreadyTreatedRow(row: CsvRow, rows: CsvRow[]): boolean {
        let treatedRow: CsvRow | undefined = rows.find(r => this.isSimilarRow(r, row))
        if (treatedRow) {
            return true;
        }
        return false
    }
    async importAssets(csv: CsvResult, onProgress?: (resource: string, done: number, total: number) => void): Promise<string> {
        let message: string = '';
        try {
            let states: Partial<State>[] = await this.importStates(csv)
            let locations: Partial<Location>[] = await this.importLocations(csv)
            let manufacturers: Partial<Manufacturer>[] = await this.importManufacturers(csv)
            let models: Partial<AssetModel>[] = await this.importModels(csv);
            let types: Partial<AssetType>[] = await this.importTypes(csv);
            let users: Partial<User>[] = await this.importUsers(csv);
            let rows: CsvRow[] = csv.rows;
            let treatedRows: CsvRow[] = []
            for (let i = 0; i < rows.length; i++) {
                let row = rows[i]
                if (row) {
                    //verfier si la ligne est deja traitee
                    if (row["Item_Type"]) {
                        let treatedRow = this.isAlreadyTreatedRow(row, treatedRows)
                        if (!treatedRow) {
                            let state = this.getRelevantState(states, row["Status"]?.trim() ?? '')
                            //  console.log(row["Status"],' ',state)
                            let location = this.getRelevantLocation(locations, row["Location"] ?? '')
                            let manufacturer = this.getRelevantManfacturer(manufacturers, row["Manufacturer"] ?? '')
                            let model = this.getRelevantModel(models, row["Model"] ?? '')
                            let type = this.getRelevantType(types, row["Item_Type"] ?? '')
                            let names: string[] = row["User"]?.split(" ") ?? [];
                            let user: Partial<User> = {}
                            let assetNameToLower = row["Item_Type"].trim().toLocaleLowerCase()

                            let assetModelKeyName = assetNameToLower + "models_id"
                            let assetTypeKeyName = assetNameToLower + "types_id"
                            user = this.getRelevantUser(users, names[0] ?? '', names[1] ?? '')
                            let item: Partial<BaseAsset> = {
                                name: row["Name"],
                                otherserial: row["Inventory_Number"],
                                states_id: state.id ?? 0,
                                manufacturers_id: manufacturer.id ?? 0,
                                users_id: user.id ?? 0,
                                locations_id: location.id ?? 0,
                                [assetModelKeyName]: model.id ?? 0,
                                [assetTypeKeyName]: type.id ?? 0,
                                comment: ""
                            }
                            // console.log("item: ",item)
                            let result = await glpiApi.postV1(`/${row["Item_Type"]}`, item)
                            treatedRows.push(row)
                            onProgress?.('Tickets', i + 1, rows.length)

                        }

                    }
                }
            }
            message = "import Fichier 1 Termine"
        } catch (error) {
            console.error(error)
            message = "Une erreur est survenue lors de l'import du fichier numero 1";
            throw error;
        }
        return message;
    }

    //fonction qui sert a verifier la normalite d'une date
    isNormalDate(row: CsvRow, dateColumnName: string): boolean {
        let result = true
        if (row && row[dateColumnName]) {
            let splittedDate = row[dateColumnName].split('/')
            if (splittedDate.length !== 3) {
                result = false
            }
            result = true
        }
        return result
    }


    createTicketObject(row: CsvRow): Object {
        if (row) {
            let defaultDate = new Date()
            let defaultHour = `${defaultDate.getHours()}: ${defaultDate.getMinutes()}:${defaultDate.getSeconds()}.${defaultDate.getMilliseconds().toFixed(3)}`
            let [day, month, year] = [String(defaultDate.getDay()), String(defaultDate.getMonth()), String(defaultDate.getFullYear())]
            let realDate = `${year}-${month}-${day} ${defaultHour}`
            // Étape 1 — Formater la date
            if (row["Date"] && this.isNormalDate(row, "Date")) {
                let dates = row["Date"].split("/")
                if (dates && dates.length === 3) {
                    [day, month, year] = [dates[0] ?? "", dates[1] ?? "", dates[2] ?? ""];
                    let hours = row['Heure']?.split(":")
                    if (hours && hours.length >= 2) {
                        defaultHour = hours.length === 2 && row["Heure"] ? row["Heure"] + ":00" : defaultHour
                        realDate = `${year}-${month}-${day} ${defaultHour}`
                    }
                }
            }
            // Étape 2 — Convertir les valeurs texte en nombres
            const type = row['Type'] ? TYPE_MAP[row['Type']] : 1
            const status = row['Status'] ? STATUS_MAP[row['Status']] : 1
            const priority = row['Priority'] ? PRIORITY_MAP[row['Priority']] : 3
            // Étape 3 — Construire l'objet
            return {
                externalid: row['Ref_Ticket'],
                name: row['Titre'],
                content: row['Description'],
                date: realDate,
                type: type,
                status: status,
                priority: priority,
                users_id_recipient: 2
            }
        }
        return {}
    }
    //fonction qui sert a rechecher un nom d'equipement parmi tous les equipements
    async resolveItem(name: string): Promise<{ itemtype: string, items_id: number } | null> {
        try {
            let pas = 2;
            // Étape 1 — Parcourir tous les endpoints d'assets
            for (let i = 0; i < ASSET_ENDPOINTS.length; i += pas) {
                const subAssetEndPoints = ASSET_ENDPOINTS.slice(i, i + pas)
                const promises = []
                for (let asset of subAssetEndPoints) {
                    if (asset && asset.endpoint && asset.itemtype) {
                        promises.push(glpiApi.getV1(`${asset.endpoint}?searchText[name]=${name}`))
                    }
                }

                const responses = await Promise.all(promises)
                for (let j = 0; j < responses.length; j++) {
                    const response = responses[j];
                    const assetInfo = subAssetEndPoints[j];
                    if (response && assetInfo) {
                        const items = response.data;

                        if (items && items.length > 0) {
                            return {
                                itemtype: assetInfo.itemtype,
                                items_id: items[0].id
                            };
                        }
                    }
                }
            }
        } catch (error) {
            throw error;
        }
        // Étape 3 — Aucun équipement trouvé
        console.warn(`Équipement non trouvé : ${name} `)
        return null
    }

    async parseItems(raw: string): Promise<{ itemtype: string, items_id: number }[]> {
        let result: { itemtype: string, items_id: number }[] = []
        try {
            // Étape 1 — Nettoyer et splitter la chaîne
            const names = raw
                .replace(/[\[\]"]/g, '')
                .split(',')
                .map(s => s.trim())
                .filter(Boolean)
            const nameWithoutDuplicates = this.removeDuplicates(names)
            // Étape 2 — Résoudre chaque nom en { itemtype, items_id }
            const resolved = await Promise.all(nameWithoutDuplicates.map(name => this.resolveItem(name)))
            // Étape 3 — Filtrer les nulls
            result = resolved.filter((item): item is { itemtype: string, items_id: number } => item !== null)
        } catch (error) {
            throw error
        }
        return result;
    }

    async linkItemsToTicket(ticketId: number, items: { itemtype: string, items_id: number }[]): Promise<void> {
        try {
            // Étape 1 — Lier chaque équipement au ticket
            for (const item of items) {
                await glpiApi.postV1('/Item_Ticket', TicketService.createItemTicketObject(ticketId, item))
            }
        } catch (error) {
            throw error
        }

    }

    async importTickets(csv: CsvResult, onProgress?: (resource: string, done: number, total: number) => void): Promise<string> {
        let message: string = ''
        try {
            let treatedRows: CsvRow[] = []
            let rows: CsvRow[] = csv.rows
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i]

                if (row) {
                    let existingAsset = await TicketService.getByExternalId(row["Ref_Ticket"])
                    if (Object.keys(existingAsset).length === 0) {
                        let treatedRow: boolean = this.isAlreadyTreatedRow(row, treatedRows)
                        if (!treatedRow) {
                            // Étape 1 — Créer le ticket
                            const ticketObject = this.createTicketObject(row)
                            if (Object.keys(ticketObject).length !== 0) {
                                const response = await glpiApi.postV1('/Ticket', ticketObject)
                                const ticketId: number = response.data.id
                                if (row['Items']) {
                                    // Étape 2 — Résoudre les équipements
                                    const items = await this.parseItems(row['Items'])

                                    // Étape 3 — Lier les équipements au ticket
                                    await this.linkItemsToTicket(ticketId, items)
                                }
                                treatedRows.push(row)
                                onProgress?.('Tickets', i + 1, rows.length)
                            }
                        }
                    }
                }
            }
            message = "Import fichier 2 termine"
        } catch (error) {
            console.error("erreur :", error)
            message = "une erreur est survenue lors d l'import du fichier numero 2"
            throw error;
        }
        return message
    }
    async importTicketCosts(csv: CsvResult, onProgress?: (resource: string, done: number, total: number) => void): Promise<string> {
        let message: string = ''
        let treatedRows: CsvRow[] = []
        let rows: CsvRow[] = csv.rows
        try {
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i]
                if (row) {
                    let num_ticket: number = row["Num_Ticket"] ? Number(row["Num_Ticket"]) : 0
                    let relatedTicket = await TicketService.getByExternalId(row["Num_Ticket"])
                    let actionTime: number = row["Duration_second"] ? Number(row["Duration_second"]) : 0
                    let effortCost: number = row["Time_Cost"] ? parseFloat(replaceChar(row["Time_Cost"], ',', '.')) : 0
                    let cost: number = row["Fixed_Cost"] ? parseFloat(replaceChar(row["Fixed_Cost"], ',', '.')) : 0
                    let treatedRow: boolean = this.isAlreadyTreatedRow(row, treatedRows)
                    if (!treatedRow) {

                        let newTicketCostObject = TicketCostService.createObject(relatedTicket.id ?? 0, actionTime, effortCost, cost)
                        if (Object.keys(newTicketCostObject).length !== 0) {
                            await glpiApi.postV1('/TicketCost', newTicketCostObject)
                            treatedRows.push(row)
                            onProgress?.('TicketsCosts', i + 1, rows.length)
                        }
                    }
                }
            }
            message = "Import fichier 3 termine"
        } catch (error) {
            console.error("erreur :", error)
            message = "une erreur est survenue lors d l'import du fichier numero 2"
            throw error
        }
        return message
    }
    async getRelevantCsvResult(files: ImportedFile[], headers: string[]): Promise<CsvResult | null> {
        let result: CsvResult | null = null;
        try {
            for (let file of files) {
                let fileService: FileService = new FileService(file.file)
                let csvResult: CsvResult = await fileService.readCsv()
                let newHeaders = csvResult.headers.filter(h => headers.includes(h))
                if (newHeaders.length == headers.length) {
                    result = csvResult
                    return result
                }
            }
        } catch (error) {
            throw error;
        }
        return null
    }
    getZipFile(files: ImportedFile[]): ImportedFile | null {
        try {
            for (const file of files) {
                if (file.name.includes(".zip")) {
                    return file
                }
            }
        } catch (error) {
            throw error;
        }
        return null;
    }

    deduplicateImages(images: ExtractedImage[]): ExtractedImage[] {
        const seen = new Set<string>()
        return images.filter(image => {
            if (seen.has(image.name)) return false
            seen.add(image.name)
            return true
        })
    }

    async importImagesZip(
        zipFile: ImportedFile,
        onProgress?: (name: string, done: number, total: number) => void
    ): Promise<string> {
        // 1. Extraire
        let images = await FileService.extractImagesFromZip(zipFile)
        if (images.length === 0) return 'Aucune image valide trouvée dans le zip.'

        let done = 0
        images = this.deduplicateImages(images)
        for (const image of images) {
            // 2. Upload comme Document GLPI
            const document = await uploadImageAsDocument(image)

            // 3. Trouver le Computer correspondant par nom de fichier
            //    ex: "PC-ADM-001.png" → cherche un Computer nommé "PC-ADM-001"
            const assetName = image.name.replace(/\.[^.]+$/, '')  // retire l'extension
            const items = await this.resolveItem(assetName)

            if (items && Object.values(items).length > 0) {
                await AssetService.linkDocumentToItem(items.items_id, document.id, items.itemtype)
            }
            done++
            onProgress?.(image.name, done, images.length)
        }

        return `${done} image(s) importée(s) avec succès.`
    }
}