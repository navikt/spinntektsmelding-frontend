interface LenkeEksterntProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}

export default function LenkeEksternt(props: LenkeEksterntProps) {
  return (
    <a target='_blank' rel='noopener noreferrer' {...props}>
      {props.children}
    </a>
  );
}
