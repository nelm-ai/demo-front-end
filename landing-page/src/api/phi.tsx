// pages/api/generate.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { prompt, temperature, topP, repeatPenalty, seed, maxSeqLen } =
      req.body;

    // Call the generateSequence function here, passing the necessary parameters
    const output = await generateSequence(
      prompt,
      temperature,
      topP,
      repeatPenalty,
      seed,
      maxSeqLen
    );

    res.status(200).json({ output });
  } catch (error) {
    console.error("Error generating sequence:", error);
    res.status(500).json({ error: "Error generating sequence" });
  }
}

async function generateSequence(
  prompt: string,
  temperature: number,
  topP: number,
  repeatPenalty: number,
  seed: number,
  maxSeqLen: number
): Promise<string> {
  // Implement the generateSequence function using the phiWorker.js file
  // and the MODELS/TEMPLATES objects
  const worker = new Worker("/phiWorker.js", { type: "module" });

  return new Promise((resolve, reject) => {
    worker.postMessage({
      prompt,
      temp: temperature,
      top_p: topP,
      repeatPenalty,
      seed,
      maxSeqLen,
      command: "start",
    });

    worker.addEventListener("message", (event) => {
      const { status, error, message, prompt, sentence } = event.data;
      if (error) {
        worker.terminate();
        reject(new Error(error));
      }
      if (status === "complete") {
        worker.terminate();
        resolve(prompt + sentence);
      }
    });
  });
}
