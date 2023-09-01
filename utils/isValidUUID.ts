export default function isValidUUID(uuid: string | undefined): boolean {
  const regexExp = /^[0-9A-F]{8}\b-[0-9A-F]{4}\b-[0-9A-F]{4}\b-[0-9A-F]{4}\b-[0-9A-F]{12}$/gi;

  if (!uuid) {
    return false;
  }

  return regexExp.test(uuid);
}
