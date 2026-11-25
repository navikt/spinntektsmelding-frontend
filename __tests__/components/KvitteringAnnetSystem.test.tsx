import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import KvitteringAnnetSystem from '../../components/KvitteringAnnetSystem/KvitteringAnnetSystem';

describe('KvitteringAnnetSystem', () => {
  it('should render the component with the correct props', () => {
    const props = {
      kvitteringId: 'D6D62C67-3456-41B9-9032-4B4FADC30754'
    };

    const { getByText } = render(
      <KvitteringAnnetSystem {...(props as React.ComponentProps<typeof KvitteringAnnetSystem>)} />
    );

    expect(getByText('Mottatt inntektsmelding')).toBeInTheDocument();
    expect(getByText('Denne inntektsmeldingen er mottatt fra et eksternt system')).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const props = {
      kvitteringId: 'D6D62C67-3456-41B9-9032-4B4FADC30754'
    };
    const { container } = render(
      <KvitteringAnnetSystem {...(props as React.ComponentProps<typeof KvitteringAnnetSystem>)} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
