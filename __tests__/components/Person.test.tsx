import { render, fireEvent } from '@testing-library/react';
import Person from '../../components/Person/Person';

describe('Person component', () => {
  it('renders correctly with erKvittering=false', () => {
    const { getByText } = render(<Person erKvittering={false} />);
    expect(getByText(/For at vi skal utbetale riktig beløp i forbindelse med sykmelding/)).toBeInTheDocument();
  });

  it('renders correctly with erKvittering=true', () => {
    const { queryByText } = render(<Person erKvittering={true} />);
    expect(queryByText('For at vi skal utbetale riktig beløp i forbindelse med sykmelding')).not.toBeInTheDocument();
  });
});
