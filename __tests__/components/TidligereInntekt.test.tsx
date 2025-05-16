import { render, screen } from '@testing-library/react';
import TidligereInntekt from '../../components/Bruttoinntekt/TidligereInntekt';
import { HistoriskInntekt } from '../../schema/historiskInntektSchema';
import { vi } from 'vitest';

vi.mock('@navikt/ds-react', async () => {
  const mod = await vi.importActual<typeof import('@navikt/ds-react')>('@navikt/ds-react');
  return {
    ...mod,
    Skeleton: vi.fn().mockImplementation(() => <div>Skeleton</div>)
  };
});

vi.mock('../../utils/formatCurrency', async () => {
  return {
    default: vi.fn().mockImplementation((prop) => prop)
  };
});

vi.mock('../../utils/formatMaanedsnavn', async () => {
  return {
    default: vi.fn().mockImplementation((prop) => prop)
  };
});

describe('TidligereInntekt', () => {
  const tidligereinntekt: HistoriskInntekt = new Map([
    ['2021-01', 10000],
    ['2021-02', 20000],
    ['2021-03', 30000]
  ]);

  it('should render the table with the correct data', () => {
    render(<TidligereInntekt tidligereinntekt={tidligereinntekt} henterData={false} />);

    const table = screen.getByRole('table');
    const rows = screen.getAllByRole('row');

    expect(table).toBeInTheDocument();
    expect(rows).toHaveLength(4); // 1 header row + 3 data rows

    // Check header row
    const headerRow = rows[0];
    const headerCells = headerRow.querySelectorAll('th');
    expect(headerCells).toHaveLength(2);
    expect(headerCells[0]).toHaveTextContent('Måned');
    expect(headerCells[1]).toHaveTextContent('Inntekt');

    // Check data rows
    const dataRows = rows.slice(1);
    expect(dataRows).toHaveLength(3);

    const arrInntekter = Array.from(tidligereinntekt);

    dataRows.forEach((row, index) => {
      const cells = row.querySelectorAll('td');
      expect(cells).toHaveLength(2);
      expect(cells[0]).toHaveTextContent(arrInntekter[index][0]);
      expect(cells[1]).toHaveTextContent(`${arrInntekter[index][1]} kr`);
    });
  });

  it('should render the loading skeleton when henterData is true', () => {
    render(<TidligereInntekt tidligereinntekt={[]} henterData={true} />);

    const table = screen.getByRole('table');
    const rows = screen.getAllByRole('row');

    expect(table).toBeInTheDocument();
    expect(rows).toHaveLength(4); // 1 header row + 3 skeleton rows

    // Check header row
    const headerRow = rows[0];
    const headerCells = headerRow.querySelectorAll('th');
    expect(headerCells).toHaveLength(2);
    expect(headerCells[0]).toHaveTextContent('Måned');
    expect(headerCells[1]).toHaveTextContent('Inntekt');

    // Check skeleton rows
    const skeletonRows = rows.slice(1);
    expect(skeletonRows).toHaveLength(3);

    skeletonRows.forEach((row) => {
      const cells = row.querySelectorAll('td');
      expect(cells).toHaveLength(2);
      expect(cells[0]).toContainHTML('<div>Skeleton</div>');
      expect(cells[1]).toContainHTML('<div>Skeleton</div>');
    });
  });

  it('should render "-" for invalid or negative inntekt values', () => {
    const invalidInntekt = new Map([
      ['2021-01', undefined],
      ['2021-02', -10000],
      ['2021-03', 0]
    ]);

    render(<TidligereInntekt tidligereinntekt={invalidInntekt} henterData={false} />);

    const table = screen.getByRole('table');
    const rows = screen.getAllByRole('row');

    expect(table).toBeInTheDocument();
    expect(rows).toHaveLength(4); // 1 header row + 3 data rows

    // Check header row
    const headerRow = rows[0];
    const headerCells = headerRow.querySelectorAll('th');
    expect(headerCells).toHaveLength(2);
    expect(headerCells[0]).toHaveTextContent('Måned');
    expect(headerCells[1]).toHaveTextContent('Inntekt');

    // Check data rows
    const dataRows = rows.slice(1);
    expect(dataRows).toHaveLength(3);

    const arrInntekter = Array.from(invalidInntekt);

    dataRows.forEach((row, index) => {
      const cells = row.querySelectorAll('td');
      expect(cells).toHaveLength(2);
      expect(cells[0]).toHaveTextContent(arrInntekter[index][0]);
      if (index === 0) {
        expect(cells[1]).toHaveTextContent('-');
        return;
      }
    });
  });
});
