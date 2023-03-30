export default function isValidUUID(uuid: string): boolean {
  const regexExp = /^[0-9A-F]{8}\b-[0-9A-F]{4}\b-[0-9A-F]{4}\b-[0-9A-F]{4}\b-[0-9A-F]{12}$/gi;

  return regexExp.test(uuid);
}
