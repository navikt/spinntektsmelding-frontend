import lokalStyling from '../../styles/initiering.module.css';
import { Button } from '@navikt/ds-react';

export default function ButtonBack({
  onClick
}: Readonly<{ onClick: (event: React.MouseEvent<HTMLButtonElement>) => void }>) {
  const handleBackClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onClick(event);
  };
  return (
    <Button variant='tertiary' className={lokalStyling.primaryKnapp} onClick={handleBackClick}>
      Tilbake
    </Button>
  );
}
