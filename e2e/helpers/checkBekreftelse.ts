export default async function checkBekreftelse(page: any) {
  return page.getByLabel('Jeg bekrefter at opplysningene jeg har gitt, er riktige og fullstendige.').check();
  // .dispatchEvent('check');
}
