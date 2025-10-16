import * as R from 'ramda';
import request from './utils/request.js';
import scriptData from './utils/scriptData.js';
import { BASE_URL } from './constants.js';
import { FALLBACK_MAPPINGS_DATASAFETY } from './mappings/datasafety.js';
import createDebug from 'debug';

const debug = createDebug('google-play-scraper:datasafety');

/**
 * Helper: mapea los datos de Data Safety
 */
export function mapDataEntries(dataEntries) {
  if (!dataEntries) return [];
  return dataEntries.flatMap(data => {
    const type = R.path([0, 1], data);
    const details = R.path([4], data) || [];
    return details.map(detail => ({
      data: R.path([0], detail),
      optional: R.path([1], detail),
      purpose: R.path([2], detail),
      type
    }));
  });
}

/**
 * Helper: mapea las prácticas de seguridad
 */
export function mapSecurityPractices(practices) {
  if (!practices) return [];
  return practices.map(practice => ({
    practice: R.path([1], practice),
    description: R.path([2, 1], practice)
  }));
}

/**
 * Función principal: extrae Data Safety de Google Play
 * Soporta modo debug activado con `DEBUG=google-play-scraper:datasafety`
 */
export default async function dataSafety(opts = {}) {
  if (!opts.appId) throw new Error('appId missing');
  opts.lang ||= 'en';

  const url = `${BASE_URL}/store/apps/datasafety?id=${opts.appId}&hl=${opts.lang}`;
  const options = Object.assign({ url, followRedirect: true }, opts.requestOptions);

  const html = await request(options, opts.throttle);
  const parsedData = scriptData.parse(html);

  // Debug mode: búsqueda de texto en ds:3
  if (opts.debug && opts.debugText) {
    const ds3 = parsedData['ds:3'];
    if (!ds3) throw new Error('ds:3 no encontrado en la página');

    const foundPaths = [];
    const search = (obj, path = []) => {
      if (obj === null || obj === undefined) return;
      if (typeof obj === 'string' && obj.includes(opts.debugText)) {
        foundPaths.push(path);
      } else if (Array.isArray(obj)) {
        obj.forEach((v, i) => search(v, [...path, i]));
      } else if (typeof obj === 'object') {
        Object.entries(obj).forEach(([k, v]) => search(v, [...path, k]));
      }
    };

    search(ds3);
    debug('Debug: paths encontrados para "%s": %O', opts.debugText, foundPaths);
    return { debugFoundPaths: foundPaths };
  }

  // Intentar todos los mappings de fallback
  for (const { name, mapping } of FALLBACK_MAPPINGS_DATASAFETY) {
    try {
      const result = scriptData.extractor(mapping)(parsedData);
      const hasData = Object.values(result).some(v => Array.isArray(v) ? v.length : v);
      if (hasData) {
        debug('DataSafety extraído usando mapping: %s', name);
        return result;
      } else {
        debug('Mapping %s no devolvió datos', name);
      }
    } catch (err) {
      debug('Error con mapping %s: %O', name, err);
    }
  }

  debug('Ningún mapping devolvió datos, devolviendo objeto vacío');
  return { sharedData: [], collectedData: [], securityPractices: [], privacyPolicyUrl: undefined };
}
