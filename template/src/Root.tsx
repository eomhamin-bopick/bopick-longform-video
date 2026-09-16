import { Composition } from "remotion";
import { Episode } from "./Episode";
import { TL } from "./lib/data";
export const RemotionRoot = () => (
  <Composition id="Episode" component={Episode} durationInFrames={TL.outFrames} fps={TL.fps} width={TL.width} height={TL.height} />
);
