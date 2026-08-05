import { test, expect } from '@playwright/test';
import { FormPage } from './utils/formPage';
import AxeBuilder from '@axe-core/playwright';

const uuid = '003E69AE-EAA6-4E97-BACD-CD8194BB2828';
const baseUrl = `http://localhost:3000/im-dialog/${uuid}`;

test.describe('Utfylling av skjema - ikke behov for inntekt', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
  });

  test('Det er ikke behov for å be om inntekt', async ({ page }) => {
    const formPage = new FormPage(page);

    await formPage.assertVisibleText('Vi trenger ikke informasjon om inntekt for dette sykefraværet.');

    await formPage.checkRadioButton('Betaler arbeidsgiver ut full lønn i arbeidsgiverperioden?', 'Ja');

    await formPage.checkRadioButton('Betaler arbeidsgiver lønn og krever refusjon under sykefraværet?', 'Nei');

    await formPage.checkCheckbox('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.');

    // Accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);

    // assert request payload
    const reqPromise = page.waitForRequest('*/**/api/innsendingInntektsmelding');
    await page.getByRole('button', { name: 'Send' }).click();
    const req = await reqPromise;
    const body = JSON.parse(req.postData()!);
    expect(body).toEqual({
      forespoerselId: uuid,
      agp: {
        perioder: [{ fom: '2023-08-25', tom: '2023-09-09' }],
        redusertLoennIAgp: null
      },
      inntekt: null,
      refusjon: null,
      avsenderTlf: '12345678',
      naturalytelser: [],
      flereArbeidsforhold: null
    });

    await expect(page.locator("h2:has-text('Kvittering - innsendt inntektsmelding')")).toBeVisible();
  });
});
