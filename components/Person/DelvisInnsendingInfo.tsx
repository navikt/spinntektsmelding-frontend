interface DelvisInnsendingInfoProps {
  erDelvisInnsending?: boolean;
}

export default function DelvisInnsendingInfo({ erDelvisInnsending }: Readonly<DelvisInnsendingInfoProps>) {
  return (
    <>
      {erDelvisInnsending && (
        <p>
          Da dette sykefraværet er innenfor samme arbeidsgiverperiode som forrige sykefravær trenger vi bare informasjon
          om inntekt og refusjon.
        </p>
      )}
    </>
  );
}
