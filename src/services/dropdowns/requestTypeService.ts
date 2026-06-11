import { glpiApi } from "@/api/GlpiApi"

export default class RequestTypeService {
  async getAll(): Promise<{ id: number, name: string }[]> {
    const response = await glpiApi.getV1<{ id: number, name: string }[]>(
      '/RequestType'
    )
    return response.data
  }
}