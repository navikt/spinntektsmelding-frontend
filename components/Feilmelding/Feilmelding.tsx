import { ExclamationmarkTriangleFillIcon } from '@navikt/aksel-icons';
import ensureValidHtmlId from '../../utils/ensureValidHtmlId';

interface FeilmeldingProps {
  children: React.ReactNode;
  id: string;
}

export default function Feilmelding({ children, id }: Readonly<FeilmeldingProps>) {
  return (
    <div
      id={ensureValidHtmlId('fieldset-error-rd')}
      aria-relevant='additions removals'
      aria-live='polite'
      className='navds-fieldset__error'
    >
      <p className='navds-error-message navds-label navds-error-message--show-icon' id={ensureValidHtmlId(id)}>
        <ExclamationmarkTriangleFillIcon aria-hidden />
        {children}
      </p>
    </div>
  );
}
