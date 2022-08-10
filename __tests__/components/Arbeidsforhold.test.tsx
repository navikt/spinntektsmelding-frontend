import { render, screen } from '@testing-library/react';
import Arbeidsforhold from '../../components/Arbeidsforhold/Arbeidsforhold';

describe('Arbeidsforhold', () => {
  it('should render', () => {
    render(<Arbeidsforhold />);
    expect(screen);
  });
});
