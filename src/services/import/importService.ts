
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
import { MODEL_NAMES_LIST, PRIORITY_MAP, replaceChar, STATUS_MAP, TYPE_NAMES_LIST, TYPE_MAP } from "@/utils/importUtil";
import { ASSET_ENDPOINTS } from "@/utils/assetUtil";
import TicketService from "../assistance/ticketService";
import type { ImportedFile } from "@/types/file/importedFile";
import TicketCostService from "../assistance/ticketCostService";
import { uploadImageAsDocument } from "./documentService";
import type { BaseAsset } from "@/types/asset/asset";
import type { AssetType } from "@/types/asset/assetType";
import type { TicketItem } from "@/types/assistance/ticketItem";
export default class ImportService {
    isSimilarRow(row1: Record<string, any>, row2: Record<string, any>): boolean {
        const keys = Object.keys(row1);

        // Sécurité au cas où row2 n'aurait pas le même nombre de clés
        if (keys.length !== Object.keys(row2).length) return false;

        return keys.every(key => {
            if (typeof row1[key] === "string" && typeof row2[key] === "string") {
                return this.equalsIgnoreCase(row1[key], row2[key])
            }
            row1[key] === row2[key]
        });
    }

    isRowEmpty(row: CsvRow): boolean {
        return Object.values(row).every(value => !value || value.trim() === '')
    }
    equalsIgnoreCase = (a: string | undefined, b: string | undefined): boolean => {
        if (a === b) return true; // Gère le cas où les deux sont undefined ou null
        if (!a || !b) return false; // Si l'un des deux est vide/null

        return a.trim().toLowerCase() === b.trim().toLowerCase();
    };

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
            if (!treated.includes(value.trim())) {
                treated.push(value.trim())
            }
        }
        return treated
    }
    createLocation(
        name: string,
        id: string
    ): Partial<Location> {
        let result: Partial<Location> = {
            name: name,
            id: Number(id)
        }
        return result
    }
    createState(
        name: string,
        id: string
    ): Partial<State> {
        let result: Partial<State> = {
            name: name,
            id: Number(id)
        }
        return result
    }
    createManufacturer(
        name: string,
        id: string
    ): Partial<Manufacturer> {
        let result: Partial<Manufacturer> = {
            name: name,
            id: Number(id)
        }
        return result
    }
    createModelObject(name: string, id: string): Partial<AssetModel> {
        let assetModel = {
            name: name,
            id: Number(id),
        }
        return assetModel;
    }
    createTypeObject(name: string, id: string): Partial<AssetType> {
        let assetType = {
            name: name,
            id: Number(id),
        }
        return assetType;
    }
    createUser(firstname: string, realname: string, id: string): Partial<User> {
        let res = {
            name: UserService.getName(realname, firstname),
            id: Number(id)
        }
        return res;
    }

    isInArray(endpointsArray: string[], endpoint: string): string {
        const search = endpoint.trim().toLowerCase();
        return endpointsArray.filter(e =>
            e.trim().toLowerCase() === search
        )[0] ?? '';
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
        let hasError: boolean = false; //flag

        try {
            let states: Partial<State>[] = []
            let locations: Partial<Location>[] = []
            let manufacturers: Partial<Manufacturer>[] = []
            let models: Partial<AssetModel>[] = []
            let types: Partial<AssetType>[] = []
            let users: Partial<User>[] = []
            let rows: CsvRow[] = csv.rows;
            let treatedRows: CsvRow[] = []

            for (let i = 0; i < rows.length; i++) {
                let row = rows[i]
                if (row) {
                    let treatedRow = this.isAlreadyTreatedRow(row, treatedRows)
                    if (!treatedRow) {
                        let state: Partial<State> = {}
                        let manufacturer: Partial<Manufacturer> = {}
                        let location: Partial<Location> = {}
                        let assetModel: Partial<AssetModel> = {}
                        let assetType: Partial<AssetModel> = {}
                        let assetNameToLower = row["Item_Type"]?.toLowerCase() ?? ''
                        let assetModelKeyName = ''
                        let assetTypeKeyName = ''
                        let user: Partial<User> = {}

                        try { //try interne pour chaque ligne
                            if (row["Location"]) {
                                const exist = locations.find(s => this.equalsIgnoreCase(s.name, row["Location"]))
                                if (!exist) {
                                    let object: Object = LocationService.createObject(row["Location"])
                                    location = await glpiApi.postV1('/Location', object)
                                    location.id = location.data.id
                                    let storedLocation: Partial<Location> = this.createLocation(row["Location"], location.data.id);
                                    locations.push(storedLocation)
                                }
                                else {
                                    location.id = exist.id
                                }
                            }
                            if (row["Status"]) {
                                const exist = states.find(s => this.equalsIgnoreCase(s.name, row["Status"]))
                                if (!exist) {
                                    let object: Object = StateService.createObject(row["Status"])
                                    state = await glpiApi.postV1('/State', object)
                                    state.id = state.data.id
                                    let storedState: Partial<State> = this.createState(row["Status"], state.data.id);
                                    states.push(storedState)
                                }
                                else {
                                    state.id = exist.id
                                }
                            }
                            if (row["Manufacturer"]) {
                                const exist = manufacturers.find(s => this.equalsIgnoreCase(s.name, row["Manufacturer"]))
                                if (!exist) {
                                    let object: Object = ManufacturerService.createObject(row["Manufacturer"])
                                    manufacturer = await glpiApi.postV1('/Manufacturer', object)
                                    manufacturer.id = manufacturer.data.id
                                    let storedManufacturer: Partial<Manufacturer> = this.createManufacturer(row["Manufacturer"], manufacturer.data.id);
                                    manufacturers.push(storedManufacturer)
                                }
                                else {
                                    manufacturer.id = exist.id
                                }
                            }
                            if (row["Model"]) {
                                const exist = models.find(s => this.equalsIgnoreCase(s.name, row["Model"]))
                                if (!exist) {
                                    let endpointModelName: string = `${row["Item_Type"]}Model`;
                                    let inArray = this.isInArray(MODEL_NAMES_LIST, endpointModelName);
                                    if (inArray) {
                                        let mdl: Partial<AssetModel> = { name: row["Model"] }
                                        let object: Object = AssetService.createModelObject(mdl, endpointModelName)
                                        assetModel = await glpiApi.postV1(endpointModelName, object)
                                        assetModel.id = assetModel.data.id
                                        let storedAssetModel: Partial<AssetModel> = this.createModelObject(row["Model"], assetModel.data.id);
                                        models.push(storedAssetModel)
                                        assetModelKeyName = assetNameToLower + "models_id"
                                    }
                                }
                                else {
                                    assetModelKeyName = assetNameToLower + "models_id"
                                    assetModel.id = exist.id
                                }
                            }
                            if (row["Item_Type"]) {
                                const exist = types.find(s => this.equalsIgnoreCase(s.name, row["Item_Type"]))
                                if (!exist) {
                                    let endpointTypeName: string = `${row["Item_Type"]}Type`;
                                    let inArray = this.isInArray(TYPE_NAMES_LIST, endpointTypeName);
                                    if (inArray) {
                                        let type: Partial<AssetType> = { name: row["Item_Type"] }
                                        let object: Object = AssetService.createTypeObject(type)
                                        assetType = await glpiApi.postV1(endpointTypeName, object)
                                        assetType.id = assetType.data.id
                                        let storedAssetType: Partial<AssetType> = this.createTypeObject(row["Item_Type"], assetType.data.id);
                                        types.push(storedAssetType)
                                        assetTypeKeyName = assetNameToLower + "types_id"
                                    }
                                }
                                else {
                                    assetTypeKeyName = assetNameToLower + "types_id"
                                    assetType.id = exist.id
                                }
                            }
                            if (row["User"]) {
                                let names: string[] = row["User"]?.split(/\s+/) ?? [];
                                let usr: Partial<User> = {
                                    realname: names[0]?.trim(),
                                    firstname: names[1]?.trim()
                                }
                                const exist = users.find(s => this.equalsIgnoreCase(s.name, UserService.getName(usr.realname ?? '', usr.firstname ?? '')))
                                if (!exist) {
                                    let object: Object = UserService.createObject(usr)
                                    user = await glpiApi.postV1('/User', object)
                                    user.id = user.data.id
                                    let storedUser: Partial<User> = this.createUser(usr.firstname ?? '', usr.realname ?? '', user.data.id);
                                    users.push(storedUser)
                                }
                                else {
                                    user.id = exist.id
                                }
                            }
                            if (row["Name"]) {
                                let item: Partial<BaseAsset> = {
                                    name: row["Name"],
                                    otherserial: row["Inventory_Number"],
                                    states_id: state.id ?? 0,
                                    manufacturers_id: manufacturer.id ?? 0,
                                    users_id: user.id ?? 0,
                                    locations_id: location.id ?? 0,
                                    [assetModelKeyName]: assetModel.id ?? 0,
                                    [assetTypeKeyName]: assetType.id ?? 0,
                                    comment: ""
                                }
                                let result = await glpiApi.postV1(`/${row["Item_Type"]}`, item)
                                treatedRows.push(row)

                                //  onProgress appelé seulement si pas d'erreur
                                if (!hasError) {
                                    onProgress?.('Assets', i + 1, rows.length)
                                }
                            }

                        } catch (rowError) {
                            // 👈 erreur sur une ligne spécifique
                            hasError = true;
                            console.error(`Erreur sur la ligne ${i + 1}:`, rowError)
                            // on continue les autres lignes ou on arrête selon votre besoin
                            // continue;  👈 décommenter pour continuer malgré l'erreur
                            throw rowError; // 👈 ou stopper complètement
                        }
                    }
                }
            }
            message = "Import Fichier 1 Terminé"

        } catch (error) {
            hasError = true; // 👈 s'assurer que le flag est à true
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
    formatDate(row: CsvRow): string {
        let defaultDate = new Date()
        let defaultHour = `${defaultDate.getHours()}: ${defaultDate.getMinutes()}:${defaultDate.getSeconds()}.${defaultDate.getMilliseconds().toFixed(3)}`
        let [day, month, year] = [String(defaultDate.getDay()), String(defaultDate.getMonth()), String(defaultDate.getFullYear())]
        let realDate = `${year}-${month}-${day} ${defaultHour}`

        if (row["Date"] && this.isNormalDate(row, "Date")) {
            let dates = row["Date"].split("/")
            if (dates && dates.length === 3) {
                [day, month, year] = [dates[0] ?? "", dates[1] ?? "", dates[2] ?? ""]
                let hours = row['Heure']?.split(":")
                if (hours && hours.length >= 2) {
                    defaultHour = hours.length === 2 && row["Heure"] ? row["Heure"] + ":00" : defaultHour
                    realDate = `${year}-${month}-${day} ${defaultHour}`
                }
            }
        }

        return realDate
    }

    createTicketObject(row: CsvRow): Object {
        if (row) {
            let realDate = this.formatDate(row)
            // Étape 2 — Convertir les valeurs texte en nombres
            const type = row['Type'] ? TYPE_MAP[row['Type']] : 1
            const status = row['Status'] ? STATUS_MAP[row['Status']] : 1
            const priority = row['Priority'] ? PRIORITY_MAP[row['Priority']] : 3
            // Étape 3 — Construire l'objet
            if (row["Status"]?.trim() === "Closed") {
                return {
                    externalid: row['Ref_Ticket'],
                    name: row['Titre'],
                    content: row['Description'],
                    date: realDate,
                    type: type,
                    status: 1,
                    priority: priority,
                    users_id_recipient: 2
                }
            }
            else {
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
        }
        return {}
    }
    async updateTicketObject(ticketId: number, row: CsvRow): Promise<Object> {
        const status = row['Status'] ? STATUS_MAP[row['Status']] : 1

        let object: any = {
            id: ticketId,        // ← obligatoire pour le PUT
            status: status,
        }

        // Si le ticket est clos, GLPI exige aussi les dates de résolution/clôture
        if (this.equalsIgnoreCase(row["Status"]?.trim(), "Closed")) {
            const closeDate = this.formatDate(row)  // même logique que pour 'date'

            object = {
                ...object,
                status: 6,                  // Clos
                solvedate: closeDate,       // date de résolution
                closedate: closeDate,       // date de clôture
            }
        }

        return object
    }

    //fonction qui sert a rechecher un nom d'equipement parmi tous les equipements
    async resolveItem(name: string): Promise<TicketItem | null> {
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

    async parseItems(raw: string): Promise<TicketItem[]> {
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
            // Étape 3 — Filtrer les nulls"
            result = resolved.filter((item): item is TicketItem => item !== null)
        } catch (error) {
            throw error
        }
        return result;
    }

    async linkItemsToTicket(ticketId: number, items: TicketItem[]): Promise<void> {
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
        let hasError = false;
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
                                if (this.equalsIgnoreCase(row["Status"], "Closed")) {
                                    this.updateTicketObject(response.data.id, row)
                                }
                                treatedRows.push(row)
                                //  onProgress appelé seulement si pas d'erreur
                                if (!hasError) {
                                    onProgress?.('Tickets', i + 1, rows.length)
                                }

                            }
                        }
                    }
                }
            }
            message = "Import fichier 2 termine"
        } catch (error) {
            console.error("erreur :", error)
            hasError = true; // 👈 s'assurer que le flag est à true
            message = "une erreur est survenue lors d l'import du fichier numero 2"
            throw error;
        }
        return message
    }
    zeroIfNegative(value: number): number {
        return value >= 0 ? value : 0;
    }

    parseStringToFloat(strValue: string | undefined): number {
        let result: number = 0;
        if (!strValue) {
            return result;
        }
        if (strValue.includes(",")) {
            strValue = replaceChar(strValue, ',', '.');
        }
        result = this.zeroIfNegative(parseFloat(strValue));
        return result;
    }
    async importTicketCosts(csv: CsvResult, onProgress?: (resource: string, done: number, total: number) => void): Promise<string> {
        let message: string = ''
        let treatedRows: CsvRow[] = []
        let rows: CsvRow[] = csv.rows
        let hasError: boolean = false; //flag
        try {
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i]
                if (row) {
                    let num_ticket: number = row["Num_Ticket"] ? Number(row["Num_Ticket"]) : 0
                    let relatedTicket = await TicketService.getByExternalId(String(num_ticket))
                    let actionTime: number = Number(row["Duration_second"])
                    let effortCost: number = this.parseStringToFloat(row["Time_Cost"])
                    let cost: number = this.parseStringToFloat(row["Fixed_Cost"])
                    let treatedRow: boolean = this.isAlreadyTreatedRow(row, treatedRows)
                    if (!treatedRow) {
                        let newTicketCostObject = TicketCostService.createObject(relatedTicket.id ?? 0, actionTime, effortCost, cost)
                        if (Object.keys(newTicketCostObject).length !== 0) {
                            await glpiApi.postV1('/TicketCost', newTicketCostObject)
                            treatedRows.push(row)
                            if (!hasError) {
                                onProgress?.('TicketsCosts', i + 1, rows.length)
                            }
                        }
                    }
                }
            }
            message = "Import fichier 3 termine"
        } catch (error) {
            hasError = true
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
                // Ignore les fichiers ZIP
                if (file.file.type === 'application/zip' || file.name.toLowerCase().endsWith('.zip')) {
                    continue
                }

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