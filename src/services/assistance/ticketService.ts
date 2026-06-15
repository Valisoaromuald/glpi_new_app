import { glpiApi } from "@/api/GlpiApi";
import NewAppApi from "@/api/newAppApi";
import type { Ticket } from "@/types/assistance/ticket";
import type { LinkedElement } from "@/types/assistance/ticketForm";
import type { TicketItem } from "@/types/assistance/ticketItem";
import type { TicketGroup, TicketUser } from "@/types/assistance/ticketUser";
import PromiseUtil from "@/utils/promiseUtil";
import { getLabelByValue, PRIORITY_MAP, TICKET_STATUS_MAP } from "@/utils/ticketUtil";

export default class TicketService {
    private readonly subEndPoint = 'Ticket'
    private readonly endPointPrefix = `/Assistance/${this.subEndPoint}`
    async getTotalByType(typeId: number): Promise<number> {
        try {
            // En v2, l'endpoint imbriqué est correct
            const endpoint: string = `${this.endPointPrefix}?filter=type==${typeId}`;

            const response = await glpiApi.get(endpoint, {
                headers: {
                    // Équivalent du limit 0-0 pour ne charger aucune donnée, juste le total
                    'Range': '0-0'
                }
            });
            const contentRange = response.headers['content-range'];
            if (contentRange) {
                const totalElements = parseInt(contentRange.split('/')[1], 10);
                return totalElements;
            }
            return 0;
        } catch (error) {
            throw error;
        }
    }
    async getAllIds(): Promise<number[]> {
        try {
            const endpoint = `query { ${this.subEndPoint} { id } }`;
            const response = await glpiApi.graphql<{ Computer: { id: number | string }[] }>(endpoint);
            if (response.Computer) {
                return response.Computer.map(computer => Number(computer.id));
            }

            return [];
        } catch (error) {
            // Le "throw error" dans un bloc catch simple est redondant, 
            // mais si tu prévois d'ajouter des logs ici, tu peux le laisser.
            throw error;
        }
    }
    async getAll(): Promise<Partial<Ticket>[]> {
        try {
            const endpoint = `/Ticket?expand_dropdowns=1&range=0-9999`;
            const response = await glpiApi.getV1<Partial<Ticket>[]>(endpoint);
            if (response.data) {
                return response.data;
            }
            return [];
        } catch (error) {
            // Le "throw error" dans un bloc catch simple est redondant, 
            // mais si tu prévois d'ajouter des logs ici, tu peux le laisser.
            throw error;
        }
    }
    async getById(id: number): Promise<Partial<Ticket>> {
        const response = await glpiApi.getV1<Partial<Ticket>>(
            `/Ticket/${id}?expand_dropdowns=1`
        )
        return response.data
    }
    async getTicketsList(): Promise<Object[]> {
        const ticketLists: object[] = []
        try {
            const lists = await this.getAll();
            for (let element of lists) {
                let status = getLabelByValue(TICKET_STATUS_MAP, Number(element.status))
                let priority = getLabelByValue(PRIORITY_MAP, Number(element.priority))
                const actors = await this.getActors(Number(element.id))
                const requesters = actors.users.filter((u: TicketUser) => u.type === 1)
                const assignes = actors.users.filter((u: TicketUser) => u.type === 2)
                const assignedGroups = actors.groups.filter((g: TicketGroup) => g.type === 2)
                let object = {
                    id: element.id,
                    titre: element.name,
                    status: status,
                    priority: priority,
                    requesters: requesters.map((u: TicketUser) => u.users_id),
                    assignes: assignes.map((u: TicketUser) => u.users_id),
                    assignedGroups: assignedGroups.map((g: TicketGroup) => g.groups_id),
                    date_creation: element.date_creation
                }
                ticketLists.push(object)
            }
        } catch (error) {
            throw error;
        }
        return ticketLists;
    }
    async getActors(ticketId: number) {
        const [users, groups] = await Promise.all([
            glpiApi.getV1(`/Ticket/${ticketId}/Ticket_User?expand_dropdowns=1`),
            glpiApi.getV1(`/Ticket/${ticketId}/Group_Ticket?expand_dropdowns=1`),
        ])
        return {
            users: users.data,
            groups: groups.data,
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
            const ids: number[] = await this.getAllIds();
            for (let i = 0; i < ids.length; i += pas) {
                const subIds: number[] = ids.slice(i, i + pas);
                const promises: Promise<void>[] = PromiseUtil.buildPromises<number, void>(subIds, this.deleteById);
                await Promise.all(promises)
            }
        } catch (error) {
            throw error;
        }
    }

