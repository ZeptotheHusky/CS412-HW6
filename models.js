function createCube() {
  const positions = new Float32Array([
    -1, -1,  1,   1, -1,  1,   1,  1,  1,  -1,  1,  1,   // front
     1, -1, -1,  -1, -1, -1,  -1,  1, -1,   1,  1, -1,   // back
    -1,  1,  1,   1,  1,  1,   1,  1, -1,  -1,  1, -1,   // top
    -1, -1, -1,   1, -1, -1,   1, -1,  1,  -1, -1,  1,   // bottom
     1, -1,  1,   1, -1, -1,   1,  1, -1,   1,  1,  1,   // right
    -1, -1, -1,  -1, -1,  1,  -1,  1,  1,  -1,  1, -1    // left
  ]);
  const faceNormals = [[0, 0, 1], [0, 0, -1], [0, 1, 0], [0, -1, 0], [1, 0, 0], [-1, 0, 0]];
  const normals = new Float32Array(faceNormals.flatMap(n => [...n, ...n, ...n, ...n]));

  // Tangent; bitangent = cross(N, T)
  const faceTangents = [[1, 0, 0], [-1, 0, 0], [1, 0, 0], [1, 0, 0], [0, 0, -1], [0, 0, 1]];
  const tangents = new Float32Array(faceTangents.flatMap(t => [...t, ...t, ...t, ...t]));

  const texCoords = new Float32Array(faceNormals.flatMap(() => [0, 0, 1, 0, 1, 1, 0, 1]));

  const indices = new Uint16Array([
     0,  1,  2,   0,  2,  3,   // front
     4,  5,  6,   4,  6,  7,   // back
     8,  9, 10,   8, 10, 11,   // top
    12, 13, 14,  12, 14, 15,   // bottom
    16, 17, 18,  16, 18, 19,   // right
    20, 21, 22,  20, 22, 23    // left
  ]);
  return { positions, normals, tangents, texCoords, indices };
}


