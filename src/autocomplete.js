import { handleAjax } from "./common.js";

const { fromEvent } = rxjs;
const {
  debounceTime,
  map,
  distinctUntilChanged,
  share,
  partition,
  switchMap,
  pluck,
  tap,
  retry,
  finalize,
  merge
} = rxjs.operators;
const { ajax } = rxjs.ajax;

export default class AutoComplete {
  constructor($autocomplete) {
    this.render = this.render.bind(this);
    this.reset = this.reset.bind(this);

    this.$input = $autocomplete.querySelector("input");
    this.$layer = $autocomplete.querySelector(".layer");
    this.$loading = $autocomplete.querySelector(".loading");

    let [search$, reset$] = this.createKeyup$().pipe(
      partition(query => query.trim().length > 0)
    );

    search$ = search$.pipe(
      tap(() => this.showLoading()),
      switchMap(query => ajax.getJSON(`/bus/${query}`)),
      handleAjax("busRouteList"),
      retry(2),
      tap(() => this.hideLoading()),
      finalize(this.reset)
    );
    reset$ = reset$.pipe(
      merge(fromEvent(this.$layer, "click", evt => evt.target.closest("li")))
    );

    search$.subscribe(this.render);
    reset$.subscribe(this.reset);
  }

  createKeyup$() {
    return fromEvent(this.$input, "keyup").pipe(
      debounceTime(300),
      map(event => event.target.value),
      distinctUntilChanged(),
      share()
    );
  }

  showLoading() {
    this.$loading.style.display = "block";
  }

  hideLoading() {
    this.$loading.style.display = "none";
  }

  render(buses) {
    this.$layer.innerHTML = buses
      .map(bus =>
        `
<li>
  <a href="#${bus.routeId}_${bus.routeName}">
    <strong>${bus.routeName}</strong>
    <span>${bus.regionName}</span>
    <div>${bus.routeTypeName}</div>
  </a>
</li>
    `.trim()
      )
      .join("");

    this.$layer.style.display = "block";
  }

  reset() {
    this.hideLoading();
    this.$layer.style.display = "none";
  }
}
