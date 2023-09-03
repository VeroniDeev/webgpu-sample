import { mat4, vec3 } from "gl-matrix";

// This function is used to create a view projection matrix.
const createViewProjection = (
  aspect: number,
  positionDirection: vec3 = [0, 0, 5],
  lookDirection: vec3 = [0, 0, 0],
  upDirection: vec3 = [0, 1, 0]
) => {
  const viewProjectionMatrix = mat4.create();
  const viewMatrix = mat4.create();
  const projectionMatrix = mat4.create();
  mat4.lookAt(viewMatrix, positionDirection, lookDirection, upDirection);
  mat4.perspective(projectionMatrix, Math.PI / 4, aspect, 0.1, 100);
  mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);

  return viewProjectionMatrix;
};

export default createViewProjection;
