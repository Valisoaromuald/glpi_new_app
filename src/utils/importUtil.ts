export const FILE1_COLLUMN_NAMES = [
    'Name', 'Status', 'Location', 'Manufacturer',
    'Item_Type', 'Model', 'Inventory_Number', 'User'
]

export const FILE2_COLLUMN_NAMES = [
    'Ref_Ticket', 'Date', 'Heure', 'Type', 'Titre', 'Description',
    'Status', 'Priority', 'Items'
]

export const FILE3_COLLUMN_NAMES = [
    'Num_Ticket', 'Duration_second', 'Time_Cost', 'Fixed_Cost'
]


export const STATUS_MAP: Record<string, number> = {
    'New': 1,
    'Processing': 2,
    'Pending': 3,
    'Solved': 4,
    'Closed': 5
}
export const PRIORITY_MAP: Record<string, number> = {
    'Very Low': 1,
    'Low': 2,
    'Medium': 3,
    'High': 4,
    'Very High': 5
}
export const TYPE_MAP: Record<string, number> = {
    'Incident': 1,
    'Demande': 2,
    'Request': 2
}


export function replaceChar(str:string,toReplace:string,substitute:string){

    if(str && str.includes(toReplace)){
        str.trim();
        return str.replace(toReplace,substitute)
    }
    return str

}



export interface DetectedType {
  ext: string;
  mime: string;
}

interface SignaturePart {
  offset: number;
  bytes: number[];
}

interface FileSignature extends DetectedType {
  parts: SignaturePart[];
}


const IMAGE_SIGNATURES: FileSignature[] = [
  { ext: 'jpg',  mime: 'image/jpeg', parts: [{ offset: 0, bytes: [0xff, 0xd8, 0xff] }] },
  { ext: 'png',  mime: 'image/png',  parts: [{ offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] }] },
  { ext: 'gif',  mime: 'image/gif',  parts: [{ offset: 0, bytes: [0x47, 0x49, 0x46, 0x38] }] },               // "GIF8" (87a/89a)
  { ext: 'bmp',  mime: 'image/bmp',  parts: [{ offset: 0, bytes: [0x42, 0x4d] }] },                            // "BM"
  { ext: 'webp', mime: 'image/webp', parts: [{ offset: 0, bytes: [0x52, 0x49, 0x46, 0x46] }, { offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] }] }, // RIFF…WEBP
  { ext: 'tif',  mime: 'image/tiff', parts: [{ offset: 0, bytes: [0x49, 0x49, 0x2a, 0x00] }] },                // little-endian
  { ext: 'tif',  mime: 'image/tiff', parts: [{ offset: 0, bytes: [0x4d, 0x4d, 0x00, 0x2a] }] },                // big-endian
  { ext: 'ico',  mime: 'image/x-icon', parts: [{ offset: 0, bytes: [0x00, 0x00, 0x01, 0x00] }] },
  { ext: 'heic', mime: 'image/heic', parts: [{ offset: 4, bytes: [0x66, 0x74, 0x79, 0x70] }, { offset: 8, bytes: [0x68, 0x65, 0x69] }] },        // ftyp…hei(c/x)
  { ext: 'avif', mime: 'image/avif', parts: [{ offset: 4, bytes: [0x66, 0x74, 0x79, 0x70] }, { offset: 8, bytes: [0x61, 0x76, 0x69, 0x66] }] },  // ftyp…avif
  { ext: 'psd',  mime: 'image/vnd.adobe.photoshop', parts: [{ offset: 0, bytes: [0x38, 0x42, 0x50, 0x53] }] }, // "8BPS"
];


function matchesPart(bytes: Uint8Array, part: SignaturePart): boolean {
  return part.bytes.every((b, i) => bytes[part.offset + i] === b);
}

function matchesSignature(bytes: Uint8Array, sig: FileSignature): boolean {
  return sig.parts.every(part => matchesPart(bytes, part));
}

export function detectImageType(bytes: Uint8Array): DetectedType | null {
  const hit = IMAGE_SIGNATURES.find(sig => matchesSignature(bytes, sig));
  return hit ? { ext: hit.ext, mime: hit.mime } : null;
}