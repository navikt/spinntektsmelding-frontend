import { http, HttpResponse } from 'msw';
import fs from 'fs';
import path from 'path';

// Funksjon for å lese mockdata fra fil
function readMockdata(filename) {
  const filePath = path.join(process.cwd(), 'mockdata', `${filename}.json`);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  return null;
}

// Map fra kvittid til mockdata-fil (kan utvides etter behov)
const kvitteringMockdataMap = {
  '8d50ef20-37b5-4829-ad83-56219e70b375': 'kvittering-delvis-endret-inntekt',
  'f7a3c8e2-9d4b-4f1e-a6c5-8b2d7e0f3a91': 'kvittering-eksternt-system',
  'b4e2f8a1-6c3d-4e9f-82b7-1a5c9d0e4f63': 'kvittering-delvis'
};

export const handlers = [
  // Hent kvitteringsdata - matcher alle kall til kvittering API
  // Brukes av SSR i development for å mocke backend
  http.get('*/api/v1/kvittering/:kvittid', ({ params }) => {
    const { kvittid } = params;
    const mockdataFile = kvitteringMockdataMap[kvittid] || 'kvittering-bug-endre';
    const data = readMockdata(mockdataFile);

    if (data) {
      return HttpResponse.json(data);
    }
    return new HttpResponse(null, { status: 404 });
  })
];
