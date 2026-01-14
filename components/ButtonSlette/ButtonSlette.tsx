import { Button } from '@navikt/ds-react';
import { TrashIcon } from '@navikt/aksel-icons';

interface ButtonSletteProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  title: string;
}

export default function ButtonSlette(props: Readonly<ButtonSletteProps>) {
  let ariaLabel = undefined;
  if (!props.title) {
    ariaLabel = 'Slette';
  }

  return (
    <Button
      className={props.className}
      onClick={props.onClick}
      variant='tertiary'
      icon={<TrashIcon title={props.title} />}
      disabled={props.disabled}
      aria-label={ariaLabel}
    />
  );
}