function createCylinder(segments = 64, uRepeat = 3) {
  const positions = [], normals = [], tangents = [], texCoords = [], indices = [];

  // Side: theta grows with u, so T points along the circle and B = cross(N, T) points up
  for (let i = 0; i <= segments; i++) {
    const u = i / segments, theta = 2 * Math.PI * u;
    const s = Math.sin(theta), c = Math.cos(theta);
    for (const y of [-1, 1]) {
      positions.push(s, y, c);
      normals.push(s, 0, c);
      tangents.push(c, 0, -s);
      texCoords.push(u * uRepeat, (y + 1) / 2);
    }
  }
  for (let i = 0; i < segments; i++) {
    const k = 2 * i;
    indices.push(k, k + 2, k + 3, k, k + 3, k + 1);
  }

  // Caps: planar mapping of x, z into the texture, T = +x on both
  for (const y of [1, -1]) {
    const center = positions.length / 3;
    positions.push(0, y, 0);
    normals.push(0, y, 0);
    tangents.push(1, 0, 0);
    texCoords.push(0.5, 0.5);
    for (let i = 0; i <= segments; i++) {
      const theta = 2 * Math.PI * i / segments;
      const s = Math.sin(theta), c = Math.cos(theta);
      positions.push(s, y, c);
      normals.push(0, y, 0);
      tangents.push(1, 0, 0);
      texCoords.push(0.5 + 0.5 * s, 0.5 - 0.5 * y * c);  // keeps cross(N, T) along +v
    }
    for (let i = 0; i < segments; i++) {
      const a = center + 1 + i, b = a + 1;
      if (y > 0) indices.push(center, a, b);
      else indices.push(center, b, a);
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    tangents: new Float32Array(tangents),
    texCoords: new Float32Array(texCoords),
    indices: new Uint16Array(indices)
  };
}

function createSphere(latBands = 32, lonBands = 32) {
  const positions = [], normals = [], tangents = [], indices = [], texCoords = [];

  for (let lat = 0; lat <= latBands; lat++) {
    const phi = (lat / latBands) * Math.PI;
    const sinPhi = Math.sin(phi), cosPhi = Math.cos(phi);

    for (let lon = 0; lon <= lonBands; lon++) {
      const theta = (lon / lonBands) * 2 * Math.PI;
      const sinTheta = Math.sin(theta), cosTheta = Math.cos(theta);

      const x = sinPhi * cosTheta;
      const y = cosPhi;
      const z = sinPhi * sinTheta;

      positions.push(x, y, z);
      normals.push(x, y, z);
      tangents.push(-sinTheta, 0, cosTheta);
      texCoords.push(lon / lonBands, 1 - lat / latBands);
    }
  }

  for (let lat = 0; lat < latBands; lat++) {
    for (let lon = 0; lon < lonBands; lon++) {
      const a = lat * (lonBands + 1) + lon;
      const b = a + 1;
      const c = a + (lonBands + 1);
      const d = c + 1;
      indices.push(a, c, b,  b, c, d);
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    tangents: new Float32Array(tangents),
    texCoords: new Float32Array(texCoords),
    indices: new Uint16Array(indices),
  };
}

function createCone(segments = 64) {
  const positions = [], normals = [], tangents = [], texCoords = [], indices = [];

  for (let i = 0; i <= segments; i++) {
    const u = i / segments;
    const theta = u * 2 * Math.PI;
    const sinT = Math.sin(theta), cosT = Math.cos(theta);

    positions.push(sinT, -1, cosT);

    positions.push(0, 1, 0);

    tangents.push(cosT, 0, -sinT);
    tangents.push(cosT, 0, -sinT);

    texCoords.push(u, 0);
    texCoords.push(u, 1);

    normals.push(cosT * 0.707, 0.707, sinT * 0.707);
    normals.push(cosT * 0.707, 0.707, sinT * 0.707);
  }

  const center = positions.length / 3;
  positions.push(0, -1, 0);
  normals.push(0, -1, 0);
  tangents.push(1, 0, 0);
  texCoords.push(0.5, 0.5);
  for (let i = 0; i <= segments; i++) {
    const theta = 2 * Math.PI * i / segments;
    const s = Math.sin(theta), c = Math.cos(theta);
    positions.push(s, -1, c);
    normals.push(0, -1, 0);
    tangents.push(1, 0, 0);
    texCoords.push(0.5 + 0.5 * s, 0.5 - 0.5 * -1 * c);  // keeps cross(N, T) along +v
  }
  for (let i = 0; i < segments; i++) {
    const a = center + 1 + i, b = a + 1;
    indices.push(center, b, a);
  }

  for (let i = 0; i < segments; i++) {
    const k = 2 * i;
    indices.push(k, k + 2, k + 3,  k, k + 3, k + 1);
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    tangents: new Float32Array(tangents),
    texCoords: new Float32Array(texCoords),
    indices: new Uint16Array(indices),
  };
}

// bark!
function createTorus(r1 = 1, r2 = 0.4, innerBands = 32, outerBands = 32) {
  const positions = [], normals = [], tangents = [], indices = [], texCoords = [];

  for (let inner = 0; inner <= innerBands; inner++) {
    const phi = (inner / innerBands) * 2 * Math.PI;
    const sinPhi = Math.sin(phi), cosPhi = Math.cos(phi);

    for (let outer = 0; outer <= outerBands; outer++) {
      const theta = (outer / outerBands) * 2 * Math.PI;
      const sinTheta = Math.sin(theta), cosTheta = Math.cos(theta);

      const x = (r1 + r2 * cosPhi) * cosTheta;
      const y = r2 * sinPhi;
      const z = (r1 + r2 * cosPhi) * sinTheta;

      const nx = cosPhi * cosTheta;
      const ny = sinPhi;
      const nz = cosPhi * sinTheta;

      const tx = -sinTheta;
      const ty = 0;
      const tz = cosTheta;

      positions.push(x, y, z);
      normals.push(nx, ny, nz);
      tangents.push(tx, ty, tz);
      texCoords.push(theta / (2 * Math.PI), phi / (2 * Math.PI));
    }
  }

  for (let inner = 0; inner < innerBands; inner++) {
    for (let outer = 0; outer < outerBands; outer++) {
      const a = inner * (outerBands + 1) + outer;
      const b = a + 1;
      const c = a + (outerBands + 1);
      const d = c + 1;
      indices.push(a, c, b,  b, c, d);
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    tangents: new Float32Array(tangents),
    texCoords: new Float32Array(texCoords),
    indices: new Uint16Array(indices),
  };
}