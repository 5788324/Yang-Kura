import { promises as fs } from 'node:fs';
import type {
  ArtworkThumbnailGenerator,
  ArtworkThumbnailGenerationResult,
} from './artworkCacheService.js';

export function createElectronArtworkThumbnailGenerator(): ArtworkThumbnailGenerator {
  return async ({ sourceAbsolutePath, outputAbsolutePath, maxDimension }): Promise<ArtworkThumbnailGenerationResult> => {
    const { nativeImage } = await import('electron');
    const image = await nativeImage.createThumbnailFromPath(sourceAbsolutePath, {
      width: maxDimension,
      height: maxDimension,
    });
    if (image.isEmpty()) throw new Error('Electron nativeImage returned an empty thumbnail.');

    const png = image.toPNG();
    await fs.writeFile(outputAbsolutePath, png);
    const size = image.getSize();
    return {
      width: size.width,
      height: size.height,
      byteSize: png.byteLength,
    };
  };
}
