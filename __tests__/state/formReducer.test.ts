import formReducer, { initialState } from '../../state/formReducer';
import produce from 'immer';
import timezone_mock from 'timezone-mock';
import InntektsmeldingSkjema from '../../state/state';

describe('formReducer', () => {
  timezone_mock.register('UTC');
  it('should add a fravaersperiode with unique id', () => {
    expect(initialState.fravaersperiode.length).toBe(1);

    const newState = produce(initialState, (state) =>
      formReducer(state, {
        type: 'leggTilFravaersperiode'
      })
    );

    expect(newState.fravaersperiode.length).toBe(2);
    expect(newState.fravaersperiode[0].id).toBeTruthy(); // The id is a random textstring
    expect(newState.fravaersperiode[1].id).toBeTruthy(); // The id is a random textstring
    expect(newState.fravaersperiode[0].id).not.toBe(newState.fravaersperiode[1].id); // The ids should not be equal
  });

  it('should remove a fravaersperiode the correct id', () => {
    expect(initialState.fravaersperiode.length).toBe(1);

    const newState = produce(initialState, (state) =>
      formReducer(state, {
        type: 'leggTilFravaersperiode'
      })
    );

    expect(newState.fravaersperiode.length).toBe(2);

    const periodeId = newState.fravaersperiode[0].id;
    const remainingPeriodeId = newState.fravaersperiode[1].id;

    const evenNewerState = produce(newState, (state) =>
      formReducer(state, {
        type: 'slettFravaersperiode',
        payload: periodeId
      })
    );

    expect(evenNewerState.fravaersperiode.length).toBe(1);
    expect(evenNewerState.fravaersperiode[0].id).toEqual(remainingPeriodeId);
  });

  it('should set fraværsperiode fra to payload', () => {
    const firstPeriode = initialState.fravaersperiode[0].id;

    const newState = produce(initialState, (state) =>
      formReducer(state, {
        type: 'setFravaersperiodeFraDato',
        payload: {
          periodeId: firstPeriode,
          value: '2002-02-02'
        }
      })
    );

    expect(newState.fravaersperiode[0].fra).toEqual(new Date('2002-02-02'));
  });

  it('should set fraværsperiode til to payload', () => {
    const firstPeriode = initialState.fravaersperiode[0].id;

    const newState = produce(initialState, (state) =>
      formReducer(state, {
        type: 'setFravaersperiodeTilDato',
        payload: {
          periodeId: firstPeriode,
          value: '2002-02-02'
        }
      })
    );

    expect(newState.fravaersperiode[0].til).toEqual(new Date('2002-02-02'));
  });

  it('should add a egenmeldingsperioder with unique id', () => {
    expect(initialState.egenmeldingsperioder.length).toBe(1);

    const newState = produce(initialState, (state) =>
      formReducer(state, {
        type: 'leggTilEgenmeldingsperiode'
      })
    );

    expect(newState.egenmeldingsperioder.length).toBe(2);
    expect(newState.egenmeldingsperioder[0].id).toBeTruthy(); // The id is a random textstring
    expect(newState.egenmeldingsperioder[1].id).toBeTruthy(); // The id is a random textstring
    expect(newState.egenmeldingsperioder[0].id).not.toBe(newState.egenmeldingsperioder[1].id); // The ids should not be equal
  });

  it('should remove a egenmeldingsperioder the correct id', () => {
    expect(initialState.egenmeldingsperioder.length).toBe(1);

    const newState = produce(initialState, (state) =>
      formReducer(state, {
        type: 'leggTilEgenmeldingsperiode'
      })
    );

    expect(newState.egenmeldingsperioder.length).toBe(2);

    const periodeId = newState.egenmeldingsperioder[0].id;
    const remainingPeriodeId = newState.egenmeldingsperioder[1].id;

    const evenNewerState = produce(newState, (state) =>
      formReducer(state, {
        type: 'slettEgenmeldingsperiode',
        payload: periodeId
      })
    );

    expect(evenNewerState.egenmeldingsperioder.length).toBe(1);
    expect(evenNewerState.egenmeldingsperioder[0].id).toEqual(remainingPeriodeId);
  });

  it('should toggle the status of the lonnISykefravaeret', () => {
    const newState = produce(initialState, (state) =>
      formReducer(state, {
        type: 'toggleBetalerArbeidsgiverHeleEllerDeler',
        payload: 'Ja'
      })
    );

    expect(newState.lonnISykefravaeret).toEqual({ status: 'Ja' });

    const newerState = produce(newState, (state) =>
      formReducer(state, {
        type: 'toggleBetalerArbeidsgiverHeleEllerDeler',
        payload: 'Nei'
      })
    );

    expect(newerState.lonnISykefravaeret).toEqual({ status: 'Nei' });
  });

  it('should toggle the status of the fullLonnIArbeidsgiverPerioden', () => {
    const newState = produce(initialState, (state) =>
      formReducer(state, {
        type: 'toggleBetalerArbeidsgiverFullLonnIArbeidsgiverperioden',
        payload: 'Ja'
      })
    );

    expect(newState.fullLonnIArbeidsgiverPerioden).toEqual({ status: 'Ja' });

    const newerState = produce(newState, (state) =>
      formReducer(state, {
        type: 'toggleBetalerArbeidsgiverFullLonnIArbeidsgiverperioden',
        payload: 'Nei'
      })
    );

    expect(newerState.fullLonnIArbeidsgiverPerioden).toEqual({ status: 'Nei' });
  });

  it('should add the first row to naturalytelser and then delete it', () => {
    const newState = produce(initialState, (state) =>
      formReducer(state, {
        type: 'toggleNaturalytelser',
        payload: true
      })
    );

    expect(newState.naturalytelser?.length).toBe(1);

    const newerState = produce(newState, (state) =>
      formReducer(state, {
        type: 'toggleNaturalytelser',
        payload: false
      })
    );

    expect(newerState.naturalytelser).toBeUndefined();
  });

  it('should add the first row to naturalytelser, add a new row and then delete the first row', () => {
    const newState = produce(
      initialState,
      (
        state // Initialise by adding the first row
      ) =>
        formReducer(state, {
          type: 'toggleNaturalytelser',
          payload: true
        })
    );

    expect(newState.naturalytelser?.length).toBe(1);

    const newerState = produce(
      newState,
      (
        state // Add a row
      ) =>
        formReducer(state, {
          type: 'leggTilNaturalytelseRad'
        })
    );

    expect(newerState.naturalytelser?.length).toBe(2);

    const firstId = newerState.naturalytelser![0].id;
    const secondId = newerState.naturalytelser![1].id;

    expect(firstId).not.toEqual(secondId);

    const evenNewerState = produce(
      newerState,
      (
        state // Remove the forst row, identified by its Id
      ) =>
        formReducer(state, {
          type: 'slettNaturalytelse',
          payload: firstId
        })
    );

    expect(evenNewerState.naturalytelser?.length).toBe(1);
    expect(evenNewerState.naturalytelser![0].id).toEqual(secondId);
  });

  it('should toggleOpplysningerBekreftet by setting its value to payload', () => {
    const newState = produce(initialState, (state) =>
      formReducer(state, {
        type: 'toggleOpplysningerBekreftet',
        payload: true
      })
    );

    expect(newState.opplysningerBekreftet).toBe(true);

    const newerState = produce(newState, (state) =>
      formReducer(state, {
        type: 'toggleOpplysningerBekreftet',
        payload: false
      })
    );

    expect(newerState.opplysningerBekreftet).toBe(false);
  });

  it('should set egenmeldingsperioder fra to payload', () => {
    const firstPeriode = initialState.egenmeldingsperioder[0].id;

    const newState = produce(initialState, (state) =>
      formReducer(state, {
        type: 'setEgenmeldingFraDato',
        payload: {
          periodeId: firstPeriode,
          value: '2002-02-02'
        }
      })
    );

    expect(newState.egenmeldingsperioder[0].fra).toEqual(new Date('2002-02-02'));
  });

  it('should set egenmeldingsperioder til to payload', () => {
    const firstPeriode = initialState.egenmeldingsperioder[0].id;

    const newState = produce(initialState, (state) =>
      formReducer(state, {
        type: 'setEgenmeldingTilDato',
        payload: {
          periodeId: firstPeriode,
          value: '2002-02-02'
        }
      })
    );

    expect(newState.egenmeldingsperioder[0].til).toEqual(new Date('2002-02-02'));
  });

  it('should set naturalytelser type to payload', () => {
    const preState = produce(
      initialState,
      (
        state // Initialise by adding the first row
      ) =>
        formReducer(state, {
          type: 'toggleNaturalytelser',
          payload: true
        })
    );
    const firstPeriode = preState.naturalytelser![0].id;

    const newState = produce(preState, (state) =>
      formReducer(state, {
        type: 'setNaturalytelseType',
        payload: {
          ytelseId: firstPeriode,
          value: 'Ytelse'
        }
      })
    );

    expect(newState.naturalytelser![0].type).toBe('Ytelse');
  });

  it('should set naturalytelser dato to payload', () => {
    const preState = produce(
      initialState,
      (
        state // Initialise by adding the first row
      ) =>
        formReducer(state, {
          type: 'toggleNaturalytelser',
          payload: true
        })
    );
    const firstPeriode = preState.naturalytelser![0].id;

    const newState = produce(preState, (state) =>
      formReducer(state, {
        type: 'setNaturalytelseDato',
        payload: {
          ytelseId: firstPeriode,
          value: '2002-02-02'
        }
      })
    );

    expect(newState.naturalytelser![0].bortfallsdato).toEqual(new Date('2002-02-02'));
  });

  it('should set naturalytelser verdi to payload', () => {
    const preState = produce(
      initialState,
      (
        state // Initialise by adding the first row
      ) =>
        formReducer(state, {
          type: 'toggleNaturalytelser',
          payload: true
        })
    );
    const firstPeriode = preState.naturalytelser![0].id;

    const newState = produce(preState, (state) =>
      formReducer(state, {
        type: 'setNaturalytelseVerdi',
        payload: {
          ytelseId: firstPeriode,
          value: '123.4'
        }
      })
    );

    expect(newState.naturalytelser![0].verdi).toBe(123.4);
  });

  it('should set orgnrUnderenhet og virksomhetsnavn verdi payload', () => {
    const newState = produce(initialState, (state) =>
      formReducer(state, {
        type: 'setOrganisasjonUnderenhet',
        payload: {
          OrganizationNumber: '123456789',
          Name: 'OrgNavn',
          Type: 'Type',
          OrganizationForm: 'OrganizationForm',
          Status: 'Status',
          ParentOrganizationNumber: '987654321'
        }
      })
    );

    expect(newState.orgnrUnderenhet).toBe('123456789');
    expect(newState.virksomhetsnavn).toBe('OrgNavn');
  });

  it('should set bruttoinntekt og state to close modal', () => {
    const initialStateWithOpenModal: InntektsmeldingSkjema = JSON.parse(JSON.stringify(initialState));

    const newState = produce(initialStateWithOpenModal, (state) =>
      formReducer(state, {
        type: 'setOppdatertMaanedsinntekt',
        payload: '1234'
      })
    );

    expect(newState.bruttoinntekt).toEqual({
      bruttoInntekt: 1234,
      bekreftet: false,
      manueltKorrigert: true,
      endringsaarsak: ''
    });
  });
});
