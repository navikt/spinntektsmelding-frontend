import { z } from 'zod';

export const NaturalytelseEnumSchema = z
  .enum(
    [
      'AKSJERGRUNNFONDSBEVISTILUNDERKURS',
      'ANNET',
      'BEDRIFTSBARNEHAGEPLASS',
      'BESOEKSREISERHJEMMETANNET',
      'BIL',
      'BOLIG',
      'ELEKTRONISKKOMMUNIKASJON',
      'FRITRANSPORT',
      'INNBETALINGTILUTENLANDSKPENSJONSORDNING',
      'KOSTBESPARELSEIHJEMMET',
      'KOSTDAGER',
      'KOSTDOEGN',
      'LOSJI',
      'OPSJONER',
      'RENTEFORDELLAAN',
      'SKATTEPLIKTIGDELFORSIKRINGER',
      'TILSKUDDBARNEHAGEPLASS',
      'YRKEBILTJENESTLIGBEHOVKILOMETER',
      'YRKEBILTJENESTLIGBEHOVLISTEPRIS'
    ],
    { message: 'Vennligst velg ytelse.' }
  )
  .describe('Vennligst velg ytelse.');
