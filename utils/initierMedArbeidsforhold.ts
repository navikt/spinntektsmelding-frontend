import type { SoeknadArbeidstaker } from '../schema/EndepunktSykepengesoeknaderSchema';
import { SkjemaStatus } from '../state/useSkjemadataStore';
import { SelvbestemtTypeConst } from '../schema/konstanter/selvbestemtType';

type Actions = Readonly<{
  initPerson: (navn: string | null, identitetsnummer: string, orgnrUnderenhet: string, orgNavn: string | null) => void;
  setSkjemaStatus: (status: SkjemaStatus) => void;
  initFravaersperiode: (perioder: Array<{ fom: string; tom: string }>) => void;
  initEgenmeldingsperiode: (perioder: Array<{ fom: string; tom: string }>) => void;
  tilbakestillArbeidsgiverperiode: () => void;
  setVedtaksperiodeId: (id: string) => void;
  setSelvbestemtType: (type: typeof SelvbestemtTypeConst.MedArbeidsforhold) => void;
  setHarGradertSykmelding: (gradert: boolean) => void;
}>;

type PersonData = Readonly<{
  fulltNavn: string;
  personnummer: string;
  organisasjonsnummer: string;
  orgNavn: string | null;
}>;

export default function initierMedArbeidsforhold(
  actions: Actions,
  personData: PersonData,
  sykmeldingsperioder: SoeknadArbeidstaker[]
): void {
  actions.initPerson(personData.fulltNavn, personData.personnummer, personData.organisasjonsnummer, personData.orgNavn);
  actions.setSkjemaStatus(SkjemaStatus.SELVBESTEMT);
  actions.initFravaersperiode(sykmeldingsperioder.map((periode) => periode.sykmeldingsperiode));
  actions.initEgenmeldingsperiode(sykmeldingsperioder.flatMap((periode) => periode.egenmeldingsperioder));
  actions.tilbakestillArbeidsgiverperiode();
  actions.setVedtaksperiodeId(sykmeldingsperioder[0].vedtaksperiodeId);
  actions.setSelvbestemtType(SelvbestemtTypeConst.MedArbeidsforhold);
  actions.setHarGradertSykmelding(sykmeldingsperioder.some((periode) => periode.erGradert));
}
