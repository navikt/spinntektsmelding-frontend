interface FeilmeldingProps {
  children: React.ReactNode;
  id: string;
}

export default function Feilmelding({ children, id }: Readonly<FeilmeldingProps>) {
  return (
    <div id='fieldset-error-rd' aria-relevant='additions removals' aria-live='polite' className='navds-fieldset__error'>
      <p className='navds-error-message navds-label' id={id}>
        {children}
      </p>
    </div>
  );
}
