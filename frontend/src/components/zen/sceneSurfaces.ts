/** Shared by scene artwork, static thumbnails and the opaque transition layer.
 * Keep these in sync by construction rather than copying gradients into CSS. */
export const SCENE_SURFACES = {
  sakura: 'linear-gradient(180deg, #f8ecee 0%, #f9f1ee 45%, #f4e2df 100%)',
  bamboo: 'radial-gradient(ellipse at 52% 34%, #f7fbf9b3, transparent 70%), linear-gradient(155deg, #dfede7, #f0f6f2 65%, #d1e4db)',
} as const
