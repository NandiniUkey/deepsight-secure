import { useState, useEffect, useRef } from "react";
import * as tmImage from "@teachablemachine/image";

const MODEL_URL = "/model/";

interface Prediction {
  className: string;
  probability: number;
}

export function useTeachableModel() {
  const modelRef = useRef<tmImage.CustomMobileNet | null>(null);
  const [modelReady, setModelReady] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const model = await tmImage.load(
          MODEL_URL + "model.json",
          MODEL_URL + "metadata.json"
        );
        if (!cancelled) {
          modelRef.current = model;
          setModelReady(true);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load TM model:", err);
          setModelError("Failed to load detection model");
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const predict = async (imageElement: HTMLImageElement | HTMLCanvasElement): Promise<Prediction[]> => {
    if (!modelRef.current) throw new Error("Model not loaded");
    return modelRef.current.predict(imageElement);
  };

  return { modelReady, modelError, predict };
}
