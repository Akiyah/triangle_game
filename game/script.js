const L = 100;
const SVG = document.getElementById("svgField");
const OFFSET = [1, 1];

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  lift(surface) {
    return new Vector(this.x, this.y, surface(this.x, this.y));
  }

  toArray() {
    return [this.x, this.y];
  }

  m(t) {
    return new Vector(this.x * t, this.y * t);
  }

  plus(a) {
    return new Vector(this.x + a.x, this.y + a.y);
  }

  minus(a) {
    return this.plus(a.m(-1));
  }

  orthogonal() {
    return new Vector(this.y, -this.x); // turn right 90 degree
  }

  ratio(p, a) {
    return this.plus(a.minus(this).m(p));
  }

  innerProduct(v) {
    return this.x * v.x + this.y * v.y;
  }

  norm() {
    return Math.sqrt(this.innerProduct(this));
  }

  normalize() {
    return this.m(1 / this.norm());
  }

  center(v) {
    return this.ratio(1 / 2, v);
  }

  rotate(theta) {
    return new Vector(
      this.x * Math.cos(theta) - this.y * Math.sin(theta),
      this.x * Math.sin(theta) + this.y * Math.cos(theta)
    );
  }
}

class Path {
  constructor(lines, params) {
    this.lines = lines;

    this.element = this.createElement();
    this.update(params);
  }

  createElement() {
    const element = document.createElementNS("http://www.w3.org/2000/svg", "path");
    let d = "";
    const offset = new Vector(...OFFSET);
    const p0 = this.lines[0];
    const p0_ = p0.plus(offset).m(L);
    d += "M " + p0_.x + " " + p0_.y;
    this.lines.slice(1).forEach((p) => {
      const p_ = p.plus(offset).m(L);
      d += "L " + p_.x + " " + p_.y;
    });
    element.setAttribute("d", d);

    return element;
  }

  update(params) {
    if (params.stroke) {
      this.element.setAttribute("stroke", params.stroke);
    }
    if (params.fill) {
      this.element.setAttribute("fill", params.fill);
    }
    if (params.mouseenter) {
      this.element.addEventListener("mouseenter", (event) => { params.mouseenter(this.element, event); });
    }
    if (params.mouseleave) {
      this.element.addEventListener("mouseleave", (event) => { params.mouseleave(this.element, event); });
    }
    if (params.mouseover) {
      this.element.addEventListener("mouseover", (event) => { params.mouseover(this.element, event); });
    }
    if (params.mouseout) {
      this.element.addEventListener("mouseout", (event) => { params.mouseout(this.element, event); });
    }
    if (params.mouseclick) {
      this.element.addEventListener("mouseclick", (event) => { params.mouseclick(this.element, event); });
    }
  }
}

class Piece {
  static create(x, y, mark, onReset) {
    if (mark === ".") {
      return new NullPiece(x, y, mark, onReset);
    }

    if (mark === " ") {
      return new ClickablePiece(x, y, mark, onReset);
    }

    return new BorderPiece(x, y, mark, onReset);
  }

  constructor(x, y, mark, onReset) {
    this.x = x;
    this.y = y;
    this.mark = mark;
    this.onReset = onReset;

    this.paths = this.createPaths();
  }

  vertexes() {
    const t = (this.x + this.y) % 2 === 0 ? -1 : 1;
    const center = new Vector(this.x / 2, (this.y / 2) * Math.sqrt(3));

    const q0 = new Vector(0, (-Math.sqrt(3) / 4) * t);
    const q1 = new Vector((1 / 2) * t, (Math.sqrt(3) / 4) * t);
    const q2 = new Vector((-1 / 2) * t, (Math.sqrt(3) / 4) * t);

    const p0 = center.plus(q0);
    const p1 = center.plus(q1);
    const p2 = center.plus(q2);

    return [p0, p1, p2];
  }

  createPaths() {
    return [];
  }

  reset() {
  }
}

class ClickablePiece extends Piece {
  mouseenter(element, event, i) {
    //element.classList.add('over');
    this.onReset();

    this.paths[1].element.classList.add('over_w');
    this.paths[2].element.classList.add('over_w');
    this.paths[3].element.classList.add('over_w');
    this.paths[4].element.classList.add('over_w');

    this.paths[i].element.classList.remove('over_w');
    this.paths[i].element.classList.add('over');
  }

