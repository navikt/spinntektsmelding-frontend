import '@navikt/ds-css';
import { Link } from '@navikt/ds-react';
import { ReactNode } from 'react';
import Heading2 from '../Heading2/Heading2';
import env from '../../config/environment';

interface PageContentProps {
  children: ReactNode;
  title: string;
  jsxItem?: ReactNode;
}

export default function PageContent(props: PageContentProps) {
  return (
    <main role='main' id='maincontent' tabIndex={-1} className='page-content-wrapper main-content'>
      <div className='page-content-breadcrumb skjul-fra-print'>
        <Link href={env.minSideArbeidsgiver}>Min side arbeidsgiver</Link> / {props.title}
      </div>
      <div className='page-content-header'>
        <Heading2>{props.title}</Heading2>
        {props.jsxItem && <div className='page-content-header-extra'>{props.jsxItem}</div>}
      </div>
      <div className='page-content-body'>{props.children}</div>
    </main>
  );
}
