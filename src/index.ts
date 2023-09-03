import { positions, colors, verticeCount } from "./data/cubeInfo";
import { createUniformBuffer, createVertexBuffer } from "./utils/createBuffer";
import shader from "./shaders/cubeShader.wgsl";
import { mat4 } from "gl-matrix";
import createViewProjection from "./utils/createViewProjection";
import createTransform from "./utils/createTransform";
import "./styles/style.css";

const h1 = document.getElementById("handleError") as HTMLHeadingElement;

// The canvas part (make sure to change the ID with the canvas ID; usually, the canvas ID is the same here).
const canvas = document.getElementById("webgpu") as HTMLCanvasElement;
const ctx = canvas.getContext("webgpu") as GPUCanvasContext;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const render = async (): Promise<void> => {
  // We create a connexion between our application and the GPU with the adaptater and we request the GPU.
  // We configure the WebGPU environement.
  const adaptater = (await navigator.gpu.requestAdapter()) as GPUAdapter;
  const device = (await adaptater.requestDevice()) as GPUDevice;
  const format = "rgba8unorm";
  ctx.configure({
    device,
    format,
  });

  // We create two buffer the first is the vertices (to make the cube forms)
  // and the second is the color.
  const verticeBuffer = createVertexBuffer(device, positions);
  const colorBuffer = createVertexBuffer(device, colors);

  // pipelineRender is used for drawing on the canvas. We configure it with
  // vertices (in the vertex part) and colors (in both the vertex and fragment parts), specifying the drawing technique and depth.
  const pipelineRender = device.createRenderPipeline({
    layout: "auto",
    vertex: {
      module: device.createShaderModule({
        code: shader,
      }),
      entryPoint: "VertexShader",
      buffers: [
        {
          arrayStride: 12,
          attributes: [
            {
              format: "float32x3",
              offset: 0,
              shaderLocation: 0,
            },
          ],
        },
        {
          arrayStride: 12,
          attributes: [
            {
              format: "float32x3",
              offset: 0,
              shaderLocation: 1,
            },
          ],
        },
      ],
    },
    fragment: {
      module: device.createShaderModule({
        code: shader,
      }),
      entryPoint: "FragmentShader",
      targets: [
        {
          format,
        },
      ],
    },
    primitive: {
      topology: "triangle-list",
      cullMode: "back",
    },
    depthStencil: {
      depthCompare: "less",
      depthWriteEnabled: true,
      format: "depth24plus",
    },
  });

  // We create a uniform to configure the Model-View-Projection (MVP) matrix and bind it to location 0
  const uniformBuffer = createUniformBuffer(device);
  const uniformBindGroup = device.createBindGroup({
    layout: pipelineRender.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: uniformBuffer,
          offset: 0,
          size: 64,
        },
      },
    ],
  });

  // This part is used to configure the canvas for the view and depth.
  const viewTexture = ctx.getCurrentTexture().createView();
  const depthTexture = device
    .createTexture({
      format: "depth24plus",
      size: [canvas.width, canvas.height, 1],
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    })
    .createView();

  // This part is a configuration for the Render Pass.
  const renderPassDescriptor: GPURenderPassDescriptor = {
    colorAttachments: [
      {
        loadOp: "clear",
        storeOp: "store",
        clearValue: [0.4532, 0.345, 0.65, 1.0],
        view: viewTexture,
      },
    ],
    depthStencilAttachment: {
      depthClearValue: 1.0,
      view: depthTexture,
      depthLoadOp: "clear",
      depthStoreOp: "store",
    },
  };

  // We configure the Model View Projection Matrix here.
  const modelMatrix = mat4.create();
  const modelViewProjectionMatrix = mat4.create();
  const viewProjectionMatrix = createViewProjection(
    canvas.width / canvas.height,
    [-3, 3, 5]
  );
  createTransform(modelMatrix);
  mat4.multiply(modelViewProjectionMatrix, viewProjectionMatrix, modelMatrix);
  device.queue.writeBuffer(
    uniformBuffer,
    0,
    modelViewProjectionMatrix as ArrayBuffer
  );

  // We create and configure the Command Encoder and the Render Pass for drawing the scene.
  // We set up the vertices and color buffer, and we add the uniform group
  const commandEncoder = device.createCommandEncoder();
  const renderPass = commandEncoder.beginRenderPass(renderPassDescriptor);
  renderPass.setPipeline(pipelineRender);
  renderPass.setVertexBuffer(0, verticeBuffer);
  renderPass.setVertexBuffer(1, colorBuffer);
  renderPass.setBindGroup(0, uniformBindGroup);
  renderPass.draw(verticeCount);
  renderPass.end();

  device.queue.submit([commandEncoder.finish()]);
};

render()
  .then(() => {
    console.log("Finish with success");
  })
  .catch(() => {
    console.log(
      "You have no access to WebGPU. Please check: https://github.com/VeroniDeev/webgpu-sample/tree/main"
    );
    canvas.width = 0;
    canvas.height = 0;
    h1.innerHTML =
      "You have no access to WebGPU. Please check <a href='https://github.com/VeroniDeev/webgpu-sample/tree/main'>this github</a>";
  });
