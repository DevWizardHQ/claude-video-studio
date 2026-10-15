import { Composition } from "remotion";
import { Tutorial, FPS } from "./Tutorial";
import meta from "../public/meta.json";
import brand from "../public/brand.json";

export const Root = () => (
  <Composition
    id="Tutorial"
    component={Tutorial}
    width={1920}
    height={1080}
    fps={FPS}
    durationInFrames={Math.ceil((brand.introSeconds + meta.innerDur + brand.outroSeconds) * FPS)}
  />
);
