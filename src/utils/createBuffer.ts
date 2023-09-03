// This function is used to create a Vertex Buffer.
const createVertexBuffer = (
  device: GPUDevice,
  data: Float32Array,
  gpuUsage: GPUBufferUsageFlags = GPUBufferUsage.VERTEX |
    GPUBufferUsage.COPY_DST
) => {
  const buffer = device.createBuffer({
    size: data.byteLength,
    usage: gpuUsage,
    mappedAtCreation: true,
  });
  new Float32Array(buffer.getMappedRange()).set(data);
  buffer.unmap();
  return buffer;
};

// This function is used to create a Uniform Buffer.
const createUniformBuffer = (
  device: GPUDevice,
  gpuUsage: GPUBufferUsageFlags = GPUBufferUsage.UNIFORM |
    GPUBufferUsage.COPY_DST
) => {
  const buffer = device.createBuffer({
    size: 64,
    usage: gpuUsage,
  });
  return buffer;
};

export { createVertexBuffer, createUniformBuffer };
