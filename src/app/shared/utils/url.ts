export function urlSearchParamsToJSON(params: URLSearchParams): Object {
  const json = {};

  params.toString().split('&').forEach(pair => {
    if (pair.length) {
      const pairAsArray = pair.split('=');
      const key = pairAsArray[ 0 ];
      json[ key ] = decodeURIComponent(pairAsArray[ 1 ]);
    }
  });

  return json;
}
