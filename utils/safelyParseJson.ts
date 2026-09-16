async function safelyParseJSON(possibleJsonData: Response): Promise<unknown> {
  let parsed;

  try {
    parsed = await possibleJsonData.json();
  } catch (e) {
    console.error('Failed to parse JSON:', e instanceof Error ? e.message : e);
    parsed = [];
  }

  return parsed; // Could be undefined!
}

export default safelyParseJSON;
