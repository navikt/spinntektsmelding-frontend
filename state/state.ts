import { z } from 'zod';

import { EndringAarsak } from '../validators/validerAapenInnsending';
import { BegrunnelseRedusertLoennIAgp } from '../schema/begrunnelseRedusertLoennIAgp';
import naturalytelserSchema from '../schema/naturalytelserSchema';

export interface Periode {
  fom?: Date;
  tom?: Date;
  id: string;
}

export type YesNo = 'Ja' | 'Nei';

export interface Inntekt {
  bruttoInntekt?: number;
  manueltKorrigert: boolean;
  endringAarsak?: EndringAarsak;
  endringAarsaker?: Array<EndringAarsak>;
}

export interface HistoriskInntekt {
  maaned: string;
  inntekt: number | null;
}

export interface LonnISykefravaeret {
  status?: YesNo;
  beloep?: number;
}

const begrunnelseRedusertLoennIAgp = z.enum(BegrunnelseRedusertLoennIAgp);
export type Begrunnelse = z.infer<typeof begrunnelseRedusertLoennIAgp>;

export interface LonnIArbeidsgiverperioden {
  status?: YesNo;
  begrunnelse?: Begrunnelse;
  utbetalt?: number | null;
}

export type Naturalytelse = z.infer<typeof naturalytelserSchema>;
