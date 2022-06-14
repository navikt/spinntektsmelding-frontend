import React, { useState } from 'react';
import Bedriftsmeny from '@navikt/bedriftsmeny';
import '@navikt/bedriftsmeny/lib/bedriftsmeny.css';
import { createBrowserHistory, createMemoryHistory, History } from 'history';
import LocationState = History.LocationState;
import { Organisasjon as AltinnOrganisasjon } from '@navikt/bedriftsmeny/lib/organisasjon';
import useRoute from './useRoute';

export interface Organisasjon {
  Name: string;
  Type: string;
  OrganizationNumber: string;
  OrganizationForm: string;
  Status: string;
  ParentOrganizationNumber: any;
}

interface Props {
  tittelMedUnderTittel: string | JSX.Element;
  altinnOrganisasjoner: AltinnOrganisasjon[];
  onOrganisasjonChange?: any;
}

const getHistory = () => {
  if (typeof window === 'undefined') return createMemoryHistory();
  return createBrowserHistory();
};

const Banner: React.FunctionComponent<Props> = (props) => {
  const { tittelMedUnderTittel, altinnOrganisasjoner } = props;

  const [history] = useState<History<LocationState>>(getHistory());
  const setRoute = useRoute();

  const onOrganisasjonChange = (organisasjon?: Organisasjon) => {
    if (organisasjon) {
      setRoute(organisasjon.OrganizationNumber);
      if (props.onOrganisasjonChange) {
        props.onOrganisasjonChange(organisasjon);
      }
    }
  };

  return (
    <div>
      <Bedriftsmeny
        organisasjoner={altinnOrganisasjoner}
        sidetittel={tittelMedUnderTittel}
        history={history}
        onOrganisasjonChange={onOrganisasjonChange}
      />
    </div>
  );
};

export default Banner;
