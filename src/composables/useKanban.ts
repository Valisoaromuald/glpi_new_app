import { glpiApi } from "@/api/GlpiApi";
import NewAppApi from "@/api/newAppApi";
import TicketService from "@/services/assistance/ticketService";
import type { Ticket } from "@/types/assistance/ticket";
import type { IKanbanCard } from "@/types/kanban/kanbanCard";
import type { IKanbanColumn } from "@/types/kanban/KanBanColumn";
import { STATUS_MAP, STATUS_MAP_KANBAN } from "@/utils/importUtil";
import type { KanbanConfigRow } from "shared-types";
import { ref } from "vue";

export function useKanban() {
    let columns = ref<Partial<IKanbanColumn>[]>([])
    const ticketService = new TicketService()
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
    function buidKanbanColumn(status: number, kanbanCards: Partial<IKanbanCard>[], kanbanConfig: KanbanConfigRow[],cardsRequired:boolean=true): Partial<IKanbanColumn> {

        let result :Partial<IKanbanColumn>= {
            title: Object.entries(STATUS_MAP_KANBAN).find(([, value]) => value === status)?.[0] ?? '',
            status: status,
            cards:  cardsRequired ? kanbanCards.filter(kc => kc.ticketStatus === status) : [],   
            color: kanbanConfig.filter(kc => kc.status_id === status)[0]?.color
        }
        result.label_mg = kanbanConfig.filter(kc => kc.label === result.title)[0]?.color
        console.log(result)

        return result;
    }
    function buidKanbanColumns(statuses: number[], kanbanCards: Partial<IKanbanCard>[], kanbanConfig: KanbanConfigRow[],cardsRequired:boolean=true): Partial<IKanbanColumn>[] {
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
    return {
        columns,
        load,
        moveCard,
    }
}