  mouseleave(element, event, i) {
    console.log(`mouseleave ${this.x} ${this.y} ${i}`);
    this.onReset();
  }

  mouseout(element, event, i) {
    console.log(`mouseout ${this.x} ${this.y} ${i}`);
    //element.classList.remove('over');
  }

  createPaths() {
    const [p0, p1, p2] = this.vertexes();
    const p01 = p0.ratio(1 / 2, p1);
    const p12 = p1.ratio(1 / 2, p2);
    const p20 = p2.ratio(1 / 2, p0);

    return [
      new Path(
        [p0, p1, p2, p0],
        {
          stroke: "black",
          fill: "gray",
          mouseleave: (element, event) => this.mouseleave(element, event, 0),
          mouseout: (element, event) => this.mouseout(element, event, 0),
        }
      ),
      new Path(
        [p0, p01, p20, p0],
        {
          fill: "gray",
          mouseenter: (element, event) => this.mouseenter(element, event, 1),
          //mouseleave: (element, event) => this.mouseleave(element, event, 1),
          //mouseout: (element, event) => this.mouseout(element, event, 1),
          mouseclick: (element, event) => { }
        }
      ),
      new Path(
        [p1, p12, p01, p1],
        {
          fill: "gray",
          mouseenter: (element, event) => this.mouseenter(element, event, 2),
          //mouseleave: (element, event) => this.mouseleave(element, event, 2),
          //mouseout: (element, event) => this.mouseout(element, event, 2),
          mouseclick: (element, event) => { }
        }
      ),
      new Path(
        [p2, p20, p12, p2],
        {
          fill: "gray",
          mouseenter: (element, event) => this.mouseenter(element, event, 3),
          //mouseleave: (element, event) => this.mouseleave(element, event, 3),
          //mouseout: (element, event) => this.mouseout(element, event, 3),
          mouseclick: (element, event) => { }
        }
      ),
      new Path(
        [p01, p12, p20, p01],
        {
          fill: "gray",
          //mouseleave: (element, event) => this.mouseleave(element, event, 4),
          //mouseout: (element, event) => this.mouseout(element, event, 4)
        }
      )
    ];
  }

  reset() {
    this.paths[1].element.classList.remove('over');
    this.paths[2].element.classList.remove('over');
    this.paths[3].element.classList.remove('over');
    this.paths[4].element.classList.remove('over');

    this.paths[1].element.classList.remove('over_w');
    this.paths[2].element.classList.remove('over_w');
    this.paths[3].element.classList.remove('over_w');
    this.paths[4].element.classList.remove('over_w');
  }
}

class BorderPiece extends Piece {
  vertexes() {
    const [p0, p1, p2] = super.vertexes();

    if (this.mark == 1) {
      return [p1, p2, p0];
    }

    if (this.mark == 2) {
      return [p2, p0, p1];
    }

    return [p0, p1, p2];
  }

  createPaths() {
    const [p0, p1, p2] = this.vertexes();

    const m = p1.ratio(1 / 2, p2);
    const h = p0.minus(m);

    const p1_ = p1.plus(h.m(1 / 4));
    const p2_ = p2.plus(h.m(1 / 4));
    const m_ = m.plus(h.m(1 / 4));

    return [
      new Path(
        [m, p1, p1_, m_, m],
        {
          stroke: "black",
          fill: "aqua"
        }
      ),
      new Path(
        [m, p2, p2_, m_, m],
        {
          stroke: "black",
          fill: "white"
        }
      )
    ];
  }
}

class NullPiece extends Piece { }

class Stage {
  draw() {
    const LARGE_MAP = [
      "...0.0...",
      ".1     2.",
      "1       2",
      "2       1",
      ".2     1.",
      "...0.0..."
    ];

    this.pieces = LARGE_MAP.map((row, y) => {
      return row.split("").map((mark, x) => {
        return Piece.create(x, y, mark, () => { this.reset(); });
      });
    }).flat();

    this.pieces.forEach((piece) => {
      piece.paths.forEach((path) => {
        SVG.appendChild(path.element);
      });
    });
  }

  reset() {
    console.log(this);
    this.pieces.forEach((piece) => {
      piece.reset();
    });
  }
}

function draw() {
  new Stage().draw();
}

draw();