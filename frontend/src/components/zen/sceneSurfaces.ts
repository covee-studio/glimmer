/** Shared by scene artwork, static thumbnails and the opaque transition layer.
 * Keep these in sync by construction rather than copying gradients into CSS. */
export const SCENE_SURFACES = {
  maple: 'linear-gradient(180deg, #f2e4d8 0%, #ede0cc 55%, #e6d0ac 100%)',
  sakura: 'linear-gradient(180deg, #f8ecee 0%, #f9f1ee 45%, #f4e2df 100%)',
  campfire: 'linear-gradient(180deg, #252a31 0%, #302b29 62%, #3a2e28 100%)',
  rainbow: 'radial-gradient(ellipse at 83% 8%, #fffdf5 0%, transparent 54%), linear-gradient(155deg, #c5dce9, #eaf4f9 48%, #e2edf3)',
  ripples: 'radial-gradient(ellipse at 48% 40%, #f3f7f7 10%, #e5efef 65%, #cadfdf 100%)',
  mist: 'linear-gradient(165deg, #cfdfec 0%, #eaf2f8 48%, #d7e5f0 100%)',
  bamboo: 'radial-gradient(ellipse at 52% 34%, #f7fbf9b3, transparent 70%), linear-gradient(155deg, #dfede7, #f0f6f2 65%, #d1e4db)',
  ocean: 'linear-gradient(180deg, #e5f1fa 0%, #f3f9fd 43%, #dfedf8 64%, #bbd7ed 100%)',
} as const
