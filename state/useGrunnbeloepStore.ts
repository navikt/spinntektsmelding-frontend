import { StateCreator } from 'zustand';
import produce from 'immer';

import { CompleteState } from './useBoundStore';
import environment from '../config/environment';

export interface IGrunnbelop {
  dato: string;
  gjennomsnittPerAar: number;
  grunnbeloep: number;
  grunnbeloepPerMaaned: number;
  omregningsfaktor: number;
  virkningstidspunktForMinsteinntekt: string;
}

export interface GrunnpeloepState {
  // grunnbeloep?: { [key: string]: number };
  grunnbeloep?: IGrunnbelop;
  getGrunnbeloep: (isoDato?: string) => Promise<void>;
}

const useGrunnbeloepStore: StateCreator<CompleteState, [], [], GrunnpeloepState> = (set, get) => ({
  grunnbeloep: undefined,
  getGrunnbeloep: async (isoDato?: string) => {
    const grunnbeloepUrl = isoDato ? `${environment.grunnbeloepUrl}?dato=${isoDato}` : environment.grunnbeloepUrl;

    const response = await fetch(grunnbeloepUrl, {
      mode: 'cors',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'GET'
    });

    const body = await response.json();

    set(
      produce((state) => {
        state.grunnbeloep = body;
        console.log(body);
        return state;
      })
    );

    // .then(handleStatus)
    // .then((json) => ({
    //   status: HttpStatus.Successfully,
    //   grunnbeloep: json
    // }))
    // .catch((status) => ({
    //   status: status
    // }))
  }
});

export default useGrunnbeloepStore;
