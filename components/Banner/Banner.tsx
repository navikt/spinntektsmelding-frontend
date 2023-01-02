import React, { useCallback } from 'react';
import Bedriftsmeny from './BedriftsmenyComponent';
import '@navikt/bedriftsmeny/lib/bedriftsmeny.css';
import { Organisasjon as AltinnOrganisasjon } from '@navikt/bedriftsmeny/lib/organisasjon';
import useRoute from './useRoute';
import { useRouter } from 'next/router';

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
  altinnOrganisasjoner?: AltinnOrganisasjon[];
  onOrganisasjonChange?: any;
  slug?: string;
}

const Banner: React.FunctionComponent<Props> = (props) => {
  const { tittelMedUnderTittel, altinnOrganisasjoner } = props;

  const setRoute = useRoute();

  const onOrganisasjonChange = (organisasjon?: Organisasjon) => {
    if (organisasjon) {
      setRoute(organisasjon.OrganizationNumber);
      if (props.onOrganisasjonChange) {
        props.onOrganisasjonChange(organisasjon);
      }
    }
  };

  const { query, push } = useRouter();
  const useOrgnrHook: () => [string | null, (orgnr: string) => void] = useCallback(() => {
    const currentOrgnr = typeof query.bedrift === 'string' ? query.bedrift : null;

    return [
      currentOrgnr,
      (orgnr: string) => {
        if (currentOrgnr !== orgnr && props.slug) {
          if (orgnr === null) {
            push(props.slug || '');
          } else {
            push(`${props.slug || ''}?bedrift=${orgnr}`);
          }
        }
      }
    ];
  }, [push, query.bedrift, props.slug]);

  return (
    <div>
      <Bedriftsmeny
        orgnrSearchParam={useOrgnrHook}
        organisasjoner={altinnOrganisasjoner}
        sidetittel={tittelMedUnderTittel}
        onOrganisasjonChange={onOrganisasjonChange}
      />
    </div>
  );
};

export default Banner;
