/**
 * Utility functions for Niji tests.
 */

/**
 * Decode a `data:application/json;base64,...` token URI into a parsed JSON object.
 */
export function decodeTokenURI(uri: string): any {
  const jsonB64 = uri.replace('data:application/json;base64,', '');
  return JSON.parse(Buffer.from(jsonB64, 'base64').toString());
}
