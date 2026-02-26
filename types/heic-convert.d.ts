declare module "heic-convert" {
  function convert(input: {
    buffer: Buffer;
    format: "JPEG" | "PNG";
    quality?: number;
  }): Promise<ArrayBuffer | Buffer>;
  export = convert;
}
