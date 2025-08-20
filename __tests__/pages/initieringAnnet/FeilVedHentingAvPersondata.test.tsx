import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FeilVedHentingAvPersondata from '../../../pages/initieringAnnet/FeilVedHentingAvPersondata';

describe('FeilVedHentingAvPersondata', () => {
  it('renders nothing when no errors', () => {
    const { container } = render(<FeilVedHentingAvPersondata fulltNavnMangler={false} orgNavnMangler={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders persondata error only', () => {
    render(<FeilVedHentingAvPersondata fulltNavnMangler={true} orgNavnMangler={false} />);
    const text = screen.getByText(
      'Vi klarer ikke hente navn på den ansatte akkurat nå. Du kan sende inn inntektsmeldingen uansett, men kontroller at fødselsnummer stemmer.'
    );
    expect(text).toBeInTheDocument();
  });

  it('renders orgdata error only', () => {
    render(<FeilVedHentingAvPersondata fulltNavnMangler={false} orgNavnMangler={true} />);
    const text = screen.getByText(
      'Vi klarer ikke hente navn på bedriften akkurat nå. Du kan sende inn inntektsmeldingen uansett, men kontroller at organisasjonsnummer stemmer.'
    );
    expect(text).toBeInTheDocument();
  });

  it('renders both person- and orgdata errors', () => {
    render(<FeilVedHentingAvPersondata fulltNavnMangler={true} orgNavnMangler={true} />);
    const text = screen.getByText(
      'Vi klarer ikke hente navn på den ansatte og bedriften akkurat nå. Du kan sende inn inntektsmeldingen uansett, men kontroller at fødselsnummer og organisasjonsnummer stemmer.'
    );
    expect(text).toBeInTheDocument();
  });
});
