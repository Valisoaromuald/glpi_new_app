// documentService.ts
import { glpiApi } from '@/api/GlpiApi'
import type { ExtractedImage } from '@/services/import/fileService'

export interface GlpiDocument {
    id: number
    name: string
}

export async function uploadImageAsDocument(image: ExtractedImage): Promise<GlpiDocument> {
    const formData = new FormData()
    console.log(image.file instanceof File)  // doit être true
    console.log(image.file.size)             // doit être > 0
    console.log(image.file.type)
    formData.append('uploadManifest', JSON.stringify({
        input: {
            name: image.name,
            _filename: [image.name],
        }
    }))

    formData.append('filename[0]', image.file, image.name)
    const response = await glpiApi.postV1Raw<GlpiDocument>('/Document', formData)
    return response.data
}