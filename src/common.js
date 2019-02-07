const { map } = rxjs.operators;

export function handleAjax(property) {
  return obs$ =>
    obs$.pipe(
      map(jsonRes => {
        if (jsonRes.error) {
          if (jsonRes.error.code === "4") {
            return [];
          } else {
            throw jsonRes.error;
          }
        } else {
          if (Array.isArray(jsonRes[property])) {
            return jsonRes[property];
          } else {
            if (jsonRes[property]) {
              return [jsonRes[property]];
            } else {
              return [];
            }
          }
        }
      })
    );
}
