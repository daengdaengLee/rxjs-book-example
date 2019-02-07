const { merge, fromEvent, Observable } = rxjs;
const { map, share, partition, switchMap, pluck, first } = rxjs.operators;
const { ajax } = rxjs.ajax;

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

export function createShare$() {
  const changedHash$ = merge(
    fromEvent(window, "load"),
    fromEvent(window, "hashchange")
  ).pipe(map(() => parseHash(), share()));

  let [render$, search$] = changedHash$.pipe(
    partition(({ routeId }) => routeId)
  );

  render$ = render$.pipe(
    switchMap(({ routeId }) => ajax.getJSON(`/station/pass/${routeId}`)),
    handleAjax("busRouteStationList")
  );

  return {
    render$,
    search$: search$.pipe(geolocation)
  };
}

export function parseHash() {
  const [routeId, routeNum] = location.hash.substring(1).split("_");
  return {
    routeId,
    routeNum
  };
}

function geolocation(obs$) {
  const defaultPosition = {
    coords: {
      longitude: 126.9783882,
      latitude: 37.5666103
    }
  };

  return new Observable(observer => {
    if (navigator.geolocation) {
      window.navigator.geolocation.getCurrentPosition(
        position => observer.next(position),
        error => observer.next(defaultPosition),
        { timeout: 1000 }
      );
    } else {
      observer.next(defaultPosition);
    }
  }).pipe(
    pluck("coords"),
    first()
  );
}
