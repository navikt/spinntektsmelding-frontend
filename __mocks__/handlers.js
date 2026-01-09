import { http, HttpResponse } from 'msw';
import fs from 'node:fs';
import path from 'node:path';

function readMockdata(filename) {
  const filePath = path.join(process.cwd(), 'mockdata', `${filename}.json`);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  return null;
}

const kvitteringMockdataMap = {
  '8d50ef20-37b5-4829-ad83-56219e70b375': 'kvittering-delvis-endret-inntekt',
  'f7a3c8e2-9d4b-4f1e-a6c5-8b2d7e0f3a91': 'kvittering-eksternt-system',
  'b4e2f8a1-6c3d-4e9f-82b7-1a5c9d0e4f63': 'kvittering-delvis',
  'b24baf59-55c9-48df-b8c1-7d93e098a95d': 'kvittering-delvis-endret-inntekt',
  '66f1188a-5cb7-4741-bd60-c9070835633c': 'kvittering-eksternt-system'
};

const kvitteringAgiMockdataMap = {
  '8d50ef20-37b5-4829-ad83-56219e70b375': 'kvittering-selvbestemt-format',
  'f32852af-888e-4d0c-ad67-081f22ee5c12': 'kvittering-selvbestemt-format'
  // 'f7a3c8e2-9d4b-4f1e-a6c5-8b2d7e0f3a91': 'kvittering-eksternt-system',
  // 'b4e2f8a1-6c3d-4e9f-82b7-1a5c9d0e4f63': 'kvittering-delvis',
  // 'b24baf59-55c9-48df-b8c1-7d93e098a95d': 'kvittering-delvis-endret-inntekt',
  // '66f1188a-5cb7-4741-bd60-c9070835633c': 'kvittering-eksternt-system'
};

const forespoerselMockdataMap = {
  '8d50ef20-37b5-4829-ad83-56219e70b375': 'trenger-originalen-16dager',
  'f7a3c8e2-9d4b-4f1e-a6c5-8b2d7e0f3a91': 'trenger-delvis-refusjon',
  'b4e2f8a1-6c3d-4e9f-82b7-1a5c9d0e4f63': 'trenger-en-sykeperiode',
  'f46623ac-fe65-403c-9b91-41db41d3a232': 'trenger-refusjon',
  '588e055c-5d72-449b-b88f-56aa43457668': 'trenger-originalen',
  '60c85231-d13c-49a2-bef3-1cb493d33f3b': 'trenger-delvis-uten-bfd',
  'ac33a4ae-e1bd-4cab-9170-b8a01a13471e': 'trenger-delvis-enkel-variant',
  '52ce04ad-0919-49ee-86f0-40c0e040dc0e': 'trenger-originalen-begrenset',
  'b24baf59-55c9-48df-b8c1-7d93e098a95d': 'trenger-delvis-besvart',
  '8d1b4043-5a9e-4225-9ba8-5dc22f515796': 'trenger-forhaandsutfyll',
  '342dfa81-c05e-4477-9214-d007c403b60a': 'trenger-to-arbeidsforhold',
  '66f1188a-5cb7-4741-bd60-c9070835633c': 'trenger-originalen-16dager-innsendt'
};

export const handlers = [
  http.get('*/api/v1/kvittering/:kvittid', ({ params }) => {
    const { kvittid } = params;
    const mockdataFile = kvitteringMockdataMap[kvittid] || 'kvittering-bug-endre';
    const data = readMockdata(mockdataFile);

    if (data) {
      return HttpResponse.json(data);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.get('*/api/v1/hent-forespoersel/:foresporselid', ({ params }) => {
    const { foresporselid } = params;
    const mockdataFile = forespoerselMockdataMap[foresporselid] || 'kvittering-bug-endre';
    const data = readMockdata(mockdataFile);

    if (data) {
      return HttpResponse.json(data);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.get('*/api/v1/selvbestemt-inntektsmelding/:foresporselid', ({ params }) => {
    const { foresporselid } = params;
    const mockdataFile = kvitteringAgiMockdataMap[foresporselid] || 'kvittering-bug-endre';
    const data = readMockdata(mockdataFile);

    if (data) {
      return HttpResponse.json(data);
    }
    return new HttpResponse(null, { status: 404 });
  })
];
