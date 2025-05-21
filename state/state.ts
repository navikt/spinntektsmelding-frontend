import { z } from 'zod';

import { EndringAarsak } from '../validators/validerAapenInnsending';
import { BegrunnelseRedusertLoennIAgp } from '../schema/BegrunnelseRedusertLoennIAgpSchema';
import NaturalytelserSchema from '../schema/NaturalytelserSchema';

export interface Periode {
  fom?: Date;
  tom?: Date;
  id: string;
}

export type YesNo = 'Ja' | 'Nei';

export interface Inntekt {
  bruttoInntekt?: number;
  manueltKorrigert: boolean;
  endringAarsaker?: Array<EndringAarsak>;
}

export interface LonnISykefravaeret {
  status?: YesNo;
  beloep?: number;
}

const BegrunnelseRedusertLoennIAgpSchema = z.enum(BegrunnelseRedusertLoennIAgp);
export type Begrunnelse = z.infer<typeof BegrunnelseRedusertLoennIAgpSchema>;

export interface LonnIArbeidsgiverperioden {
  status?: YesNo;
  begrunnelse?: Begrunnelse;
  utbetalt?: number | null;
}

export type Naturalytelse = z.infer<typeof NaturalytelserSchema>;
