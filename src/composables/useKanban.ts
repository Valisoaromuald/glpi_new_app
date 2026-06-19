import { glpiApi } from "@/api/GlpiApi";
import NewAppApi from "@/api/newAppApi";
import TicketItemService from "@/services/assistance/ticketItemService";
import TicketService from "@/services/assistance/ticketService";
import type { CsvResult, CsvRow } from "@/services/import/fileService";
import ImportService from "@/services/import/importService";
import type { Ticket } from "@/types/assistance/ticket";
import type { IKanbanCard } from "@/types/kanban/kanbanCard";
import type { IKanbanColumn } from "@/types/kanban/KanBanColumn";
import { STATUS_MAP_KANBAN } from "@/utils/importUtil";
import type { ITicketCost, ITicketItem, KanbanConfigRow, ObjTicket } from "shared-types";
import { ref } from "vue";


export function useKanban() {
    let columns = ref<Partial<IKanbanColumn>[]>([])
    const ticketService = new TicketService()
    const isClosingSumbit = ref<boolean>(false)
    const ticketId = ref<number>(0)
    const closingValue = ref<number>(0)
    const rollBackValue = ref<number>(0)
    const isClosed = ref<boolean>(false)
    const isRollBack = ref<boolean>(false)
    function buildKanbanCard(ticket: Partial<Ticket>): Partial<IKanbanCard> {
        if (Object.keys(ticket).length === 0) {
            return {}
        }
        return {
            ticketId: ticket.id,
            title: ticket.name,
            description: ticket.content,
            ticketStatus: Number(ticket.status)
        }
    }
    function buildKanbanCards(tickets: Partial<Ticket>[]): Partial<IKanbanCard>[] {
        let results: Partial<IKanbanCard>[] = []
        results = tickets.map((ticket: Partial<Ticket>) => buildKanbanCard(ticket))
        return results;
    }
    function buidKanbanColumn(status: number, kanbanCards: Partial<IKanbanCard>[], kanbanConfig: KanbanConfigRow[], cardsRequired: boolean = true): Partial<IKanbanColumn> {

        let result: Partial<IKanbanColumn> = {
            title: Object.entries(STATUS_MAP_KANBAN).find(([, value]) => value === status)?.[0] ?? '',
            status: status,
            cards: cardsRequired ? kanbanCards.filter(kc => kc.ticketStatus === status) : [],
            color: kanbanConfig.filter(kc => kc.status_id === status)[0]?.color
        }
        result.label_mg = kanbanConfig.filter(kc => kc.label === result.title)[0]?.color
        return result;
    }
    function buidKanbanColumns(statuses: number[], kanbanCards: Partial<IKanbanCard>[], kanbanConfig: KanbanConfigRow[], cardsRequired: boolean = true): Partial<IKanbanColumn>[] {
        return statuses.map(s => buidKanbanColumn(s, kanbanCards, kanbanConfig))
    }
    async function load() {
        try {
            let tickets = await ticketService.getAll()
            let kanbanConfig = await api.get<KanbanConfigRow[]>('kanban-config');

            let kanbanCards = buildKanbanCards(tickets)
            columns.value = buidKanbanColumns([1, 2, 3], kanbanCards, kanbanConfig.data)

        } catch (error) {
            throw error;
        }
    }
    const api = new NewAppApi();

    async function moveCard(card: IKanbanCard, destinationStatus: number) {

        const oldStatus = card.ticketStatus

        // 1. update optimiste (UI immédiate)
        card.ticketStatus = destinationStatus
        try {

            // 2. appel API
            await ticketService.updateStatus(
                card.ticketId,
                destinationStatus
            )

        } catch (error) {

            // 3. rollback si erreur
            card.ticketStatus = oldStatus

            throw error
        }
    }
    async function getTotalCosts(ticketId: number, reopenMode: number = 1): Promise<number> {
        let result: number = 0
        const newAppApi = new NewAppApi()
        let array: ITicketCost[] = []
        try {
            let objTicket: ObjTicket = (await newAppApi.get<ObjTicket>(`tickets/${ticketId}`)).data
            console.log("reopen Mode dans import: ",reopenMode)
            if (reopenMode === 1) {
                const { data: ticketCosts } = (await newAppApi.get<{ data: ITicketCost[] }>(
                    `tickets/${objTicket.id}/costs/recent`
                )).data;
                array = ticketCosts
            }
            if (reopenMode === 2) {
                const { data: ticketCosts } = (await newAppApi.get<{ data: ITicketCost[] }>(
                    `tickets/${objTicket.id}/costs/first`
                )).data;
                array = ticketCosts
            }
            if (reopenMode === 3 || reopenMode=== 4) {
                const { data: ticketCosts } = (await newAppApi.get<{ data: ITicketCost[] }>(
                    `tickets/${objTicket.id}/costs/all`
                )).data;
                array = ticketCosts
            }
            for (let recentTicketCost of array) {
                result += Number(recentTicketCost.cost)
            }
            if (reopenMode === 3) {
                const ticket_items: ITicketItem[] = await TicketItemService.getAllByTicketId(ticketId)
                result /= (array.length / ticket_items.length)
            }
        } catch (error) {
            throw error
        }
        return result
    }
    async function insertCost(cost: number, cost_type: string, ticket_id: number): Promise<void> {
        isClosingSumbit.value = true
        try {
            const newAppApi = new NewAppApi()
            const ticket_items: ITicketItem[] = await TicketItemService.getAllByTicketId(ticket_id)
            let objTicket: ObjTicket = (await newAppApi.get<ObjTicket>(`tickets/${ticket_id}`)).data
            let data = {
                cost_type: cost_type,
                cost: cost,
                items: ticket_items
            }
            await newAppApi.post(`tickets/${objTicket.id}/Item_Ticket`, data)
            isClosingSumbit.value = false

        } catch (error) {
            throw error;
        }

    }
    async function deleteRecentTicketCosts(ticket_id: number): Promise<number> {
        let result: number = 0
        let newAppApi = new NewAppApi()
        try {
            let objTicket: ObjTicket = (await newAppApi.get<ObjTicket>(`tickets/${ticket_id}`)).data
            result = (await newAppApi.delete<number>(`tickets/${objTicket.id}/costs/recent`)).data
        } catch (error) {
            throw error;
        }
        return result;
    }
    async function importTransaction(csv: CsvResult, onProgress?: (resource: string, done: number, total: number) => void) {
        let message: string = ''
        let treatedRows: CsvRow[] = []
        let rows: CsvRow[] = csv.rows
        let hasError: boolean = false; //flag
        const importService = new ImportService()
        try {
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i]
                if (row) {
                    let num_ticket: number = row["Ref_Ticket"] ? Number(row["Ref_Ticket"]) : 0
                    let relatedTicket = await TicketService.getByExternalId(String(num_ticket))
                    let mvt: string = row["Mvt"] ?? ''
                    let valeur: number = importService.parseStringToFloat(row["Valeur"])
                    let treatedRow: boolean = importService.isAlreadyTreatedRow(row, treatedRows)
                    if (!treatedRow) {
                        if (mvt.trim().toLowerCase() === "close" && valeur>=0) {
                            await insertCost(valeur, "super_cost", relatedTicket.id ?? 0)
                        }
                        if (mvt.trim().toLowerCase() === "open" && valeur>=0) {
                            const reopenMode = row["Mode"] ? Number(row["Mode"]) : 1
                            console.log("mod de reouverture:",reopenMode)
                            const totalRecentCosts = await getTotalCosts(relatedTicket.id ?? 0, reopenMode);
                            const cost = (totalRecentCosts / 100) * valeur;
                            await insertCost(cost, "reopening", relatedTicket.id ?? 0)

                        }
                        if (mvt.trim().toLowerCase() === "cancel") {
                            console.log(relatedTicket.id)
                            await deleteRecentTicketCosts(relatedTicket.id ?? 0)
                        }
                        treatedRows.push(row)
                    }
                }
                if (!hasError) {
                    onProgress?.('Ticket_cost', i + 1, rows.length)
                }
            }
            message = "Import transaction termine"
        } catch (error) {
            hasError = true
            console.error("erreur :", error)
            message = "une erreur est survenue lors d l'import du fichier de transaction"
            throw error
        }
        return message
    }

    return {
        columns,
        ticketId,
        isClosed,
        isRollBack,
        closingValue,
        rollBackValue,
        isClosingSumbit,
        getTotalCosts,
        deleteRecentTicketCosts,
        importTransaction,
        load,
        moveCard,
        insertCost
    }
}