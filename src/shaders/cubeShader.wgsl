// We create a Uniforms struct and place the model view projection matrix inside it. 
struct Uniforms {
    modelViewProjectionMatrix: mat4x4<f32>,
}

// We bind the uniforms variable to location 0.
@binding(0) @group(0) var<uniform> uniforms: Uniforms;

struct Cube {
    @builtin(position) Position: vec4<f32>,
    @location(0) VertexColor: vec4<f32>,
}

// We create a Vertex Shader for the cube.
@vertex
fn VertexShader(@location(0) posi: vec4<f32>, @location(1) color: vec4<f32>) -> Cube{
    var cube: Cube;
    cube.Position = uniforms.modelViewProjectionMatrix * posi;
    cube.VertexColor = color;
    return cube;
}

// We create a Fragment Shader for the cube.
@fragment
fn FragmentShader(@location(0) VertexColor: vec4<f32>) -> @location(0) vec4<f32> {
    return VertexColor;
}