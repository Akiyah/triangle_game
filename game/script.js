const L = 100;
const SVG = document.getElementById("svgField");

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

class Piece {
  static create(x, y, offset, mark) {
    if (mark === ".") {
      return new NullPiece(x, y, offset, mark);
    }

    if (mark === " ") {
      return new ClickablePiece(x, y, offset, mark);
    }

    return new BorderPiece(x, y, offset, mark);
  }

  constructor(x, y, offset, mark) {
    this.x = x;
    this.y = y;
    this.offset = offset;
    this.mark = mark;
  }

  vertexes() {
    console.log("Piece#vertexes");
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

  paths() {
    return [];
  }

  createPathElements() {
    return this.paths().map((path) => {
      const pathElement = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      let d = "";
      const p0 = path.lines[0];
      const p0_ = p0.plus(this.offset).m(L);
      d += "M " + p0_.x + " " + p0_.y;
      path.lines.slice(1).forEach((p) => {
        const p_ = p.plus(this.offset).m(L);
        d += "L " + p_.x + " " + p_.y;
      });
      pathElement.setAttribute("d", d);
      pathElement.setAttribute("stroke", path.stroke);
      pathElement.setAttribute("fill", path.fill);

      return pathElement;
    });
  }
}

class ClickablePiece extends Piece {
  paths() {
    const [p0, p1, p2] = this.vertexes();
    return [
      {
        lines: [p0, p1, p2, p0],
        stroke: "black",
        fill: "gray"
      }
    ];
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

  paths() {
    const [p0, p1, p2] = this.vertexes();
    if (this.mark === 0) {
    }

    //const p1_ = p1.ratio(1 / 4, p0);
    //const p2_ = p2.ratio(1 / 4, p0);

    const m = p1.ratio(1 / 2, p2);
    const h = p0.minus(m);

    const p1_ = p1.plus(h.m(1 / 4));
    const p2_ = p2.plus(h.m(1 / 4));
    const m_ = m.plus(h.m(1 / 4));

    return [
      {
        lines: [m, p1, p1_, m_, m],
        stroke: "black",
        fill: "aqua"
      },
      {
        lines: [m, p2, p2_, m_, m],
        stroke: "black",
        fill: "white"
      }
    ];
  }
}

class NullPiece extends Piece {}

class Stage {
  draw() {
    const offset = new Vector(1, 1);

    const LARGE_MAP = [
      "...0.0...",
      ".1     2.",
      "1       2",
      "2       1",
      ".2     1.",
      "...0.0..."
    ];

    const pieces = LARGE_MAP.map((row, y) => {
      return row.split("").map((mark, x) => {
        return Piece.create(x, y, offset, mark);
      });
    }).flat();

    pieces.forEach((piece) => {
      piece.createPathElements().forEach((pathElement) => {
        SVG.appendChild(pathElement);
      });
    });
  }
}

function draw() {
  new Stage().draw();
}

draw();