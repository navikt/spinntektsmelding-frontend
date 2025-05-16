import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import TidligereInntekt from '../../../components/Bruttoinntekt/TidligereInntekt';
import { HistoriskInntekt } from '../../../schema/historiskInntektSchema';

describe('TidligereInntekt', () => {
  it('renders 3 rows', () => {
    const tidligereinntekt: HistoriskInntekt = new Map([
      ['2020-12', 234],
      ['2020-11', 123],
      ['2021-01', 345]
    ]);
    render(<TidligereInntekt tidligereinntekt={tidligereinntekt} henterData={false} />);

    const rader = screen.getAllByRole('row');

    expect(rader).toHaveLength(4); // Inkluderer header raden

    const seller = screen.getAllByRole('cell');
    expect(seller).toHaveLength(6);
    expect(seller[0]).toHaveTextContent('November');
    expect(seller[1]).toHaveTextContent('123,00 kr');
    expect(seller[2]).toHaveTextContent('Desember');
    expect(seller[3]).toHaveTextContent('234,00 kr');
    expect(seller[4]).toHaveTextContent('Januar');
    expect(seller[5]).toHaveTextContent('345,00 kr');
  });

  it('should have no violations', async () => {
    const tidligereinntekt: HistoriskInntekt = new Map([
      ['2020-12', 234],
      ['2020-11', 123],
      ['2021-01', 345]
    ]);
    const { container } = render(<TidligereInntekt tidligereinntekt={tidligereinntekt} henterData={false} />);

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
