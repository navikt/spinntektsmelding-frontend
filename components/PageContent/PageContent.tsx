import '@navikt/ds-css';
import { Link } from '@navikt/ds-react';
import { ReactNode } from 'react';
import Heading1 from '../Heading1/Heading1';
import Heading2 from '../Heading2/Heading2';

interface PageContentProps {
  children: ReactNode;
  title: string;
}

export default function PageContent(props: PageContentProps) {
  return (
    <main role='main' id='maincontent' tabIndex={-1} className='page-content-wrapper main-content'>
      <div className='page-content-breadcrumb skjul-fra-print'>
        <Link>Brødsmulesti</Link> / {props.title}
      </div>
      <div className='page-content-header'>
        <Heading1>Inntektsgrunnlag og fravær</Heading1>
        <Heading2>{props.title}</Heading2>
      </div>
      <div className='page-content-body'>{props.children}</div>
    </main>
  );
}
