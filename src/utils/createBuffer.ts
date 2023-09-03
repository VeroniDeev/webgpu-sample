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
