class Tournament {
  constructor(canvas, regoin) {
		this.canvas = canvas;
		this.regoin = regoin;
    this.defaults = {
      width: 2,
      color: "#5B5B5B",
      radius: 15,
      regionSelector: ".region",
    };
  }

  init(options) {
    this.options = { ...this.defaults, ...options };
    // this.canvas = document.getElementById("canvas");

		this.ctx = this.canvas.getContext("2d");
		this.bindEvents();
		this.render();
  }

  bindEvents() {
    window.addEventListener("resize", this.render.bind(this));

    document.querySelectorAll(".team").forEach((team) => {
      team.addEventListener("mouseenter", (e) => {
        const teamClass = `.team-${team.getAttribute("data-team")}`;
        document.querySelectorAll(teamClass).forEach((el) => {
          el.classList.add("team-hover");
          el.style.background = window.getComputedStyle(team).borderLeftColor;
        });
      });

      team.addEventListener("mouseleave", (e) => {
        const teamClass = `.team-${team.getAttribute("data-team")}`;
        document.querySelectorAll(teamClass).forEach((el) => {
          el.classList.remove("team-hover");
          el.style.background = "";
        });
      });
    });
  }

  render() {
    const w = document.documentElement.clientWidth;
    const h = document.documentElement.clientHeight;

    this.canvas.width = w * 2; // retina
    this.canvas.height = h * 2; // retina

    // this.canvas.style.width = `${w}px`;
    // this.canvas.style.height = `${h}px`;


    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.scale(2, 2); // retina

    document.querySelectorAll(this.options.regionSelector).forEach((region) => {

      region.querySelectorAll(".round").forEach((round, roundIndex) => {
        const nextGames = round.nextElementSibling?.querySelectorAll(".game");
        if (!nextGames) return;

        round.querySelectorAll(".game").forEach((game, gameIndex) => {
          const winner = game.querySelector(".team-winner");
          const nextGame = nextGames[Math.floor(gameIndex / 2)];
          const color = this.options.color;
          const width = winner ? this.options.width : 0.5;
          const calcFn = this.calcRight;
          const start = calcFn(winner || game);

          if (roundIndex === 0) {
            const endNode = winner
              ? nextGame.querySelector(`.team-${winner.getAttribute("data-team")}`)
              : nextGame;
            const calcEndFn = this.calcLeft;
            const end = calcEndFn(endNode);
            const radiusAdjust = Math.min(
              this.options.radius,
              Math.abs(start.y - end.y) / 2
            );
            this.drawSCurve(start, end, color, width, this.options.radius, radiusAdjust);
          } else {
            const end = this.calcCenter(nextGame);
            this.drawCurve(
              start,
              end,
              "horizontal",
              color,
              width,
              this.options.radius
            );
          }
        });
      });
    });
  }

  calcRight(element) {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.right,
      y: rect.top + rect.height / 2,
    };
  }

  calcLeft(element) {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left,
      y: rect.top + rect.height / 2,
    };
  }

  calcCenter(element) {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }

  drawLine(start, end) {
    this.ctx.moveTo(start.x, start.y);
    this.ctx.lineTo(end.x, end.y);
  }

  drawCurve(start, end, orientation, color, width, radius, radius2 = radius) {
    this.ctx.beginPath();
    const anchor = orientation === "horizontal"
      ? { x: end.x, y: start.y }
      : { x: start.x, y: end.y };

    const m1 = this.lineDistanceFromEnd(start, anchor, radius);
    const m2 = this.lineDistanceFromEnd(end, anchor, radius2);

    this.drawLine(start, m1);
    this.ctx.bezierCurveTo(m1.x, m1.y, anchor.x, anchor.y, m2.x, m2.y);
    this.drawLine(m2, end);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.lineCap = "square";
    this.ctx.stroke();
    this.ctx.closePath();
  }

  drawSCurve(start, end, color, width, radius, radius2) {
    const midpoint = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
    this.drawCurve(start, midpoint, "horizontal", color, width, radius, radius2);
    this.drawCurve(midpoint, end, "vertical", color, width, radius2, radius);
  }

  lineDistanceFromEnd(start, end, d) {
    let x = end.x;
    let y = end.y;

    if (end.x - start.x < 0) x += d; // left
    if (end.x - start.x > 0) x -= d; // right
    if (end.y - start.y < 0) y += d; // up
    if (end.y - start.y > 0) y -= d; // down

    return { x, y };
  }
}

export default Tournament;
