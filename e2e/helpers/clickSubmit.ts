export default async function clickSubmit(page: any) {
  return page.getByRole('button', { name: 'Send' }).click();
}
