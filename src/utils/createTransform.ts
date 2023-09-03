import { mat4, vec3 } from "gl-matrix";

// This function is used to create a transformation for the model matrix.
const createTransform = (
  model: mat4,
  rotation: vec3 = [0, 0, 0],
  translation: vec3 = [0, 0, 0],
  scaling: vec3 = [1, 1, 1]
) => {
  const rotateXMatrix = mat4.create();
  const rotateYMatrix = mat4.create();
  const rotateZMatrix = mat4.create();
  const translationMatrix = mat4.create();
  const scalingMatrix = mat4.create();

  mat4.fromXRotation(rotateXMatrix, rotation[0]);
  mat4.fromXRotation(rotateYMatrix, rotation[1]);
  mat4.fromXRotation(rotateZMatrix, rotation[2]);
  mat4.fromTranslation(translationMatrix, translation);
  mat4.fromScaling(scalingMatrix, scaling);

  mat4.multiply(model, rotateXMatrix, scalingMatrix);
  mat4.multiply(model, rotateYMatrix, model);
  mat4.multiply(model, rotateZMatrix, model);
  mat4.multiply(model, translationMatrix, model);
};

export default createTransform;
