import dynamic from 'next/dynamic';

const BedriftsmenyComponent = dynamic(() => import('@navikt/bedriftsmeny'), {
  ssr: false
});

export default BedriftsmenyComponent;
