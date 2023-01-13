import useBoundStore from '../state/useBoundStore';

export interface ErrorResponse {
  property: string;
  error: string;
  value: string;
}

export default function useErrorRespons() {
  const leggTilFeilmelding = useBoundStore((state) => state.leggTilFeilmelding);

  return (errors: Array<ErrorResponse>) => {
    errors.forEach((error) => {
      switch (error.property) {
        case 'inntekt.beregnetInntekt': {
          leggTilFeilmelding('bruttoinntekt-endringsbelop', error.error);
          break;
        }

        default:
          leggTilFeilmelding('ukjent', error.error);
          break;
      }
    });
  };
}
