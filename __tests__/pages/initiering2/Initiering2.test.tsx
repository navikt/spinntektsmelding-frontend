import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import Initiering2 from '../../../pages/initiering2/index';
import { vi, expect, Mock } from 'vitest';
// import { create } from 'zustand';
import useBoundStore from '../../../state/useBoundStore';

const mockLocationReplace = vi.fn();
Object.defineProperty(window, 'location', {
  value: { hostname: 'some-hostname', href: 'some-href', replace: mockLocationReplace },
  writable: true
});

vi.mock('../../../state/useBoundStore');

// const mocks = vi.hoisted(() => {
//   const useStore = create((set, get) => ({
//     identitetsnummer: '12345678910',
//     arbeidsforhold: [
//       {
//         arbeidsgiver: 'Arbeidsgiver AS',
//         arbeidsgiverOrgnummer: '123456789',
//         arbeidsforholdId: '123456789',
//         fom: '2021-01-01',
//         tom: '2021-12-31'
//       }
//     ]
//     // foo_set: (value) => set(() => ({ foo: "mocked set foo" })),
//   }));

//   return {
//     __esModule: true,
//     default: useStore(args)
//   };
// });

// vi.mock('../../../state/useBoundStore', (args: any) => {
//   const useStore = create((set, get) => ({
//     identitetsnummer: '12345678910',
//     arbeidsforhold: [
//       {
//         arbeidsgiver: 'Arbeidsgiver AS',
//         arbeidsgiverOrgnummer: '123456789',
//         arbeidsforholdId: '123456789',
//         fom: '2021-01-01',
//         tom: '2021-12-31'
//       }
//     ]
//     // foo_set: (value) => set(() => ({ foo: "mocked set foo" })),
//   }));
//   return {
//     __esModule: true,
//     default: useStore(args)
//   };

// return {
//   __esModule: true,
//   default: vi.fn(),
//   state: {
//     identitetsnummer: '12345678910',
//     arbeidsforhold: [
//       {
//         arbeidsgiver: 'Arbeidsgiver AS',
//         arbeidsgiverOrgnummer: '123456789',
//         arbeidsforholdId: '123456789',
//         fom: '2021-01-01',
//         tom: '2021-12-31'
//       }
//     ]
//   }
// };
// });

describe('Initiering2', () => {
  beforeEach(() => {
    const setIdentitetsnummer = useBoundStore((state) => state.setIdentitetsnummer);
    setIdentitetsnummer('12345678910');
    (useBoundStore as Mock).mockReturnValue({
      state: {
        identitetsnummer: '12345678910',
        arbeidsforhold: [
          {
            arbeidsgiver: 'Arbeidsgiver AS',
            arbeidsgiverOrgnummer: '123456789',
            arbeidsforholdId: '123456789',
            fom: '2021-01-01',
            tom: '2021-12-31'
          }
        ]
      }
    });
  });

  it('renders the buttons', () => {
    const { getByRole } = render(<Initiering2></Initiering2>);

    const backButton = getByRole('button', { name: 'Tilbake' });
    expect(backButton).toBeInTheDocument();

    const nextButton = getByRole('button', { name: 'Neste' });
    expect(nextButton).toBeInTheDocument();
  });

  // it('applies top padding when topPadded prop is true', () => {
  //   const { getByRole } = render(<Initiering2></Initiering2>);
  //   const heading = getByRole('heading', { level: 3 });
  //   expect(heading).toHaveClass('heading');
  //   expect(heading).toHaveClass('heading_top');
  // });

  // it('does not apply padding when unPadded prop is true', () => {
  //   const { getByRole } = render(<Initiering2></Initiering2>);
  //   const heading = getByRole('heading', { level: 3 });
  //   expect(heading).not.toHaveClass('heading');
  // });

  it('passes a11y testing', async () => {
    const { container } = render(<Initiering2></Initiering2>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
