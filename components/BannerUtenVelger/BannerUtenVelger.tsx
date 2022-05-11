import React from 'react';
import '@navikt/bedriftsmeny/lib/bedriftsmeny.css';

interface Props {
  tittelMedUnderTittel: string | JSX.Element;
}

const BannerUtenVelger: React.FunctionComponent<Props> = (props) => {
  return (
    <div className='bedriftsmeny'>
      <div className='bedriftsmeny__inner'>
        <h1 className='typo-innholdstittel bedriftsmeny__tittel'>{props.tittelMedUnderTittel}</h1>
      </div>
    </div>
  );
};

export default BannerUtenVelger;
