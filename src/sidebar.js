import { parseHash } from "./common.js";

export default class Sidebar {
  constructor($sidebar) {
    this.$sidebar = $sidebar;
    this.$list = $sidebar.querySelector("ul");
    this.$title = $sidebar.querySelector(".title");
  }

  render(stations) {
    const { routeNum } = parseHash();

    this.$title.innerHTML = `${routeNum} 버스 노선`;
    this.$list.innerHTML = stations
      .map(station =>
        `
<li>
  <div class="line">
    <span class="line_detail"></span>
    <span class="direction">
      <i class="fas fa-chevron-circle-down"></i>
    </span>
  </div>
  <div class="text">
    <strong>${station.stationName}</strong>
  </div>
</li>
    `.trim()
      )
      .join("");
    this.$sidebar.style.display = "block";
  }

  close() {
    this.$sidebar.style.display = "none";
  }
}
