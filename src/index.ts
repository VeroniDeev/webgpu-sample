import { positions, colors, verticeCount } from "./cubeInfo";
import { createUniformBuffer, createVertexBuffer } from "./utils/createBuffer";
import shader from "./shader.wgsl";
import { mat4 } from "gl-matrix";
import createViewProjection from "./utils/createViewProjection";
import createTransform from "./utils/createTransform";

const canvas = document.getElementById("webgpu") as HTMLCanvasElement;
const ctx = canvas.getContext("webgpu") as GPUCanvasContext;

const render = async () => {
  const adaptater = (await navigator.gpu.requestAdapter()) as GPUAdapter;
  const device = (await adaptater.requestDevice()) as GPUDevice;
  const format = "rgba8unorm";
  ctx.configure({
    device,
    format,
  });
  const verticeBuffer = createVertexBuffer(device, positions);
  const colorBuffer = createVertexBuffer(device, colors);
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
  const viewTexture = ctx.getCurrentTexture().createView();
  const depthTexture = device
    .createTexture({
      format: "depth24plus",
      size: [canvas.width, canvas.height, 1],
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    })
    .createView();
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
  const modelMatrix = mat4.create();
  const modelViewProjectionMatrix = mat4.create();
  const viewProjectionMatrix = createViewProjection(
    canvas.width / canvas.height
  );
  createTransform(modelMatrix);
  mat4.multiply(modelViewProjectionMatrix, viewProjectionMatrix, modelMatrix);
  device.queue.writeBuffer(
    uniformBuffer,
    0,
    modelViewProjectionMatrix as ArrayBuffer
  );

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
  .catch((err) => {
    console.log("You got an error");
    console.log("--------------------------------------------");
    console.log(err);
  });
