import { BodyShort, Box, Button, Heading, Link, List, Page, VStack } from '@navikt/ds-react';
import env from '../config/environment';

const NotFound = () => {
  return (
    <Page.Block as='main' width='xl' gutters>
      <Box paddingBlock='20 16'>
        <VStack gap='16'>
          <VStack gap='12' align='start'>
            <div>
              <Heading level='1' size='large' spacing>
                Beklager, vi fant ikke siden
              </Heading>
              <BodyShort>Denne siden kan være slettet eller flyttet, eller det er en feil i lenken.</BodyShort>
              <Box marginBlock='space-16' asChild>
                <List data-aksel-migrated-v8>
                  <List.Item>Bruk gjerne søket eller menyen</List.Item>
                  <List.Item>
                    <Link href='https://arbeidsgiver.nav.no'>Gå til forsiden</Link>
                  </List.Item>
                </List>
              </Box>
            </div>
            <Button as='a' href={env.saksoversiktUrl}>
              Gå til saksoversikten
            </Button>
          </VStack>

          <div>
            <Heading level='2' size='large' spacing>
              Page not found
            </Heading>
            <BodyShort spacing>The page you requested cannot be found.</BodyShort>
            <BodyShort>
              Go to the <Link href='https://arbeidsgiver.nav.no'>front page</Link>, or use one of the links in the menu.
            </BodyShort>
          </div>
        </VStack>
      </Box>
    </Page.Block>
  );
};

export default NotFound;
