import '@navikt/ds-css';
import { Link, Heading } from '@navikt/ds-react';
import { ReactNode } from 'react';

interface PageContentProps {
  children: ReactNode;
  title: string;
}

export default function PageContent(props: PageContentProps) {
  return (
    <div className='page-content-wrapper'>
      <div className='page-content-breadcrumb'>
        <Link>Breadkrumb</Link> / Breadkrumb
      </div>
      <div className='page-content-header'>
        <Heading size='small' level='2'>
          Inntektsgrunnlag og fravær
        </Heading>
        <Heading size='medium' level='1'>
          {props.title}
        </Heading>
      </div>
      <div className='page-content-body'>{props.children}</div>
    </div>
  );
}
