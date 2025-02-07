async function safelyParseJSON(possibleJsonData: Response): Promise<unknown> {
  let parsed;

  try {
    parsed = await possibleJsonData.json();
  } catch (e) {
    // eslint-disable-next-line no-undef
    console.error('Failed to parse JSON', e);
    parsed = [];
  }

  return parsed; // Could be undefined!
}

export default safelyParseJSON;