    static createItemTicketObject(ticketId: number, item: { itemtype: string, items_id: number }): Object {
        return {
            tickets_id: ticketId,
            itemtype: item.itemtype,
            items_id: item.items_id
        }
    }
    static async getByExternalId(externalId: string | undefined): Promise<Partial<Ticket>> {
        // 1. Sécurité : Si l'externalId est vide ou indéfini, on s'arrête tout de suite
        const cleanId = externalId?.trim();
        if (!cleanId) {
            console.warn("getByExternalId: L'identifiant externe fourni est vide.");
            return {};
        }

        try {
            // 2. Appel à l'API GLPI avec le searchText sur le champ externalid
            const response = await glpiApi.getV1(`/Ticket?searchText[externalid]=${cleanId}`);

            // 3. Traitement de la réponse
            // GLPI retourne souvent un tableau. On vérifie s'il y a au moins un résultat.
            if (Array.isArray(response.data) && response.data.length > 0) {
                return response.data[0]; // On retourne le premier ticket correspondant trouvé
            }

            // Si la réponse est déjà un objet unique contenant le ticket
            if (response && response.data.externalid === cleanId) {
                return response.data[0] as Partial<Ticket>;
            }

            // Si rien n'a été trouvé
            return {};

        } catch (error) {
            console.error(`Erreur lors de la récupération du ticket avec l'externalid [${cleanId}] :`, error);
            throw error;
        }
    }
    static createObject(ticket: Partial<Ticket>): Object {
        let date_creation = '';

        if (ticket.date_creation) {
            let date = ticket.date_creation.replace("T", " ")
            date_creation = date
        }
        else {

        }
        return {
            name: ticket.name ?? '',
            content: ticket.content ?? '',
            urgency: ticket.urgency ?? 3,
            impact: ticket.impact ?? 3,
            priority: ticket.priority ?? 3,
            date_creation: date_creation,
            itilcategories_id: ticket.category?.id ?? 0,
            locations_id: ticket.location?.id ?? 0,
            entities_id: ticket.entity?.id ?? 0,
            type: ticket.type ?? 1,

            requesttypes_id: ticket.request_type?.id ?? 0,

            // Acteurs extraits depuis team[]
            _users_id_requester: ticket.team
                ?.filter(m => m.type === 'User' && m.role === 'requester')
                .map(m => m.id) ?? [],

            _users_id_assign: ticket.team
                ?.filter(m => m.type === 'User' && m.role === 'assign')
                .map(m => m.id) ?? [],

            _users_id_observer: ticket.team
                ?.filter(m => m.type === 'User' && m.role === 'observer')
                .map(m => m.id) ?? [],

            // Groupes extraits depuis team[]
            _groups_id_assign: ticket.team
                ?.filter(m => m.type === 'Group' && m.role === 'assign')
                .map(m => m.id) ?? [],

            _groups_id_observer: ticket.team
                ?.filter(m => m.type === 'Group' && m.role === 'observer')
                .map(m => m.id) ?? [],
        }
    }
    async create(ticket: Partial<Ticket>): Promise<any> {
        try {
            const object = TicketService.createObject(ticket)
            const response = await glpiApi.postV1('/Ticket', object)
            return response.data
        } catch (error) {
            throw error;
        }
    }
    async getItemsByLinkedElements(
        elements: LinkedElement[]
    ): Promise<TicketItem[]> {
        return elements.map(element => (
            {
                itemtype: element.type,
                items_id: Number(element.id)
            }))
    }

    async updateStatus(
        ticketId: number,
        statutId: number,
    ): Promise<void> {
        const api = new NewAppApi();

        await api.patch(`/tickets/${ticketId}/status`,
            {
                statut_id: statutId,
            }
        );

        await glpiApi.patch(`/Ticket/${ticketId}`, {
            input: {
                status: statutId,
            },
        });
    };
}
