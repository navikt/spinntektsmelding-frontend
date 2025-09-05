import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FeilListe, { Feilmelding } from '../../../components/Feilsammendrag/FeilListe';

const headingText = 'Du må rette disse feilene før du kan sende inn.';

describe('FeilListe', () => {
  const base: Feilmelding[] = [
    { felt: 'navn', text: 'Mangler navn' },
    { felt: '  ', text: 'Skal filtreres fordi felt er tomt etter trim' },
    { felt: '9feil', text: 'Skal filtreres fordi felt starter med tall' },
    { felt: 'adresse', text: 'Mangler adresse' }
  ];

  it('filtrerer bort tomme felt og felt som starter med tall', () => {
    render(<FeilListe feilmeldinger={base} skalViseFeilmeldinger={true} />);
    // Heading skal vises
    expect(screen.getByText(headingText)).toBeInTheDocument();
    // Synlige feil
    expect(screen.getByText('Mangler navn')).toBeInTheDocument();
    expect(screen.getByText('Mangler adresse')).toBeInTheDocument();
    // Filtrerte skal ikke vises
    expect(screen.queryByText('Skal filtreres fordi felt er tomt etter trim')).toBeNull();
    expect(screen.queryByText('Skal filtreres fordi felt starter med tall')).toBeNull();
  });

  it('returnerer null når alle feilmeldinger filtreres bort', () => {
    const onlyFiltered: Feilmelding[] = [
      { felt: ' ', text: 'tom' },
      { felt: '1abc', text: 'tall' }
    ];
    const { container } = render(<FeilListe feilmeldinger={onlyFiltered} skalViseFeilmeldinger={true} />);
    expect(container.firstChild).toBeNull();
  });

  it('viser ikke summary når skalViseFeilmeldinger=false selv om det finnes synlige feil', () => {
    const { container } = render(<FeilListe feilmeldinger={base} skalViseFeilmeldinger={false} />);
    expect(screen.queryByText(headingText)).toBeNull();
    // Komponent wrapper returneres (fragment) men ingen ErrorSummary
    expect(container.firstChild).toBeNull();
  });
});
