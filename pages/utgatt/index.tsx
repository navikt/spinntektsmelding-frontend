import { BodyShort, Box, Button, Heading, Link, List, Page, VStack } from '@navikt/ds-react';
import environment from '../../config/environment';

const Utgatt = () => {
  return (
    <Page.Block as='main' width='xl' gutters>
      <Box paddingBlock='space-80 space-64'>
        <VStack gap='space-64'>
          <VStack gap='space-48' align='start'>
            <div>
              <Heading level='1' size='large' spacing>
                Saken er utgått
              </Heading>
              <BodyShort>Nav har ikke lenger behov for at du sender inn opplysninger i akkurat denne saken.</BodyShort>
              <Box marginBlock='space-16' asChild>
                <List data-aksel-migrated-v8>
                  <List.Item>
                    <Link href={environment.saksoversiktUrl}>Gå til saksoversikten for å finne dine saker.</Link>
                  </List.Item>
                </List>
              </Box>
            </div>
            <Button as='a' href={environment.minSideArbeidsgiver}>
              Gå til Min side
            </Button>
          </VStack>
        </VStack>
      </Box>
    </Page.Block>
  );
};

export default Utgatt;
