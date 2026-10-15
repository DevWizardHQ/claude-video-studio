import { Composition } from "remotion";
import { Tutorial, FPS } from "./Tutorial";
import { Slides } from "./Slides";
import meta from "../public/meta.json";
import brand from "../public/brand.json";

const frames = Math.ceil((brand.introSeconds + meta.innerDur + brand.outroSeconds) * FPS);

export const Root = () => (
  <>
  <Composition
    id="Tutorial"
    component={Tutorial}
    width={1920}
    height={1080}
    fps={FPS}
    durationInFrames={frames}
  />
  <Composition id="Slides" component={Slides} width={1920} height={1080} fps={FPS} durationInFrames={frames} />
  </>
);
