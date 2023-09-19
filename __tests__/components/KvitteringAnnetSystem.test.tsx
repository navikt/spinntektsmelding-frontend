import React from 'react';
import { render } from '@testing-library/react';
import KvitteringAnnetSystem from '../../components/KvitteringAnnetSystem/KvitteringAnnetSystem';

describe('KvitteringAnnetSystem', () => {
  it('should render the component with the correct props', () => {
    const props = {
      arkivreferanse: '123456',
      lenkeTilKvittering: 'Kvittering',
      lenkeTilKvitteringHref: 'https://example.com/kvittering',
      eksterntSystem: 'Eksternt system',
      mottattDato: '2022-01-01'
    };

    const { getByText } = render(<KvitteringAnnetSystem {...props} />);

    expect(getByText('Mottatt inntektsmelding')).toBeInTheDocument();
    expect(getByText('Denne inntektsmeldingen er mottatt fra et eksternt system')).toBeInTheDocument();
    expect(getByText(/Vi har mottatt denne inntektsmeldingen fra Eksternt system/)).toBeInTheDocument();
    expect(getByText(`Arkivrefferanse: [${props.arkivreferanse}]`)).toBeInTheDocument();
    expect(getByText(props.lenkeTilKvittering)).toHaveAttribute('href', props.lenkeTilKvitteringHref);
  });

  it('should render the component without optional props', () => {
    const props = {
      eksterntSystem: 'Eksternt system'
    };

    const { getByText, queryByText } = render(<KvitteringAnnetSystem {...props} />);

    expect(getByText('Mottatt inntektsmelding')).toBeInTheDocument();
    expect(getByText('Denne inntektsmeldingen er mottatt fra et eksternt system')).toBeInTheDocument();
    expect(getByText(/Vi har mottatt denne inntektsmeldingen fra Eksternt system/)).toBeInTheDocument();
    expect(queryByText('Arkivrefferanse:')).toBeNull();
    expect(queryByText('Eventuell lenke til kvittering')).toBeNull();
  });
});
