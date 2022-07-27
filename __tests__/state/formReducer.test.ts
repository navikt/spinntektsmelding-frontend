import formReducer, { initialState } from '../../state/formReducer';
import timezone_mock from 'timezone-mock';
import InntektsmeldingSkjema, { YesNo } from '../../state/state';
import { expect, it, describe } from 'vitest';

describe('formReducer', () => {
  timezone_mock.register('UTC');
  it('should add a fravaersperiode with unique id', () => {
    expect(initialState.fravaersperiode).toBeUndefined();

    const newState = formReducer(initialState, {
      type: 'leggTilFravaersperiode',
      payload: 'arbeidsforholdId'
    });

    expect(newState.fravaersperiode!.arbeidsforholdId.length).toBe(1);
    expect(newState.fravaersperiode!.arbeidsforholdId[0]!.id).toBeTruthy(); // The id is a random textstring

    const newerState = formReducer(newState, {
      type: 'leggTilFravaersperiode',
      payload: 'arbeidsforholdId'
    });

    expect(newerState.fravaersperiode!.arbeidsforholdId.length).toBe(2);
    expect(newerState.fravaersperiode!.arbeidsforholdId[0]!.id).not.toBe(
      newerState.fravaersperiode!.arbeidsforholdId[1]!.id
    ); // The ids should not be equal
  });

  it('should remove a fravaersperiode the correct id', () => {
    expect(initialState.fravaersperiode).toBeUndefined();

    const newState = formReducer(initialState, {
      type: 'leggTilFravaersperiode',
      payload: 'arbeidsforholdId'
    });

    expect(newState.fravaersperiode!.arbeidsforholdId.length).toBe(1);

    const newerState = formReducer(newState, {
      type: 'leggTilFravaersperiode',
      payload: 'arbeidsforholdId'
    });

    expect(newerState.fravaersperiode!.arbeidsforholdId.length).toBe(2);

    const periodeId = newerState.fravaersperiode!.arbeidsforholdId[0]!.id;
    const remainingPeriodeId = newerState.fravaersperiode!.arbeidsforholdId[1]!.id;

    const evenNewerState = formReducer(newerState, {
      type: 'slettFravaersperiode',
      payload: periodeId
    });

    expect(evenNewerState.fravaersperiode!.arbeidsforholdId.length).toBe(1);
    expect(evenNewerState.fravaersperiode!.arbeidsforholdId[0]!.id).toEqual(remainingPeriodeId);
  });

  it('should set fraværsperiode fra to payload', () => {
    const newState = formReducer(initialState, {
      type: 'leggTilFravaersperiode',
      payload: 'arbeidsforholdId'
    });

    const firstPeriode = newState.fravaersperiode!.arbeidsforholdId[0]!.id;

    const newerState = formReducer(newState, {
      type: 'setFravaersperiodeFraDato',
      payload: {
        periodeId: firstPeriode,
        value: '2002-02-02',
        arbeidsforholdId: 'arbeidsforholdId'
      }
    });

    expect(newerState.fravaersperiode!.arbeidsforholdId[0]!.fra).toEqual(new Date('2002-02-02'));
  });

  it('should set fraværsperiode til to payload', () => {
    const newState = formReducer(initialState, {
      type: 'leggTilFravaersperiode',
      payload: 'arbeidsforholdId'
    });

    const firstPeriode = newState.fravaersperiode!.arbeidsforholdId[0]!.id;

    const newerState = formReducer(newState, {
      type: 'setFravaersperiodeTilDato',
      payload: {
        periodeId: firstPeriode,
        value: '2002-02-02',
        arbeidsforholdId: 'arbeidsforholdId'
      }
    });

    expect(newerState.fravaersperiode!.arbeidsforholdId[0]!.til).toEqual(new Date('2002-02-02'));
  });

  it('should add a egenmeldingsperioder with unique id', () => {
    expect(initialState.egenmeldingsperioder.ukjent.length).toBe(1);

    const newState = formReducer(initialState, {
      type: 'leggTilEgenmeldingsperiode',
      payload: 'ukjent'
    });

    expect(newState.egenmeldingsperioder.ukjent.length).toBe(2);
    expect(newState.egenmeldingsperioder.ukjent[0].id).toBeTruthy(); // The id is a random textstring
    expect(newState.egenmeldingsperioder.ukjent[1].id).toBeTruthy(); // The id is a random textstring
    expect(newState.egenmeldingsperioder.ukjent[0].id).not.toBe(newState.egenmeldingsperioder.ukjent[1].id); // The ids should not be equal
  });

  it('should remove a egenmeldingsperioder the correct id', () => {
    expect(initialState.egenmeldingsperioder.ukjent.length).toBe(1);

    const newState = formReducer(initialState, {
      type: 'leggTilEgenmeldingsperiode',
      payload: 'ukjent'
    });

    expect(newState.egenmeldingsperioder.ukjent.length).toBe(2);

    const periodeId = newState.egenmeldingsperioder.ukjent[0].id;
    const remainingPeriodeId = newState.egenmeldingsperioder.ukjent[1].id;

    const evenNewerState = formReducer(newState, {
      type: 'slettEgenmeldingsperiode',
      payload: periodeId
    });

    expect(evenNewerState.egenmeldingsperioder.ukjent.length).toBe(1);
    expect(evenNewerState.egenmeldingsperioder.ukjent[0].id).toEqual(remainingPeriodeId);
  });

  it('should toggle the status of the lonnISykefravaeret', () => {
    const newState = formReducer(initialState, {
      type: 'toggleBetalerArbeidsgiverHeleEllerDeler',
      payload: {
        status: 'Ja',
        arbeidsforholdId: 'ukjent'
      }
    });

    expect(newState.lonnISykefravaeret).toEqual({ ukjent: { status: 'Ja' } });

    const newerState = formReducer(newState, {
      type: 'toggleBetalerArbeidsgiverHeleEllerDeler',
      payload: {
        status: 'Nei',
        arbeidsforholdId: 'ukjent'
      }
    });

    expect(newerState.lonnISykefravaeret).toEqual({ ukjent: { status: 'Nei' } });
  });

  it('should toggle the status of the fullLonnIArbeidsgiverPerioden', () => {
    const newState = formReducer(initialState, {
      type: 'toggleBetalerArbeidsgiverFullLonnIArbeidsgiverperioden',
      payload: {
        status: 'Ja',
        arbeidsforholdId: 'ukjent'
      }
    });

    expect(newState.fullLonnIArbeidsgiverPerioden).toEqual({ ukjent: { status: 'Ja' } });

    const newerState = formReducer(newState, {
      type: 'toggleBetalerArbeidsgiverFullLonnIArbeidsgiverperioden',
      payload: {
        status: 'Nei',
        arbeidsforholdId: 'ukjent'
      }
    });

    expect(newerState.fullLonnIArbeidsgiverPerioden).toEqual({ ukjent: { status: 'Nei' } });
  });

  it('should add the first row to naturalytelser and then delete it', () => {
    const newState = formReducer(initialState, {
      type: 'toggleNaturalytelser',
      payload: true
    });

    expect(newState.naturalytelser?.length).toBe(1);

    const newerState = formReducer(newState, {
      type: 'toggleNaturalytelser',
      payload: false
    });

    expect(newerState.naturalytelser).toBeUndefined();
  });

  it('should add the first row to naturalytelser, add a new row and then delete the first row', () => {
    const newState = formReducer(initialState, {
      type: 'toggleNaturalytelser',
      payload: true
    });

    expect(newState.naturalytelser?.length).toBe(1);

    const newerState = formReducer(newState, {
      type: 'leggTilNaturalytelseRad'
    });

    expect(newerState.naturalytelser?.length).toBe(2);

    const firstId = newerState.naturalytelser![0].id;
    const secondId = newerState.naturalytelser![1].id;

    expect(firstId).not.toEqual(secondId);

    const evenNewerState = formReducer(newerState, {
      type: 'slettNaturalytelse',
      payload: firstId
    });

    expect(evenNewerState.naturalytelser?.length).toBe(1);
    expect(evenNewerState.naturalytelser![0].id).toEqual(secondId);
  });

  it('should toggleOpplysningerBekreftet by setting its value to payload', () => {
    const newState = formReducer(initialState, {
      type: 'toggleOpplysningerBekreftet',
      payload: true
    });

    expect(newState.opplysningerBekreftet).toBe(true);

    const newerState = formReducer(newState, {
      type: 'toggleOpplysningerBekreftet',
      payload: false
    });

    expect(newerState.opplysningerBekreftet).toBe(false);
  });

  it('should set egenmeldingsperioder fra to payload', () => {
    const firstPeriode = initialState.egenmeldingsperioder.ukjent[0].id;

    const newState = formReducer(initialState, {
      type: 'setEgenmeldingFraDato',
      payload: {
        periodeId: firstPeriode,
        value: '2002-02-02'
      }
    });

    expect(newState.egenmeldingsperioder.ukjent[0].fra).toEqual(new Date('2002-02-02'));
  });

  it('should set egenmeldingsperioder til to payload', () => {
    const firstPeriode = initialState.egenmeldingsperioder.ukjent[0].id;

    const newState = formReducer(initialState, {
      type: 'setEgenmeldingTilDato',
      payload: {
        periodeId: firstPeriode,
        value: '2002-02-02'
      }
    });

    expect(newState.egenmeldingsperioder.ukjent[0].til).toEqual(new Date('2002-02-02'));
  });

  it('should set naturalytelser type to payload', () => {
    const preState = formReducer(initialState, {
      type: 'toggleNaturalytelser',
      payload: true
    });

    const firstPeriode = preState.naturalytelser![0].id;

    const newState = formReducer(preState, {
      type: 'setNaturalytelseType',
      payload: {
        ytelseId: firstPeriode,
        value: 'Ytelse'
      }
    });

    expect(newState.naturalytelser![0].type).toBe('Ytelse');
  });

  it('should set naturalytelser dato to payload', () => {
    const preState = formReducer(initialState, {
      type: 'toggleNaturalytelser',
      payload: true
    });

    const firstPeriode = preState.naturalytelser![0].id;

    const newState = formReducer(preState, {
      type: 'setNaturalytelseDato',
      payload: {
        ytelseId: firstPeriode,
        value: '2002-02-02'
      }
    });

    expect(newState.naturalytelser![0].bortfallsdato).toEqual(new Date('2002-02-02'));
  });

  it('should set naturalytelser verdi to payload', () => {
    const preState = formReducer(initialState, {
      type: 'toggleNaturalytelser',
      payload: true
    });

    const firstPeriode = preState.naturalytelser![0].id;

    const newState = formReducer(preState, {
      type: 'setNaturalytelseVerdi',
      payload: {
        ytelseId: firstPeriode,
        value: '123.4'
      }
    });

    expect(newState.naturalytelser![0].verdi).toBe(123.4);
  });

  it('should set orgnrUnderenhet og virksomhetsnavn verdi payload', () => {
    const newState = formReducer(initialState, {
      type: 'setOrganisasjonUnderenhet',
      payload: {
        OrganizationNumber: '123456789',
        Name: 'OrgNavn',
        Type: 'Type',
        OrganizationForm: 'OrganizationForm',
        Status: 'Status',
        ParentOrganizationNumber: '987654321'
      }
    });

    expect(newState.orgnrUnderenhet).toBe('123456789');
    expect(newState.virksomhetsnavn).toBe('OrgNavn');
  });

  it('should set bruttoinntekt og state to close modal', () => {
    const initialStateWithOpenModal: InntektsmeldingSkjema = structuredClone(initialState);

    const newState = formReducer(initialStateWithOpenModal, {
      type: 'setOppdatertMaanedsinntekt',
      payload: '1234'
    });

    expect(newState.bruttoinntekt).toEqual({
      bruttoInntekt: 1234,
      bekreftet: false,
      manueltKorrigert: true,
      endringsaarsak: ''
    });
  });
});
