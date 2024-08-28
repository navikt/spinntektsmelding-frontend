import '@navikt/ds-css';
import { ReactNode } from 'react';
import env from '../../config/environment';
import { setBreadcrumbs } from '@navikt/nav-dekoratoren-moduler';

interface PageContentProps {
  children: ReactNode;
  title: string;
  jsxItem?: ReactNode;
}

export default function PageContent(props: PageContentProps) {
  setBreadcrumbs([
    {
      title: 'Min side - arbeidsgiver',
      url: `${env.minSideArbeidsgiver}`
    },
    {
      title: 'Saksoversikt',
      url: `${env.saksoversiktUrl}`
    },
    {
      title: props.title,
      url: 'https://www.nav.no'
    }
  ]);
  return (
    <main role='main' id='maincontent' tabIndex={-1} className='page-content-wrapper main-content'>
      <div className='page-content-header'>
        {props.jsxItem && <div className='page-content-header-extra'>{props.jsxItem}</div>}
      </div>
      <div className='page-content-body'>{props.children}</div>
    </main>
  );
}
