/** Shared by scene artwork, static thumbnails and the opaque transition layer.
 * Keep these in sync by construction rather than copying gradients into CSS. */
export const SCENE_SURFACES = {
  maple: 'linear-gradient(180deg, #f2e4d8 0%, #ede0cc 55%, #e6d0ac 100%)',
  sakura: 'linear-gradient(180deg, #f8ecee 0%, #f9f1ee 45%, #f4e2df 100%)',
  campfire: 'linear-gradient(180deg, #252a31 0%, #302b29 62%, #3a2e28 100%)',
  rainbow: 'radial-gradient(ellipse at 80% 14%, #ffffff 0%, transparent 58%), linear-gradient(155deg, #eaf3f9, #fafcfd 54%, #f1f6fa)',
  ripples: 'radial-gradient(ellipse at 48% 40%, #edf3ef 10%, #d8e5df 65%, #b7cec5 100%)',
} as const
