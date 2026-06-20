import { isAddress } from 'viem';

/**
 * Get address from query param
 *
 * @param paramName query param name e.g. for the URL `/delegate?to=0xabc...` `to` is the paramName
 * @param useLocationResult string returned by react-router useLocation
 */
export const getAddressFromQueryParams = (
  paramName: string,
  useLocationResult: string,
): string | undefined => {
  const splitLocationResult = useLocationResult
    .split('=')
    .map((s: string) => s.replace('?', '').replace('&', ''));

  const paramIndex = splitLocationResult.indexOf(paramName);
  if (paramIndex < 0 || paramIndex === splitLocationResult.length - 1) {
    return undefined;
  }

  const maybeAddress = splitLocationResult[paramIndex + 1];

  if (maybeAddress.endsWith('.eth') || maybeAddress.endsWith(encodeURIComponent('.⌐◨-◨'))) {
    return decodeURIComponent(maybeAddress);
  }

  return isAddress(maybeAddress) ? maybeAddress : undefined;
};
