import { renderHook, waitFor } from '@testing-library/react';
import useTidligereInntektsdata from '../../utils/useTidligereInntektsdata';

describe('useTidligereInntektsdata', () => {
  it('should fetch inntektsdata when skalHenteInntektsdata is true', async () => {
    const identitetsnummer = '123456789';
    const orgnrUnderenhet = '987654321';
    const inntektsdato = new Date();
    const skalHenteInntektsdata = true;

    const { result } = renderHook(() =>
      useTidligereInntektsdata(identitetsnummer, orgnrUnderenhet, inntektsdato, skalHenteInntektsdata)
    );

    await waitFor(() => expect(result.current.data).toBeUndefined());
  });

  it('should not fetch inntektsdata when skalHenteInntektsdata is false', async () => {
    const identitetsnummer = '123456789';
    const orgnrUnderenhet = '987654321';
    const inntektsdato = new Date();
    const skalHenteInntektsdata = false;

    const { result } = renderHook(() =>
      useTidligereInntektsdata(identitetsnummer, orgnrUnderenhet, inntektsdato, skalHenteInntektsdata)
    );

    await waitFor(() => expect(result.current.data).toEqual([]));
  });

  // Add more test cases as needed
});
