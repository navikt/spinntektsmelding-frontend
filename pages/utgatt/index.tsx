import { BugIcon } from '@navikt/aksel-icons';
import { BodyShort, Box, Button, Heading, Link, List, Page, VStack } from '@navikt/ds-react';
import environment from '../../config/environment';

const Utgatt = () => {
  return (
    <Page.Block as='main' width='xl' gutters>
      <Box paddingBlock='20 16'>
        <VStack gap='16'>
          <VStack gap='12' align='start'>
            <div>
              <Heading level='1' size='large' spacing>
                Saken er utgått
              </Heading>
              <BodyShort>NAV har ikke lenger behov for at du sender inn opplysninger i akkurat denne saken.</BodyShort>
              <List>
                <List.Item>
                  <Link href={environment.saksoversiktUrl}>Gå til saksoversikten for å finne dine uløste saker.</Link>
                </List.Item>
              </List>
            </div>
            <Button as='a' href='#'>
              Gå til Min side
            </Button>
          </VStack>
        </VStack>
      </Box>
    </Page.Block>
  );
};

export default Utgatt;
