struct Uniforms {
    modelViewProjectionMatrix: mat4x4<f32>,
}

@binding(0) @group(0) var<uniform> uniforms: Uniforms;

struct Cube {
    @builtin(position) Position: vec4<f32>,
    @location(0) VertexColor: vec4<f32>,
}

@vertex
fn VertexShader(@location(0) posi: vec4<f32>, @location(1) color: vec4<f32>) -> Cube{
    var cube: Cube;
    cube.Position = uniforms.modelViewProjectionMatrix * posi;
    cube.VertexColor = color;
    return cube;
}

@fragment
fn FragmentShader(@location(0) VertexColor: vec4<f32>) -> @location(0) vec4<f32> {
    return VertexColor;
}